import { Worker } from "bullmq";
import IORedis from "ioredis";
import { handleGenerateSite } from "./jobs/generate-site";
import { handleRebuildSite } from "./jobs/rebuild-site";
import { handlePurchaseDomain } from "./jobs/purchase-domain";
import { handleConfigureDNS } from "./jobs/configure-dns";
import { handleSubmitSeo } from "./jobs/submit-seo";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "masamune-jobs",
  async (job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);

    switch (job.name) {
      case "generate-site":
        await handleGenerateSite(job.data);
        break;
      case "rebuild-site":
        await handleRebuildSite(job.data);
        break;
      case "purchase-domain":
        await handlePurchaseDomain(job.data);
        break;
      case "configure-dns":
        await handleConfigureDNS(job.data);
        break;
      case "submit-seo":
        await handleSubmitSeo(job.data);
        break;
      default:
        console.log(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Masamune Worker started. Waiting for jobs...");
