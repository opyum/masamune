import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function POST() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.SITE_URL}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
