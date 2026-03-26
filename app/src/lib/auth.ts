import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  // Ensure user exists in our DB
  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
        },
      });
    }

    return { user: dbUser, error: null };
  } catch (dbError: unknown) {
    const msg = dbError instanceof Error ? dbError.message : "Unknown DB error";
    console.error("[auth] Database error:", msg);
    // DB not ready — return auth user info without DB sync
    return { user: { id: user.id, email: user.email!, plan: "free" as const, stripeCustomerId: null, createdAt: new Date() }, error: null };
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
