import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

export const jobQueue = new Queue("masamune-jobs", { connection });

export async function addJob(
  name: string,
  data: Record<string, unknown>,
  options?: { priority?: number }
) {
  return jobQueue.add(name, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    ...options,
  });
}
