# Plan 4: Pipeline IA — Generation (Worker Sonnet + SSG + Deploy)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Worker job handler that takes a brief_json, generates a complete static website using Claude Sonnet, builds it, deploys it to the Nginx-served directory, and notifies the user in real-time.

**Architecture:** The BullMQ Worker receives a "generate-site" job, calls Claude Sonnet API with the site generation prompt and the brief_json, parses the generated code into files, writes them to /var/www/sites-clients/{slug}/, generates an Nginx config for custom domains, and updates the site status in the database.

**Tech Stack:** Node.js Worker, BullMQ, Anthropic SDK, Prisma, fs/path (file operations)

**Spec:** `docs/superpowers/specs/2026-03-25-masamune-saas-design.md` (sections 5.3, 6.2, 6.3, 6.5)
**Prompts:** `AgentDoc/PromptEngineer/prompt-catalog.md` (section B — Sonnet Generation, section C — Iteration)

**Depends on:** Plan 2 (Auth & Core) — completed, Plan 3 (Qualifying) — in progress (independent from Worker)

---

### Task 1: Set up Worker with Anthropic SDK and Prisma

**Files:**
- Modify: `worker/package.json`
- Modify: `worker/src/index.ts`
- Create: `worker/src/lib/prisma.ts`
- Create: `worker/src/lib/anthropic.ts`

- [ ] **Step 1: Install dependencies in worker**

```bash
cd C:/2-Travail/Masamune/worker
npm install @anthropic-ai/sdk @prisma/client
```

- [ ] **Step 2: Create Prisma client for worker**

Create `worker/src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
```

Note: Worker shares the same Prisma schema from `app/prisma/schema.prisma`. At build time, generate the client from the app directory: `cd ../app && npx prisma generate`.

- [ ] **Step 3: Create Anthropic client wrapper**

Create `worker/src/lib/anthropic.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callSonnet(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text || "";
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add worker/
rtk git commit -m "feat: add Anthropic SDK and Prisma to worker"
```

---

### Task 2: Implement site generation prompt and parser

**Files:**
- Create: `worker/src/prompts/generation.ts`
- Create: `worker/src/lib/parser.ts`

- [ ] **Step 1: Create generation system prompt**

Create `worker/src/prompts/generation.ts`:

```typescript
export const SONNET_GENERATION_SYSTEM_PROMPT = `Tu es un expert en creation de sites web statiques. Tu generes des sites professionnels en HTML5 + Tailwind CSS (via CDN) pour des petites entreprises.

## Regles absolues

1. **HTML5 semantique** : utilise header, nav, main, section, article, footer
2. **Tailwind CSS via CDN** : <script src="https://cdn.tailwindcss.com"></script> — pas de CSS custom sauf exceptions mineures
3. **Mobile-first** : design responsive avec les breakpoints sm:, md:, lg:
4. **Performance** : pas de JavaScript inutile, images en lazy loading, code minimal
5. **SEO obligatoire** sur chaque page :
   - <title> optimise (60 chars max, mot-cle + localite)
   - <meta name="description"> (155 chars max)
   - Open Graph tags (og:title, og:description, og:image, og:url)
   - Schema.org JSON-LD adapte au type de business
   - Balises h1 (une seule par page), h2, h3 hierarchiques
6. **Accessibilite** : alt sur les images, contraste suffisant, navigation clavier
7. **Pas de framework JS** : vanilla JS uniquement si necessaire (menu mobile, smooth scroll)

## Format de sortie

Pour CHAQUE fichier, utilise ce format exact :

FILE_START: nom-du-fichier.html
(contenu complet du fichier)
FILE_END: nom-du-fichier.html

