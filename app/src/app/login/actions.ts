"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function loginWithGoogle() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=oauth_failed");
  }

  if (data.url) {
    redirect(data.url);
  }
}
