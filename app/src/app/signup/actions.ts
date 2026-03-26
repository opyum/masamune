"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.SITE_URL || "http://72.62.181.156:3080"}/auth/callback`,
      },
    });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    // Email already registered (identities empty or undefined)
    if (!data?.user?.identities || data.user.identities.length === 0) {
      redirect("/signup?error=" + encodeURIComponent("Cette adresse email est déjà utilisée."));
    }

    // If autoconfirm: session exists, go to dashboard
    if (data?.session) {
      revalidatePath("/", "layout");
      redirect("/dashboard");
    }

    // Try to sign in immediately (autoconfirm may not return session in signUp)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!loginError) {
      revalidatePath("/", "layout");
      redirect("/dashboard");
    }

    // Fallback: email confirmation needed
    redirect("/signup?success=check_email");
  } catch (e: unknown) {
    // redirect() throws a NEXT_REDIRECT error - let it through
    if (e && typeof e === "object" && "digest" in e) throw e;
    redirect("/signup?error=" + encodeURIComponent("Une erreur est survenue. Réessayez."));
  }
}
