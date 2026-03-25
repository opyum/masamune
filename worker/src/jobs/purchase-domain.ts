import { prisma } from "../lib/prisma";
import { purchaseDomain, checkDomainAvailability } from "../lib/ovh";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const jobQueue = new Queue("masamune-jobs", { connection });

export async function handlePurchaseDomain(data: {
  domainId: string;
  domainName: string;
  siteId: string;
}) {
  const { domainId, domainName, siteId } = data;
  console.log(`[purchase-domain] Starting purchase for ${domainName}`);

  try {
    // 1. Check availability
    const availability = await checkDomainAvailability(domainName);
    if (!availability.available) {
      await prisma.domain.update({
        where: { id: domainId },
        data: { status: "error" },
      });
      throw new Error(`Domain ${domainName} is not available`);
    }

    // 2. Purchase via OVH
    console.log(`[purchase-domain] Purchasing ${domainName} via OVH...`);
    const { orderId } = await purchaseDomain(domainName);

    // 3. Update domain record
    await prisma.domain.update({
      where: { id: domainId },
      data: {
        status: "purchased",
        ovhOrderId: orderId,
      },
    });

    console.log(`[purchase-domain] Domain ${domainName} purchased (order: ${orderId})`);

    // 4. Enqueue DNS configuration job
    await jobQueue.add("configure-dns", {
      domainId,
      domainName,
      siteId,
    }, {
      delay: 30000, // Wait 30s for OVH propagation
      attempts: 5,
      backoff: { type: "exponential", delay: 60000 },
    });

    console.log(`[purchase-domain] DNS configuration job enqueued for ${domainName}`);

  } catch (error: any) {
    console.error(`[purchase-domain] Error:`, error.message);

    await prisma.domain.update({
      where: { id: domainId },
      data: { status: "error" },
    });

    throw error;
  }
}
