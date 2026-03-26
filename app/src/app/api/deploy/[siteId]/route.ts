import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPagesProject, deployToPages, getDeploymentUrl } from "@/lib/cloudflare";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  // Verify internal call (from generate route or queue)
  const secret = request.headers.get("x-internal-secret");
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get site with generated files
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (!site.codeStoragePath) {
      return NextResponse.json(
        { error: "Site has no generated files to deploy" },
        { status: 400 }
      );
    }

    // 2. Parse stored files
    let files: Record<string, string>;
    try {
      files = JSON.parse(site.codeStoragePath);
    } catch {
      return NextResponse.json({ error: "Invalid file data in database" }, { status: 500 });
    }

    if (Object.keys(files).length === 0) {
      return NextResponse.json({ error: "No files to deploy" }, { status: 400 });
    }

    console.log(`[deploy] Starting Cloudflare Pages deploy for site "${site.slug}"`);

    // 3. Create Pages project (idempotent - returns existing if already created)
    await createPagesProject(site.slug);

    // 4. Deploy files
    const deployment = await deployToPages(site.slug, files);

    // 5. Get the stable project URL
    const deploymentUrl = await getDeploymentUrl(site.slug);

    // 6. Update site in DB with Cloudflare URL
    await prisma.site.update({
      where: { id: siteId },
      data: {
        customDomain: deploymentUrl,
      },
    });

    console.log(`[deploy] Site "${site.slug}" deployed to ${deploymentUrl}`);

    return NextResponse.json({
      success: true,
      deploymentId: deployment.id,
      url: deployment.url,
      projectUrl: deploymentUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown deploy error";
    console.error(`[deploy] Error for site ${siteId}:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
