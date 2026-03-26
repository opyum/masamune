"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.SITE_URL || "http://72.62.181.156:3080"}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // If email already exists (identities empty)
  if (data?.user?.identities?.length === 0) {
    redirect("/signup?error=email_already_registered");
  }

  // If user is auto-confirmed (session exists), go directly to dashboard
  if (data?.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // Otherwise, email confirmation is needed
  redirect("/signup?success=check_email");
}
