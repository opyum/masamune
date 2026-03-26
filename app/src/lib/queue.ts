// Serverless-compatible queue stub
// BullMQ/Redis removed — generation runs inline on Vercel

export async function addJob(
  name: string,
  data: Record<string, unknown>,
  _options?: { priority?: number }
) {
  console.log(`[queue] Job "${name}" received (serverless mode — processing inline)`);

  // Trigger generation inline via internal API call
  if (name === "generate-site" && data.siteId) {
    const baseUrl = process.env.SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    fetch(`${baseUrl}/api/generate/${data.siteId}`, {
      method: "POST",
      headers: { "x-internal-secret": process.env.JWT_SECRET || "" },
    }).catch((err) => {
      console.error(`[queue] Failed to trigger generation:`, err);
    });
  }

  return null;
}
