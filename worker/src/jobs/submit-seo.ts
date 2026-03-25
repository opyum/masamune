import * as fs from "fs/promises";
import * as path from "path";
import { prisma } from "../lib/prisma";
import {
  generateSitemap,
  submitToGoogleSearchConsole,
  submitToIndexNow,
  analyzeSeoForSite,
  calculateSeoScore,
} from "../lib/seo";

const SITES_DIR = process.env.SITES_DIR || "/var/www/sites-clients";

export async function handleSubmitSeo(data: { siteId: string }) {
  const { siteId } = data;
  console.log(`[submit-seo] Starting SEO submission for site ${siteId}`);

  try {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new Error(`Site ${siteId} not found`);

    const domain = site.customDomain || `${site.slug}.masamune.app`;
    const siteDir = path.join(SITES_DIR, site.slug);

    // 1. Check if sitemap.xml exists, generate if missing
    const sitemapPath = path.join(siteDir, "sitemap.xml");
    try {
      await fs.access(sitemapPath);
      console.log("[submit-seo] sitemap.xml already exists");
    } catch {
      console.log("[submit-seo] Generating sitemap.xml...");
      await generateSitemap(site.slug, domain);
    }

    // 2. Check if robots.txt exists, generate if missing
    const robotsPath = path.join(siteDir, "robots.txt");
    try {
      await fs.access(robotsPath);
    } catch {
      const robotsTxt = `User-agent: *\nAllow: /\nSitemap: https://${domain}/sitemap.xml\n`;
      await fs.writeFile(robotsPath, robotsTxt, "utf-8");
      console.log("[submit-seo] Generated robots.txt");
    }

    // 3. Build URL list for submission
    const htmlEntries: string[] = [];
    const entries = await fs.readdir(siteDir, { recursive: true });
    for (const entry of entries) {
      const entryStr = entry.toString();
      if (entryStr.endsWith(".html")) {
        htmlEntries.push(entryStr);
      }
    }

    const baseUrl = `https://${domain}`;
    const urls = htmlEntries.map((f) =>
      f === "index.html" ? baseUrl + "/" : `${baseUrl}/${f}`
    );

    // 4. Submit to search engines
    const submittedTo: string[] = [];

    const googleOk = await submitToGoogleSearchConsole(`${baseUrl}/sitemap.xml`);
    if (googleOk) submittedTo.push("google");

    const bingOk = await submitToIndexNow(domain, urls);
    if (bingOk) submittedTo.push("bing_indexnow");

    // 5. Analyze SEO quality
    const pages = await analyzeSeoForSite(site.slug);
    const score = calculateSeoScore(pages);

    // 6. Store SEO config/report
    const seoConfig = {
      domain,
      submittedTo,
      submittedAt: new Date().toISOString(),
      score,
      pageCount: pages.length,
      urlCount: urls.length,
      analysis: pages,
    };

    await prisma.site.update({
      where: { id: siteId },
      data: { seoConfig: seoConfig as any },
    });

    console.log(`[submit-seo] SEO complete for ${domain} — score: ${score}/100, submitted to: ${submittedTo.join(", ") || "none"}`);

  } catch (error: any) {
    console.error(`[submit-seo] Error:`, error.message);
    throw error;
  }
}
