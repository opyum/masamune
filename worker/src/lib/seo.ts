import * as fs from "fs/promises";
import * as path from "path";

const SITES_DIR = process.env.SITES_DIR || "/var/www/sites-clients";
const BING_INDEXNOW_KEY = process.env.BING_INDEXNOW_KEY || "";

export interface SeoReport {
  sitemap: { exists: boolean; urls: number };
  robots: { exists: boolean };
  pages: PageSeoAnalysis[];
  score: number;
  submittedTo: string[];
}

export interface PageSeoAnalysis {
  filename: string;
  hasTitle: boolean;
  titleLength: number;
  hasMetaDescription: boolean;
  descriptionLength: number;
  hasOgTags: boolean;
  hasSchemaOrg: boolean;
  hasH1: boolean;
  h1Count: number;
  imgWithoutAlt: number;
}

export async function generateSitemap(slug: string, domain: string): Promise<string> {
  const siteDir = path.join(SITES_DIR, slug);
  const htmlFiles: string[] = [];

  try {
    const entries = await fs.readdir(siteDir, { recursive: true });
    for (const entry of entries) {
      const entryStr = entry.toString();
      if (entryStr.endsWith(".html")) {
        htmlFiles.push(entryStr);
      }
    }
  } catch {
    return "";
  }

  const baseUrl = domain.startsWith("http") ? domain : `https://${domain}`;
  const now = new Date().toISOString().split("T")[0];

  const urls = htmlFiles.map((file) => {
    const loc = file === "index.html" ? "/" : `/${file}`;
    return `  <url>
    <loc>${baseUrl}${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${file === "index.html" ? "1.0" : "0.8"}</priority>
  </url>`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  const sitemapPath = path.join(siteDir, "sitemap.xml");
  await fs.writeFile(sitemapPath, sitemap, "utf-8");

  return sitemap;
}

export async function submitToGoogleSearchConsole(sitemapUrl: string): Promise<boolean> {
  // Google Search Console API requires OAuth2 — stub for now
  // In production, use googleapis package with service account
  console.log(`[seo] Google Search Console submission stub for: ${sitemapUrl}`);
  console.log("[seo] TODO: Configure Google Search Console API with service account");
  return true;
}

export async function submitToIndexNow(domain: string, urls: string[]): Promise<boolean> {
  if (!BING_INDEXNOW_KEY) {
    console.warn("[seo] BING_INDEXNOW_KEY not set, skipping IndexNow submission");
    return false;
  }

  try {
    const response = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: domain,
        key: BING_INDEXNOW_KEY,
        urlList: urls,
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`[seo] IndexNow: submitted ${urls.length} URLs for ${domain}`);
      return true;
    }

    console.warn(`[seo] IndexNow returned ${response.status}`);
    return false;
  } catch (error: any) {
    console.error("[seo] IndexNow submission failed:", error.message);
    return false;
  }
}

export async function analyzeSeoForSite(slug: string): Promise<PageSeoAnalysis[]> {
  const siteDir = path.join(SITES_DIR, slug);
  const analyses: PageSeoAnalysis[] = [];

  try {
    const entries = await fs.readdir(siteDir, { recursive: true });
    for (const entry of entries) {
      const entryStr = entry.toString();
      if (!entryStr.endsWith(".html")) continue;

      const filePath = path.join(siteDir, entryStr);
      const content = await fs.readFile(filePath, "utf-8");

      const titleMatch = content.match(/<title>(.*?)<\/title>/i);
      const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      const h1Matches = content.match(/<h1[\s>]/gi) || [];
      const imgWithoutAlt = (content.match(/<img(?![^>]*alt=)/gi) || []).length;

      analyses.push({
        filename: entryStr,
        hasTitle: !!titleMatch,
        titleLength: titleMatch?.[1]?.length || 0,
        hasMetaDescription: !!descMatch,
        descriptionLength: descMatch?.[1]?.length || 0,
        hasOgTags: content.includes('property="og:') || content.includes("property='og:"),
        hasSchemaOrg: content.includes("schema.org") || content.includes("application/ld+json"),
        hasH1: h1Matches.length > 0,
        h1Count: h1Matches.length,
        imgWithoutAlt,
      });
    }
  } catch {
    // Site directory may not exist yet
  }

  return analyses;
}

export function calculateSeoScore(pages: PageSeoAnalysis[]): number {
  if (pages.length === 0) return 0;

  let totalScore = 0;
  for (const page of pages) {
    let pageScore = 0;
    if (page.hasTitle && page.titleLength <= 60) pageScore += 15;
    else if (page.hasTitle) pageScore += 10;
    if (page.hasMetaDescription && page.descriptionLength <= 155) pageScore += 15;
    else if (page.hasMetaDescription) pageScore += 10;
    if (page.hasOgTags) pageScore += 15;
    if (page.hasSchemaOrg) pageScore += 20;
    if (page.hasH1 && page.h1Count === 1) pageScore += 15;
    else if (page.hasH1) pageScore += 10;
    if (page.imgWithoutAlt === 0) pageScore += 20;
    else pageScore += Math.max(0, 20 - page.imgWithoutAlt * 5);
    totalScore += pageScore;
  }

  return Math.round(totalScore / pages.length);
}
