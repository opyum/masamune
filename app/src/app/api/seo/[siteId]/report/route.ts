import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user!.id },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({
    siteId: site.id,
    slug: site.slug,
    status: site.status,
    seoConfig: site.seoConfig || null,
    customDomain: site.customDomain,
  });
}
