import * as fs from "fs/promises";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { callSonnet } from "../lib/anthropic";
import { SONNET_GENERATION_SYSTEM_PROMPT, buildGenerationUserPrompt } from "../prompts/generation";
import { parseGeneratedFiles, validateGeneratedFiles } from "../lib/parser";
import { notifySiteLive } from "../lib/notifications";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const SITES_DIR = process.env.SITES_DIR || "/var/www/sites-clients";

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});
const jobQueue = new Queue("masamune-jobs", { connection: redisConnection });

export async function handleGenerateSite(data: {
  siteId: string;
  briefJson: Record<string, any>;
}) {
  const { siteId, briefJson } = data;

  console.log(`[generate-site] Starting generation for site ${siteId}`);

  // Update job status
  const job = await prisma.job.findFirst({
    where: { siteId, type: "generate", status: "processing" },
  });

  try {
    // 1. Call Claude Sonnet
    console.log("[generate-site] Calling Claude Sonnet...");
    const output = await callSonnet(
      SONNET_GENERATION_SYSTEM_PROMPT,
      buildGenerationUserPrompt(briefJson)
    );

    // 2. Parse generated files
    console.log("[generate-site] Parsing generated files...");
    const files = parseGeneratedFiles(output);

    if (files.length === 0) {
      throw new Error("No files generated — Sonnet output did not contain FILE_START/FILE_END blocks");
    }

    // 3. Validate
    const validation = validateGeneratedFiles(files);
    if (!validation.valid) {
      console.warn("[generate-site] Validation warnings:", validation.errors);
      // Continue anyway — partial is better than nothing
    }

    // 4. Get site info
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new Error(`Site ${siteId} not found`);

    // 5. Write files to disk
    const siteDir = path.join(SITES_DIR, site.slug);
    await fs.mkdir(siteDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(siteDir, file.filename);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, "utf-8");
      console.log(`[generate-site] Wrote ${file.filename}`);
    }

    // 6. Store code in Supabase Storage (for versioning)
    const codeStoragePath = `sites/${siteId}/v1/`;
    // TODO: Upload to Supabase Storage in future iteration

    // 7. Create site version
    await prisma.siteVersion.create({
      data: {
        siteId,
        versionNumber: 1,
        codeStoragePath,
        briefJsonSnapshot: briefJson as any,
        changeDescription: "Initial generation",
      },
    });

    // 8. Update site status
    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "live",
        codeStoragePath,
        currentVersion: 1,
      },
    });

    // 9. Notify user
    const domain = site.customDomain || `${site.slug}.masamune.app`;
    await notifySiteLive(site.userId, site.businessName, `https://${domain}`);

    // 10. Enqueue SEO submission
    await jobQueue.add("submit-seo", { siteId }, {
      delay: 5000, // Wait 5s for files to settle
    });
    console.log(`[generate-site] SEO submission enqueued for site ${siteId}`);

    // 10. Update job
    if (job) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "completed",
          result: { filesGenerated: files.length, fileNames: files.map((f) => f.filename) } as any,
          completedAt: new Date(),
        },
      });
    }

    console.log(`[generate-site] Site ${site.slug} deployed with ${files.length} files`);

  } catch (error: any) {
    console.error(`[generate-site] Error for site ${siteId}:`, error.message);

    // Update site status to error
    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "error",
        errorMessage: error.message,
      },
    });

    // Update job
    if (job) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "failed",
          error: error.message,
          completedAt: new Date(),
        },
      });
    }

    throw error; // Re-throw for BullMQ retry
  }
}
