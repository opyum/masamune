import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { addJob } from "@/lib/queue";

export async function POST(
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

  if (site.status !== "live") {
    return NextResponse.json(
      { error: "Site must be live to submit SEO" },
      { status: 400 }
    );
  }

  await addJob("submit-seo", { siteId });

  return NextResponse.json({ message: "SEO submission enqueued" });
}
