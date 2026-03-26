import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

// GET /api/sites — list user's sites
export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  try {
    const sites = await prisma.site.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        domains: { select: { domainName: true, status: true } },
      },
    });

    return NextResponse.json(sites);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown DB error";
    console.error("[GET /api/sites] DB error:", msg);
    return NextResponse.json(
      { error: "Database error", details: msg },
      { status: 500 }
    );
  }
}

// POST /api/sites — create a new site
export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const body = await request.json();
  const { businessName, businessType } = body;

  if (!businessName || !businessType) {
    return NextResponse.json(
      { error: "businessName and businessType are required" },
      { status: 400 }
    );
  }

  try {
    // Generate unique slug
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.site.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Check plan limits
    const siteCount = await prisma.site.count({
      where: { userId: user.id },
    });
    const limits: Record<string, number> = {
      free: 1,
      pro: 1,
      business: 3,
      enterprise: 10,
    };
    if (siteCount >= (limits[user.plan] || 1)) {
      return NextResponse.json(
        { error: "Site limit reached for your plan" },
        { status: 403 }
      );
    }

    const site = await prisma.site.create({
      data: {
        userId: user.id,
        slug,
        businessName,
        businessType,
        status: "drafting",
      },
    });

    // Create initial conversation
    await prisma.conversation.create({
      data: { siteId: site.id },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown DB error";
    console.error("[POST /api/sites] DB error:", msg);
    return NextResponse.json(
      { error: "Database error", details: msg },
      { status: 500 }
    );
  }
}
