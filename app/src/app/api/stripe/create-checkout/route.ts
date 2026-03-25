import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PLANS, PlanKey } from "@/lib/stripe-products";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const body = await req.json();
  const { plan, interval = "monthly" } = body as {
    plan: PlanKey;
    interval: "monthly" | "yearly";
  };

  const planConfig = PLANS[plan];
  if (!planConfig || plan === "free") {
    return NextResponse.json(
      { error: "Invalid plan" },
      { status: 400 }
    );
  }

  const priceId =
    interval === "yearly"
      ? planConfig.stripePriceIdYearly
      : planConfig.stripePriceIdMonthly;

  if (!priceId) {
    return NextResponse.json(
      { error: "Price not configured" },
      { status: 400 }
    );
  }

  // Reuse existing Stripe customer or create one
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    // Update user with Stripe customer ID (import prisma inline to avoid circular deps)
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    success_url: `${process.env.SITE_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.SITE_URL}/pricing?checkout=cancelled`,
    metadata: { userId: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