Genere au minimum :
- index.html (page d'accueil)
- Un fichier par page additionnelle demandee
- sitemap.xml
- robots.txt

## Design

- Palette de couleurs coherente avec le secteur d'activite
- Typographie Google Fonts adaptee
- Sections bien espacees, aeration visuelle
- Call-to-action clairs et visibles
- Footer avec informations legales, contact, horaires
- Navigation claire et accessible

## Contenu

- Texte professionnel et engageant adapte au secteur
- Si des images sont fournies dans les assets, utilise-les
- Si pas d'images, utilise des placeholder avec des descriptions pour le alt text
- Integre les horaires, telephone, adresse si fournis
- Formulaire de contact fonctionnel (action mailto: ou formspree)
`;

export function buildGenerationUserPrompt(briefJson: Record<string, any>): string {
  return \`Genere un site web complet pour ce business :

\${JSON.stringify(briefJson, null, 2)}

Genere TOUS les fichiers necessaires avec le format FILE_START/FILE_END.
Assure-toi que chaque page est complete et fonctionnelle.
Le site doit etre professionnel, comme s'il avait ete cree par une agence web.\`;
}
`;

- [ ] **Step 2: Create file parser**

Create `worker/src/lib/parser.ts`:

```typescript
export interface GeneratedFile {
  filename: string;
  content: string;
}

export function parseGeneratedFiles(output: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const regex = /FILE_START:\s*(.+?)\n([\s\S]*?)FILE_END:\s*\1/g;
  let match;

  while ((match = regex.exec(output)) !== null) {
    files.push({
      filename: match[1].trim(),
      content: match[2].trim(),
    });
  }

  return files;
}

export function validateGeneratedFiles(files: GeneratedFile[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Must have at least index.html
  if (!files.find((f) => f.filename === "index.html")) {
    errors.push("Missing index.html");
  }

  // Each HTML file should have basic structure
  for (const file of files) {
    if (file.filename.endsWith(".html")) {
      if (!file.content.includes("<!DOCTYPE html>") && !file.content.includes("<!doctype html>")) {
        errors.push(\`\${file.filename}: Missing DOCTYPE\`);
      }
      if (!file.content.includes("<title>")) {
        errors.push(\`\${file.filename}: Missing <title> tag\`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 3: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add worker/src/prompts/ worker/src/lib/parser.ts
rtk git commit -m "feat: add site generation prompt and file parser"
```

---

### Task 3: Implement the generate-site job handler

**Files:**
- Modify: `worker/src/index.ts`
- Create: `worker/src/jobs/generate-site.ts`

- [ ] **Step 1: Create generate-site job handler**

Create `worker/src/jobs/generate-site.ts`:

```typescript
import * as fs from "fs/promises";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { callSonnet } from "../lib/anthropic";
import { SONNET_GENERATION_SYSTEM_PROMPT, buildGenerationUserPrompt } from "../prompts/generation";
import { parseGeneratedFiles, validateGeneratedFiles } from "../lib/parser";

const SITES_DIR = process.env.SITES_DIR || "/var/www/sites-clients";

export async function handleGenerateSite(data: {
  siteId: string;
  briefJson: Record<string, any>;
}) {
  const { siteId, briefJson } = data;

  console.log(\`[generate-site] Starting generation for site \${siteId}\`);

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
    if (!site) throw new Error(\`Site \${siteId} not found\`);

    // 5. Write files to disk
    const siteDir = path.join(SITES_DIR, site.slug);
    await fs.mkdir(siteDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(siteDir, file.filename);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, "utf-8");
      console.log(\`[generate-site] Wrote \${file.filename}\`);
    }

    // 6. Store code in Supabase Storage (for versioning)
    const codeStoragePath = \`sites/\${siteId}/v1/\`;
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

    // 9. Update job
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

    console.log(\`[generate-site] Site \${site.slug} deployed with \${files.length} files\`);

  } catch (error: any) {
    console.error(\`[generate-site] Error for site \${siteId}:\`, error.message);

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
```

- [ ] **Step 2: Update worker/src/index.ts to use the handler**

Replace the job handler in `worker/src/index.ts`:

```typescript
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
    console.log(\`Processing job \${job.id}: \${job.name}\`);

    switch (job.name) {
      case "generate-site":
        await handleGenerateSite(job.data);
        break;
      case "rebuild-site":
        // TODO: Plan 4 iteration handler
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
        console.log(\`Unknown job type: \${job.name}\`);
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(\`Job \${job.id} completed successfully\`);
});

worker.on("failed", (job, err) => {
  console.error(\`Job \${job?.id} failed:\`, err.message);
});

console.log("Masamune Worker started. Waiting for jobs...");
```

- [ ] **Step 3: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add worker/src/
rtk git commit -m "feat: implement generate-site job handler with Sonnet + file deployment"
```

---

### Task 4: Implement iteration job handler

**Files:**
- Create: `worker/src/prompts/iteration.ts`
- Create: `worker/src/jobs/rebuild-site.ts`
- Modify: `worker/src/index.ts`

- [ ] **Step 1: Create iteration prompt**

Create `worker/src/prompts/iteration.ts`:

```typescript
export const SONNET_ITERATION_SYSTEM_PROMPT = \`Tu es un expert en modification de sites web statiques. Tu recois le code actuel d'un site et une demande de modification du client.

## Regles

1. **Modifie UNIQUEMENT ce qui est demande** — ne touche pas au reste
2. **Classifie la demande** :
   - Type A (patch) : changement CSS, texte, couleur, image → modifie uniquement les fichiers concernes
   - Type B (structurel) : nouvelle section, nouvelle page, reorganisation → peut modifier plusieurs fichiers
3. **Maintiens la coherence SEO** : si tu modifies du contenu, mets a jour les meta tags et Schema.org si pertinent
4. **Conserve le format FILE_START/FILE_END** pour chaque fichier modifie

## Format de sortie

Pour chaque fichier modifie, retourne le fichier COMPLET (pas un diff) :

FILE_START: nom-du-fichier.html
(contenu complet modifie du fichier)
FILE_END: nom-du-fichier.html

Ne retourne QUE les fichiers modifies, pas les fichiers inchanges.
\`;

export function buildIterationUserPrompt(
  currentCode: Record<string, string>,
  modification: string,
  briefJson: Record<string, any>
): string {
  const filesSection = Object.entries(currentCode)
    .map(([name, content]) => \`FILE_START: \${name}\\n\${content}\\nFILE_END: \${name}\`)
    .join("\\n\\n");

  return \`## Brief du site
\${JSON.stringify(briefJson, null, 2)}

## Code actuel du site
\${filesSection}

## Modification demandee par le client
"\${modification}"

Applique cette modification. Retourne uniquement les fichiers modifies au format FILE_START/FILE_END.\`;
}
\`;

- [ ] **Step 2: Create rebuild-site job handler**

Create `worker/src/jobs/rebuild-site.ts`:

```typescript
import * as fs from "fs/promises";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { callSonnet } from "../lib/anthropic";
import { SONNET_ITERATION_SYSTEM_PROMPT, buildIterationUserPrompt } from "../prompts/iteration";
import { parseGeneratedFiles } from "../lib/parser";

const SITES_DIR = process.env.SITES_DIR || "/var/www/sites-clients";

export async function handleRebuildSite(data: {
  siteId: string;
  modification: string;
}) {
  const { siteId, modification } = data;
  console.log(\`[rebuild-site] Starting rebuild for site \${siteId}\`);

  try {
    // 1. Get site and current code
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new Error(\`Site \${siteId} not found\`);

    const siteDir = path.join(SITES_DIR, site.slug);

    // 2. Read current files
    const currentCode: Record<string, string> = {};
    try {
      const entries = await fs.readdir(siteDir, { recursive: true });
      for (const entry of entries) {
        const entryStr = entry.toString();
        if (entryStr.endsWith(".html") || entryStr.endsWith(".xml") || entryStr.endsWith(".txt") || entryStr.endsWith(".css") || entryStr.endsWith(".js")) {
          const filePath = path.join(siteDir, entryStr);
          const stat = await fs.stat(filePath);
          if (stat.isFile()) {
            currentCode[entryStr] = await fs.readFile(filePath, "utf-8");
          }
        }
      }
    } catch {
      throw new Error("Cannot read current site files");
    }

    // 3. Call Sonnet for iteration
    console.log("[rebuild-site] Calling Claude Sonnet for iteration...");
    const output = await callSonnet(
      SONNET_ITERATION_SYSTEM_PROMPT,
      buildIterationUserPrompt(currentCode, modification, site.briefJson as any)
    );

    // 4. Parse modified files
    const modifiedFiles = parseGeneratedFiles(output);
    if (modifiedFiles.length === 0) {
      throw new Error("No modified files in Sonnet output");
    }

    // 5. Write modified files
    for (const file of modifiedFiles) {
      const filePath = path.join(siteDir, file.filename);
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, "utf-8");
      console.log(\`[rebuild-site] Updated \${file.filename}\`);
    }

    // 6. Create new version
    const newVersion = site.currentVersion + 1;
    const codeStoragePath = \`sites/\${siteId}/v\${newVersion}/\`;

    await prisma.siteVersion.create({
      data: {
        siteId,
        versionNumber: newVersion,
        codeStoragePath,
        briefJsonSnapshot: site.briefJson as any,
        changeDescription: modification,
      },
    });

    // 7. Update site
    await prisma.site.update({
      where: { id: siteId },
      data: {
        currentVersion: newVersion,
        status: "live",
      },
    });

    console.log(\`[rebuild-site] Site \${site.slug} updated to v\${newVersion} (\${modifiedFiles.length} files modified)\`);

  } catch (error: any) {
    console.error(\`[rebuild-site] Error:\`, error.message);

    await prisma.site.update({
      where: { id: siteId },
      data: { errorMessage: error.message },
    });

    throw error;
  }
}
```

- [ ] **Step 3: Update worker/src/index.ts to include rebuild handler**

Add import and case:

```typescript
import { handleRebuildSite } from "./jobs/rebuild-site";

// In the switch:
case "rebuild-site":
  await handleRebuildSite(job.data);
  break;
```

- [ ] **Step 4: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add worker/src/
rtk git commit -m "feat: implement site iteration/rebuild handler with Sonnet"
```

---

### Task 5: Add Nginx config generation for custom domains

**Files:**
- Create: `worker/src/lib/nginx.ts`

- [ ] **Step 1: Create Nginx config generator**

Create `worker/src/lib/nginx.ts`:

```typescript
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const NGINX_CONF_DIR = process.env.NGINX_CONF_DIR || "/etc/nginx/conf.d";
const TEMPLATE_PATH = process.env.NGINX_TEMPLATE_PATH || "/app/docker/nginx/templates/client-site.conf.template";

export async function generateNginxConfig(domain: string, sitePath: string): Promise<void> {
  // Read template
  let template: string;
  try {
    template = await fs.readFile(TEMPLATE_PATH, "utf-8");
  } catch {
    // Fallback: generate config inline
    template = \`server {
    listen 80;
    server_name DOMAIN_NAME www.DOMAIN_NAME;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    root /var/www/sites-clients/SITE_PATH;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}\`;
  }

  // Replace placeholders
  const config = template
    .replace(/DOMAIN_NAME/g, domain)
    .replace(/SITE_PATH/g, sitePath);

  // Write config
  const configPath = path.join(NGINX_CONF_DIR, \`\${domain}.conf\`);
  await fs.writeFile(configPath, config, "utf-8");
  console.log(\`[nginx] Config written: \${configPath}\`);

  // Reload nginx
  try {
    await execAsync("docker compose exec nginx nginx -s reload");
    console.log("[nginx] Reloaded successfully");
  } catch (error: any) {
    console.warn("[nginx] Reload failed (may not be in Docker context):", error.message);
  }
}

export async function removeNginxConfig(domain: string): Promise<void> {
  const configPath = path.join(NGINX_CONF_DIR, \`\${domain}.conf\`);
  try {
    await fs.unlink(configPath);
    await execAsync("docker compose exec nginx nginx -s reload");
    console.log(\`[nginx] Removed config for \${domain}\`);
  } catch (error: any) {
    console.warn(\`[nginx] Failed to remove config for \${domain}:\`, error.message);
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add worker/src/lib/nginx.ts
rtk git commit -m "feat: add Nginx config generation for custom domains"
```

---

## Summary

| Task | Description | Est. time |
|------|-------------|-----------|
| 1 | Worker setup (Anthropic + Prisma) | 5 min |
| 2 | Generation prompt + file parser | 10 min |
| 3 | generate-site job handler | 15 min |
| 4 | Iteration/rebuild job handler | 10 min |
| 5 | Nginx config generation | 5 min |
| **Total** | | **~45 min** |

## Next Plan

After this plan is complete, proceed to **Plan 5: Domaines & DNS (OVH API)** which will:
- Implement domain search via OVH API
- Implement domain purchase flow (Stripe payment + OVH order)
- Implement DNS configuration (A record, CNAME, TXT)
- Trigger SSL certificate generation via Certbot
