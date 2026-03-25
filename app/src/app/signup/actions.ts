"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect("/signup?error=signup_failed");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
