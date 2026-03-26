import crypto from "crypto";

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";
const ACCOUNT_ID = "7c10bc4a4ce381cf394a074100d60524";

function getApiToken(): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error("CLOUDFLARE_API_TOKEN is not set");
  }
  return token;
}

function headers(contentType = "application/json"): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiToken()}`,
    "Content-Type": contentType,
  };
}

interface CloudflareApiResponse<T = unknown> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: T;
}

interface PagesProject {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  production_branch: string;
}

interface PagesDeployment {
  id: string;
  url: string;
  environment: string;
  latest_stage: { name: string; status: string };
}

/**
 * Create a Cloudflare Pages project for a client site.
 */
export async function createPagesProject(slug: string): Promise<PagesProject> {
  const res = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: slug,
      production_branch: "main",
    }),
  });

  const data: CloudflareApiResponse<PagesProject> = await res.json();

  // 409 = project already exists, fetch it instead
  if (!data.success) {
    const alreadyExists = data.errors?.some((e) => e.code === 8000009);
    if (alreadyExists) {
      console.log(`[cloudflare] Project "${slug}" already exists, fetching it`);
      return getProject(slug);
    }
    throw new Error(`Failed to create Pages project: ${JSON.stringify(data.errors)}`);
  }

  console.log(`[cloudflare] Created project "${slug}" at ${data.result.subdomain}`);
  return data.result;
}

/**
 * Get an existing Cloudflare Pages project.
 */
async function getProject(projectName: string): Promise<PagesProject> {
  const res = await fetch(
    `${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${projectName}`,
    { headers: headers() }
  );

  const data: CloudflareApiResponse<PagesProject> = await res.json();
  if (!data.success) {
    throw new Error(`Failed to get project "${projectName}": ${JSON.stringify(data.errors)}`);
  }
  return data.result;
}

/**
 * Compute the SHA-256 hash of file content (hex-encoded).
 * Used to build the manifest for Direct Upload.
 */
function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content, "utf-8").digest("hex");
}

/**
 * Deploy files to a Cloudflare Pages project via Direct Upload.
 *
 * The deployment API accepts multipart/form-data where:
 * - A `manifest` field maps file paths to their content hashes
 * - Each file is sent as a form field keyed by its content hash
 */
export async function deployToPages(
  projectName: string,
  files: Record<string, string>
): Promise<PagesDeployment> {
  // Build manifest: { "/index.html": "<sha256 hash>" }
  const manifest: Record<string, string> = {};
  const hashToContent: Map<string, string> = new Map();

  for (const [filename, content] of Object.entries(files)) {
    const path = filename.startsWith("/") ? filename : `/${filename}`;
    const hash = hashContent(content);
    manifest[path] = hash;
    hashToContent.set(hash, content);
  }

  // Build multipart form data
  const formData = new FormData();
  formData.append("manifest", JSON.stringify(manifest));
  formData.append("branch", "main");
  formData.append("commit_message", "Deploy from Masamune");

  // Append each unique file by its hash
  for (const [hash, content] of hashToContent.entries()) {
    formData.append(hash, new Blob([content]), hash);
  }

  const res = await fetch(
    `${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/deployments`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${getApiToken()}` },
      body: formData,
    }
  );

  const data: CloudflareApiResponse<PagesDeployment> = await res.json();
  if (!data.success) {
    throw new Error(`Failed to deploy to "${projectName}": ${JSON.stringify(data.errors)}`);
  }

  console.log(`[cloudflare] Deployed "${projectName}" -> ${data.result.url}`);
  return data.result;
}

/**
 * Add a custom domain to a Cloudflare Pages project.
 */
export async function addCustomDomain(
  projectName: string,
  domain: string
): Promise<{ id: string; name: string; status: string }> {
  const res = await fetch(
    `${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/domains`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ name: domain }),
    }
  );

  const data: CloudflareApiResponse<{ id: string; name: string; status: string }> =
    await res.json();

  if (!data.success) {
    throw new Error(
      `Failed to add domain "${domain}" to "${projectName}": ${JSON.stringify(data.errors)}`
    );
  }

  console.log(`[cloudflare] Added domain "${domain}" to project "${projectName}"`);
  return data.result;
}

/**
 * Get the live deployment URL for a project.
 * Returns the *.pages.dev subdomain URL.
 */
export async function getDeploymentUrl(projectName: string): Promise<string> {
  const project = await getProject(projectName);
  return `https://${project.subdomain}`;
}
