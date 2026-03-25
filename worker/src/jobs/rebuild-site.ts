import * as fs from "fs/promises";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { callSonnet } from "../lib/anthropic";
import { SONNET_ITERATION_SYSTEM_PROMPT, buildIterationUserPrompt } from "../prompts/iteration";
import { parseGeneratedFiles } from "../lib/parser";

const SITES_DIR = process.env.SITES_DIR || "/var/www/sites-clients";

export async function handleRebuildSite(data: {
  siteId: string;
  modification: string;
}) {
  const { siteId, modification } = data;
  console.log(`[rebuild-site] Starting rebuild for site ${siteId}`);

  try {
    // 1. Get site and current code
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new Error(`Site ${siteId} not found`);

    const siteDir = path.join(SITES_DIR, site.slug);

    // 2. Read current files
    const currentCode: Record<string, string> = {};
    try {
      const entries = await fs.readdir(siteDir, { recursive: true });
      for (const entry of entries) {
        const entryStr = entry.toString();
        if (entryStr.endsWith(".html") || entryStr.endsWith(".xml") || entryStr.endsWith(".txt") || entryStr.endsWith(".css") || entryStr.endsWith(".js")) {
          const filePath = path.join(siteDir, entryStr);
          const stat = await fs.stat(filePath);
          if (stat.isFile()) {
            currentCode[entryStr] = await fs.readFile(filePath, "utf-8");
          }
        }
      }
    } catch {
      throw new Error("Cannot read current site files");
    }

    // 3. Call Sonnet for iteration
    console.log("[rebuild-site] Calling Claude Sonnet for iteration...");
    const output = await callSonnet(
      SONNET_ITERATION_SYSTEM_PROMPT,
      buildIterationUserPrompt(currentCode, modification, site.briefJson as any)
    );

    // 4. Parse modified files
    const modifiedFiles = parseGeneratedFiles(output);
    if (modifiedFiles.length === 0) {
      throw new Error("No modified files in Sonnet output");
    }

    // 5. Write modified files
    for (const file of modifiedFiles) {
      const filePath = path.join(siteDir, file.filename);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, "utf-8");
      console.log(`[rebuild-site] Updated ${file.filename}`);
    }

    // 6. Create new version
    const newVersion = site.currentVersion + 1;
    const codeStoragePath = `sites/${siteId}/v${newVersion}/`;

    await prisma.siteVersion.create({
      data: {
        siteId,
        versionNumber: newVersion,
        codeStoragePath,
        briefJsonSnapshot: site.briefJson as any,
        changeDescription: modification,
      },
    });

    // 7. Update site
    await prisma.site.update({
      where: { id: siteId },
      data: {
        currentVersion: newVersion,
        status: "live",
      },
    });

    console.log(`[rebuild-site] Site ${site.slug} updated to v${newVersion} (${modifiedFiles.length} files modified)`);

  } catch (error: any) {
    console.error(`[rebuild-site] Error:`, error.message);

    await prisma.site.update({
      where: { id: siteId },
      data: { errorMessage: error.message },
    });

    throw error;
  }
}
