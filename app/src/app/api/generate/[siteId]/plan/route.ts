import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSitePlan } from "@/lib/ai/generate";

export const maxDuration = 60;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  try {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site || !site.briefJson) {
      return NextResponse.json({ error: "Site or brief not found" }, { status: 404 });
    }

    console.log(`[generate/plan] Starting plan for site ${site.slug}`);

    const plan = await generateSitePlan(site.briefJson as Record<string, unknown>);

    // Store plan in seoConfig temporarily
    await prisma.site.update({
      where: { id: siteId },
      data: {
        seoConfig: plan as unknown as object,
        status: "generating",
      },
    });

    console.log(`[generate/plan] Plan ready for ${site.slug}: ${plan.pages.length} pages`);

    return NextResponse.json({ plan });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[generate/plan] Error:`, message);

    await prisma.site.update({
      where: { id: siteId },
      data: { status: "error", errorMessage: `Plan failed: ${message}` },
    }).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
