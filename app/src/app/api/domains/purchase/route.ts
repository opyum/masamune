import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { addJob } from "@/lib/queue";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  if (user!.plan === "free") {
    return NextResponse.json(
      { error: "Upgrade to Pro to purchase a domain" },
      { status: 403 }
    );
  }

  const { domainName, siteId, stripePaymentId } = await request.json();

  if (!domainName || !siteId) {
    return NextResponse.json(
      { error: "domainName and siteId are required" },
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

  // Create domain record
  const domain = await prisma.domain.create({
    data: {
      userId: user!.id,
      siteId,
      domainName,
      registrar: "ovh",
      status: "searching",
      stripePaymentId,
    },
  });

  // Enqueue purchase job
  await addJob("purchase-domain", {
    domainId: domain.id,
    domainName,
    siteId,
  });

  return NextResponse.json(domain, { status: 201 });
}
