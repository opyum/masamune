import { Worker } from "bullmq";
import IORedis from "ioredis";
import { handleGenerateSite } from "./jobs/generate-site";

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
        // TODO: Plan 4 Task 4 — iteration handler
        console.log("Site rebuild not yet implemented");
        break;
      case "purchase-domain":
        // TODO: Plan 5
        console.log("Domain purchase not yet implemented");
        break;
      case "configure-dns":
        // TODO: Plan 5
        console.log("DNS configuration not yet implemented");
        break;
      case "submit-seo":
        // TODO: Plan 7
        console.log("SEO submission not yet implemented");
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
