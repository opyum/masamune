import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { addJob } from "@/lib/queue";
import { Plan } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;

  // Handle domain purchase
  if (metadata?.type === "domain_purchase") {
    const { domainName, siteId, userId } = metadata;
    if (domainName && siteId && userId) {
      const domain = await prisma.domain.create({
        data: {
          userId,
          siteId,
          domainName,
          registrar: "ovh",
          status: "searching",
          stripePaymentId: session.payment_intent as string,
        },
      });

      await addJob("purchase-domain", {
        domainId: domain.id,
        domainName,
        siteId,
      });
    }
    return;
  }

  // Handle subscription checkout
  const userId = metadata?.userId;
  const plan = metadata?.plan as Plan | undefined;

  if (!userId || !plan) return;

  // Retrieve the subscription from the session
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Create subscription record and update user plan
  await prisma.$transaction([
    prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscriptionId,
        plan,
        status: "active",
        currentPeriodEnd: new Date(((subscription as unknown as Record<string, number>).current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        stripeCustomerId: session.customer as string,
      },
    }),
  ]);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!dbSubscription) return;

  // Determine plan from the price ID
  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        plan: plan || dbSubscription.plan,
        status: subscription.status === "active" ? "active" : "past_due",
        currentPeriodEnd: new Date(((subscription as unknown as Record<string, number>).current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000),
      },
    }),
    ...(plan
      ? [
          prisma.user.update({
            where: { id: dbSubscription.userId },
            data: { plan },
          }),
        ]
      : []),
  ]);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!dbSubscription) return;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { status: "cancelled" },
    }),
    prisma.user.update({
      where: { id: dbSubscription.userId },
      data: { plan: "free" },
    }),
  ]);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string;
  if (!subscriptionId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "past_due" },
  });
}

function getPlanFromPriceId(priceId: string): Plan | null {
  const priceMap: Record<string, Plan> = {};

  const envMappings: [string, Plan][] = [
    ["STRIPE_PRO_MONTHLY_PRICE_ID", "pro"],
    ["STRIPE_PRO_YEARLY_PRICE_ID", "pro"],
    ["STRIPE_BUSINESS_MONTHLY_PRICE_ID", "business"],
    ["STRIPE_BUSINESS_YEARLY_PRICE_ID", "business"],
    ["STRIPE_ENTERPRISE_MONTHLY_PRICE_ID", "enterprise"],
    ["STRIPE_ENTERPRISE_YEARLY_PRICE_ID", "enterprise"],
  ];

  for (const [envKey, plan] of envMappings) {
    const id = process.env[envKey];
    if (id) priceMap[id] = plan;
  }

  return priceMap[priceId] || null;
}
