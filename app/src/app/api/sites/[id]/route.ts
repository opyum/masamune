import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

// GET /api/sites/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { id } = await params;

  const site = await prisma.site.findFirst({
    where: { id, userId: user!.id },
    include: {
      assets: true,
      domains: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 5 },
      conversations: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json(site);
}

// DELETE /api/sites/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { id } = await params;

  const site = await prisma.site.findFirst({
    where: { id, userId: user!.id },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  await prisma.site.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
