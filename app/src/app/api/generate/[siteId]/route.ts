import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLandingPage } from "@/lib/ai/generate";
import { createSiteRepo } from "@/lib/github";

// Allow longer execution for AI generation
export const maxDuration = 120;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  try {
    // 1. Get site and brief
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site || !site.briefJson) {
      return NextResponse.json(
        { error: "Site or brief not found" },
        { status: 404 }
      );
    }

    const briefJson = site.briefJson as Record<string, unknown>;
    console.log(`[generate] Starting one-shot generation for site ${site.slug}`);

    // 2. Call Claude Sonnet to generate the landing page
    const output = await generateLandingPage(briefJson);

    // 3. Extract HTML from ```html ... ``` block
    const htmlMatch = output.match(/```html\s*\n([\s\S]*?)```/);
    const indexHtml = htmlMatch ? htmlMatch[1].trim() : output.trim();

    if (!indexHtml.includes("<!DOCTYPE html>") && !indexHtml.includes("<!doctype html>")) {
      console.warn("[generate] Generated HTML may be incomplete (no DOCTYPE found)");
    }

    // 4. Generate sitemap.xml programmatically
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${site.slug}.pages.dev/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    // 5. Generate robots.txt programmatically
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://${site.slug}.pages.dev/sitemap.xml`;

    // 6. Store files in database
    const filesMap: Record<string, string> = {
      "index.html": indexHtml,
      "sitemap.xml": sitemapXml,
      "robots.txt": robotsTxt,
    };

    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "live",
        codeStoragePath: JSON.stringify(filesMap),
        currentVersion: 1,
        errorMessage: null,
      },
    });

    // 7. Create site version
    await prisma.siteVersion.create({
      data: {
        siteId,
        versionNumber: 1,
        codeStoragePath: "db",
        briefJsonSnapshot: briefJson as object,
        changeDescription: "Generation initiale one-shot",
      },
    });

    console.log(`[generate] Site ${site.slug} is now live with 3 files`);

    // 8. Deploy to Cloudflare Pages (non-blocking)
    try {
      const deployUrl = new URL(`/api/deploy/${siteId}`, request.url);
      const deployRes = await fetch(deployUrl.toString(), {
        method: "POST",
        headers: { "x-internal-secret": process.env.JWT_SECRET || "" },
      });
      const deployResult = await deployRes.json();
      if (deployRes.ok) {
        console.log(
          `[generate] Site ${site.slug} deployed to Cloudflare: ${deployResult.projectUrl}`
        );
      } else {
        console.warn(
          `[generate] Deploy warning for ${site.slug}:`,
          deployResult.error
        );
      }
    } catch (deployError: unknown) {
      const msg =
        deployError instanceof Error ? deployError.message : "Deploy failed";
      console.warn(
        `[generate] Deploy failed for ${site.slug} (non-blocking):`,
        msg
      );
    }

    // 9. Create GitHub repo (non-blocking)
    try {
      const repoUrl = await createSiteRepo(site.slug, filesMap);
      console.log(`[generate] GitHub repo created: ${repoUrl}`);
    } catch (ghError: unknown) {
      const msg =
        ghError instanceof Error ? ghError.message : "GitHub repo creation failed";
      console.warn(
        `[generate] GitHub repo failed for ${site.slug} (non-blocking):`,
        msg
      );
    }

    return NextResponse.json({
      success: true,
      filesCount: 3,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[generate] Error:`, message);

    await prisma.site
      .update({
        where: { id: siteId },
        data: { status: "error", errorMessage: message },
      })
      .catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
