import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePage } from "@/lib/ai/generate";
import { parseGeneratedFiles } from "@/lib/parser";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  try {
    const { pageSlug, pageSpec } = await request.json();

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

    console.log(`[generate/page] Generating page ${pageSlug} for site ${site.slug}`);

    const output = await generatePage(
      site.briefJson as Record<string, unknown>,
      plan,
      pageSpec
    );

    const files = parseGeneratedFiles(output);
    if (files.length === 0) {
      return NextResponse.json({ error: "No page content generated" }, { status: 500 });
    }

    // Merge with existing pages
    const existingFiles: Record<string, string> = site.codeStoragePath
      ? JSON.parse(site.codeStoragePath)
      : {};

    for (const file of files) {
      existingFiles[file.filename] = file.content;
    }

    await prisma.site.update({
      where: { id: siteId },
      data: { codeStoragePath: JSON.stringify(existingFiles) },
    });

    console.log(`[generate/page] Page ${pageSlug} saved for ${site.slug}`);

    return NextResponse.json({
      success: true,
      filename: files[0].filename,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[generate/page] Error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
