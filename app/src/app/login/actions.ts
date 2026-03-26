"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    redirect("/login?error=" + encodeURIComponent("Une erreur est survenue. Réessayez."));
  }
}

export async function loginWithGoogle() {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.SITE_URL || "http://72.62.181.156:3080"}/auth/callback`,
      },
    });

    if (error || !data.url) {
      redirect("/login?error=" + encodeURIComponent("Échec de la connexion Google."));
    }

    redirect(data.url);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    redirect("/login?error=" + encodeURIComponent("Une erreur est survenue. Réessayez."));
  }
}
