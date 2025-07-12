import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/app/actions/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      try {
        // Ensure user profile exists after email verification
        await ensureUserProfile();

        // Successfully verified and profile created, redirect to dashboard
        return NextResponse.redirect(redirectTo);
      } catch (profileError) {
        console.error(
          "Profile creation error after email verification:",
          profileError,
        );
        // Even if profile creation fails, still redirect to dashboard
        // The middleware will handle creating the profile later
        return NextResponse.redirect(redirectTo);
      }
    }
  }

  // If there's an error, redirect to error page
  redirectTo.pathname = "/auth/error";
  return NextResponse.redirect(redirectTo);
}
