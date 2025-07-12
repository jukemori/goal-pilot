"use server";

import { createClient } from "@/lib/supabase/server";

export async function ensureUserProfile() {
  const supabase = await createClient();

  // Get the current user from auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  // Check if user profile exists in our users table
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist, create it
  if (!existingProfile) {
    console.log("Creating user profile for:", user.id);

    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    });

    if (insertError) {
      console.error("Failed to create user profile:", insertError);
      throw new Error(`Failed to create user profile: ${insertError.message}`);
    }
  }

  return user;
}
