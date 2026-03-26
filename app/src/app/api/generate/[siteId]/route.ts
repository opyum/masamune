import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSiteWithGemini } from "@/lib/ai/generate";
import { parseGeneratedFiles, validateGeneratedFiles } from "@/lib/parser";

// Allow longer execution for AI generation
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  // Verify internal call (from queue.ts or chat API)
  const secret = request.headers.get("x-internal-secret");
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get site and brief
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site || !site.briefJson) {
      return NextResponse.json({ error: "Site or brief not found" }, { status: 404 });
    }

    console.log(`[generate] Starting generation for site ${site.slug}`);

    // 2. Call Gemini to generate the site
    const output = await generateSiteWithGemini(site.briefJson as Record<string, unknown>);

    // 3. Parse generated files
    const files = parseGeneratedFiles(output);
    if (files.length === 0) {
      console.error("[generate] No files generated");
      await prisma.site.update({
        where: { id: siteId },
        data: { status: "error", errorMessage: "Aucun fichier généré par l'IA" },
      });
      return NextResponse.json({ error: "No files generated" }, { status: 500 });
    }

    // 4. Validate
    const validation = validateGeneratedFiles(files);
    if (!validation.valid) {
      console.warn("[generate] Validation warnings:", validation.errors);
    }

    console.log(`[generate] Generated ${files.length} files for ${site.slug}`);

    // 5. Store in database
    const filesMap = Object.fromEntries(files.map((f) => [f.filename, f.content]));

    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "live",
        codeStoragePath: JSON.stringify(filesMap),
        currentVersion: 1,
        errorMessage: null,
      },
    });

    // 6. Create site version
    await prisma.siteVersion.create({
      data: {
        siteId,
        versionNumber: 1,
        codeStoragePath: "db",
        briefJsonSnapshot: site.briefJson as object,
        changeDescription: "Génération initiale",
      },
    });

    console.log(`[generate] Site ${site.slug} is now live with ${files.length} files`);

    // 7. TODO: Deploy to Cloudflare Pages (Sprint 1 phase 3)

    return NextResponse.json({
      success: true,
      filesCount: files.length,
      fileNames: files.map((f) => f.filename),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[generate] Error:`, message);

    await prisma.site.update({
      where: { id: siteId },
      data: { status: "error", errorMessage: message },
    }).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
