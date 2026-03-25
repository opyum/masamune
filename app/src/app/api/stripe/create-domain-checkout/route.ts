import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  if (user!.plan === "free") {
    return NextResponse.json(
      { error: "Upgrade to Pro to purchase a domain" },
      { status: 403 }
    );
  }

  const { domainName, siteId, price } = await request.json();

  if (!domainName || !siteId || !price) {
    return NextResponse.json(
      { error: "domainName, siteId, and price are required" },
      { status: 400 }
    );
  }

  // Verify site belongs to user
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user!.id },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Nom de domaine : ${domainName}`,
            description: `Enregistrement du domaine ${domainName} pour 1 an`,
          },
          unit_amount: Math.round(price * 100), // Convert EUR to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "domain_purchase",
      domainName,
      siteId,
      userId: user!.id,
    },
    success_url: `${process.env.SITE_URL || "http://localhost:3000"}/dashboard/sites/${siteId}?domain=success`,
    cancel_url: `${process.env.SITE_URL || "http://localhost:3000"}/dashboard/sites/${siteId}?domain=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
