import { Worker } from "bullmq";
import IORedis from "ioredis";

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
    // Job handlers will be added in Plan 4
    switch (job.name) {
      case "generate-site":
        console.log("Site generation not yet implemented");
        break;
      case "purchase-domain":
        console.log("Domain purchase not yet implemented");
        break;
      case "configure-dns":
        console.log("DNS configuration not yet implemented");
        break;
      case "submit-seo":
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
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Masamune Worker started. Waiting for jobs...");
