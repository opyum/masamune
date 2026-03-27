import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSEOFiles } from "@/lib/ai/generate";
import { parseGeneratedFiles } from "@/lib/parser";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  try {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site || !site.briefJson || !site.seoConfig) {
      return NextResponse.json({ error: "Site, brief or plan not found" }, { status: 404 });
    }

    const plan = site.seoConfig as unknown as {
      pages: { slug: string; title: string; sections: { type: string; title: string; content_brief: string }[] }[];
      design: { primary_color: string; secondary_color: string; accent_color: string; heading_font: string; body_font: string; style_notes: string };
      navigation: { label: string; href: string }[];
      seo: { site_title: string; site_description: string; keywords_per_page: Record<string, string[]> };
      header_html: string;
      footer_html: string;
    };

    // Get existing page names
    const existingFiles: Record<string, string> = site.codeStoragePath
      ? JSON.parse(site.codeStoragePath)
      : {};
    const pageNames = Object.keys(existingFiles).filter((f) => f.endsWith(".html"));

    console.log(`[generate/seo] Generating SEO files for site ${site.slug}`);

    const output = await generateSEOFiles(
      site.briefJson as Record<string, unknown>,
      plan,
      pageNames
    );

    const files = parseGeneratedFiles(output);
    for (const file of files) {
      existingFiles[file.filename] = file.content;
    }

    // Finalize site
    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "live",
        codeStoragePath: JSON.stringify(existingFiles),
        currentVersion: 1,
        errorMessage: null,
      },
    });

    // Create site version
    await prisma.siteVersion.create({
      data: {
        siteId,
        versionNumber: 1,
        codeStoragePath: "db",
        briefJsonSnapshot: site.briefJson as object,
        changeDescription: "Generation initiale (multi-step pipeline)",
      },
    });

    console.log(`[generate/seo] Site ${site.slug} is now live with ${Object.keys(existingFiles).length} files`);

    // Deploy to Cloudflare Pages
    try {
      const deployUrl = new URL(`/api/deploy/${siteId}`, request.url);
      const deployRes = await fetch(deployUrl.toString(), {
        method: "POST",
        headers: { "x-internal-secret": process.env.JWT_SECRET || "" },
      });
      if (deployRes.ok) {
        const deployResult = await deployRes.json();
        console.log(`[generate/seo] Site ${site.slug} deployed: ${deployResult.projectUrl}`);
      }
    } catch (deployError: unknown) {
      const deployMsg = deployError instanceof Error ? deployError.message : "Deploy failed";
      console.warn(`[generate/seo] Deploy failed (non-blocking):`, deployMsg);
    }

    return NextResponse.json({
      success: true,
      totalFiles: Object.keys(existingFiles).length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[generate/seo] Error:`, message);

    await prisma.site.update({
      where: { id: siteId },
      data: { status: "error", errorMessage: `SEO generation failed: ${message}` },
    }).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
