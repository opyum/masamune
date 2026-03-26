# Cloudflare Pages Integration

## Overview

Masamune deploys client sites to Cloudflare Pages via Direct Upload API. Each client site gets its own Cloudflare Pages project with a `*.pages.dev` subdomain.

## Architecture

```
Generate route (/api/generate/[siteId])
  -> Gemini generates HTML files
  -> Stored in DB (site.codeStoragePath as JSON)
  -> Calls Deploy route

Deploy route (/api/deploy/[siteId])
  -> Reads files from DB
  -> Creates Cloudflare Pages project (idempotent)
  -> Uploads files via Direct Upload API
  -> Saves deployment URL in site.customDomain
```

## Files

| File | Purpose |
|------|---------|
| `app/src/lib/cloudflare.ts` | Cloudflare Pages API client |
| `app/src/app/api/deploy/[siteId]/route.ts` | POST endpoint to deploy a site |
| `app/src/app/api/generate/[siteId]/route.ts` | Modified to trigger deploy after generation |

## API Functions (`lib/cloudflare.ts`)

- **`createPagesProject(slug)`** - Creates a Pages project. Idempotent (returns existing project on 409).
- **`deployToPages(projectName, files)`** - Deploys files via Direct Upload. Builds a SHA-256 manifest and uploads files as multipart form-data.
- **`addCustomDomain(projectName, domain)`** - Adds a custom domain to a project (for when clients buy a domain via OVH).
- **`getDeploymentUrl(projectName)`** - Returns the `*.pages.dev` URL.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages:Edit permission |
| `JWT_SECRET` | Used for internal route authentication |

## Cloudflare API Token

Create at https://dash.cloudflare.com/profile/api-tokens with permissions:
- **Account** > Cloudflare Pages > Edit
- **Account** > Account Settings > Read

Account ID: `7c10bc4a4ce381cf394a074100d60524`

## Deploy Flow

1. Generate route calls `/api/deploy/[siteId]` after successful generation
2. Deploy route parses files from `site.codeStoragePath` (JSON map of filename -> content)
3. `createPagesProject(slug)` creates or fetches the Pages project
4. `deployToPages(slug, files)` builds a manifest (SHA-256 hashes) and uploads via multipart/form-data
5. `site.customDomain` is updated with the `*.pages.dev` URL

## Custom Domains

When a client purchases a domain (via OVH), call `addCustomDomain(projectName, domain)` to attach it to the Pages project. DNS must point to Cloudflare (CNAME to `*.pages.dev`).

## Error Handling

- Deploy errors in the generate route are non-blocking (logged as warnings)
- The deploy route returns proper HTTP errors for missing sites/files
- Project creation is idempotent to handle retries
