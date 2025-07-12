import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next =
    searchParams.get("next") ?? searchParams.get("redirectTo") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create user profile if it doesn't exist
      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name:
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "User",
        })
        .select()
        .single();

      // Ignore error if user already exists
      if (profileError && !profileError.message.includes("duplicate key")) {
        console.error("Profile creation error:", profileError);
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
