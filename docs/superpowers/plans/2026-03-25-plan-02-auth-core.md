# Plan 2: Auth & Core SaaS (Next.js + Supabase + Prisma)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Next.js application with authentication, database schema, and core CRUD API routes for the Masamune SaaS platform.

**Architecture:** Next.js 14 App Router with TypeScript, Tailwind CSS, Prisma ORM connected to the existing PostgreSQL, Supabase Auth for authentication, and BullMQ connected to existing Redis.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, Supabase Auth (@supabase/supabase-js), BullMQ, Docker

**Spec:** `docs/superpowers/specs/2026-03-25-masamune-saas-design.md`

**Depends on:** Plan 1 (Infrastructure) — completed

---

### Task 1: Initialize Next.js project

**Files:**
- Create: `app/package.json`
- Create: `app/tsconfig.json`
- Create: `app/tailwind.config.ts`
- Create: `app/next.config.ts`
- Create: `app/src/app/layout.tsx`
- Create: `app/src/app/page.tsx`
- Create: `app/Dockerfile`

- [ ] **Step 1: Create Next.js app**

```bash
cd C:/2-Travail/Masamune
npx create-next-app@latest app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

- [ ] **Step 2: Create Dockerfile for the app**

Create `app/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

- [ ] **Step 3: Update next.config.ts for standalone output**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 4: Verify it builds**

```bash
cd app && npm run build
```

Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
cd C:/2-Travail/Masamune
git add app/
git commit -m "feat: initialize Next.js 14 app with TypeScript and Tailwind"
```

---

### Task 2: Add app and worker services to Docker Compose

**Files:**
- Modify: `docker-compose.yml`
- Create: `worker/package.json`
- Create: `worker/Dockerfile`
- Create: `worker/src/index.ts`

- [ ] **Step 1: Create minimal worker package**

Create `worker/package.json`:

```json
{
  "name": "masamune-worker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "bullmq": "^5.0.0",
    "ioredis": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "@types/node": "^20.0.0"
  }
}
```

Create `worker/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

Create `worker/src/index.ts`:

```typescript
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
```

- [ ] **Step 2: Create worker Dockerfile**

Create `worker/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

- [ ] **Step 3: Add app and worker to docker-compose.yml**

Add these services before the `nginx` service:

```yaml
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: masamune-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER:-masamune}:${POSTGRES_PASSWORD}@postgres:5432/masamune
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      NEXT_PUBLIC_SUPABASE_URL: ${SITE_URL:-http://localhost:3000}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY}
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:-}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET:-}
    networks:
      - masamune

  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile
    container_name: masamune-worker
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER:-masamune}:${POSTGRES_PASSWORD}@postgres:5432/masamune
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-}
      OVH_APP_KEY: ${OVH_APP_KEY:-}
      OVH_APP_SECRET: ${OVH_APP_SECRET:-}
      OVH_CONSUMER_KEY: ${OVH_CONSUMER_KEY:-}
    volumes:
      - ./sites-clients:/var/www/sites-clients
    networks:
      - masamune
```

Add `depends_on` to nginx:

```yaml
  nginx:
    ...
    depends_on:
      - app
```

- [ ] **Step 4: Add new env vars to .env.example**

```env
# Stripe
STRIPE_SECRET_KEY=CHANGE_ME
STRIPE_WEBHOOK_SECRET=CHANGE_ME

# Anthropic
ANTHROPIC_API_KEY=CHANGE_ME

# OVH
OVH_APP_KEY=CHANGE_ME
OVH_APP_SECRET=CHANGE_ME
OVH_CONSUMER_KEY=CHANGE_ME
```

- [ ] **Step 5: Commit**

```bash
git add worker/ docker-compose.yml .env.example
git commit -m "feat: add app and worker services to Docker Compose"
```

---

### Task 3: Set up Prisma and database schema

**Files:**
- Create: `app/prisma/schema.prisma`
- Create: `app/src/lib/prisma.ts`

- [ ] **Step 1: Install Prisma in the app**

```bash
cd app
npm install prisma @prisma/client
npx prisma init
```

- [ ] **Step 2: Write the complete Prisma schema**

Create `app/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Plan {
  free
  pro
  business
  enterprise
}

enum SiteStatus {
  drafting
  generating
  live
  partial
  error
}

enum JobType {
  generate
  rebuild
  domain_purchase
  dns_config
  seo_submit
}

enum JobStatus {
  queued
  processing
  completed
  failed
}

enum DomainStatus {
  searching
  purchased
  dns_configured
  ssl_active
  error
}

enum SubscriptionStatus {
  active
  cancelled
  past_due
}

enum AssetType {
  image
  video
  logo
}

enum MessageRole {
  user
  assistant
  system
}

enum Channel {
  whatsapp
  telegram
  discord
}

model User {
  id               String         @id @default(uuid()) @db.Uuid
  email            String         @unique
  plan             Plan           @default(free)
  stripeCustomerId String?        @map("stripe_customer_id")
  createdAt        DateTime       @default(now()) @map("created_at")
  sites            Site[]
  subscriptions    Subscription[]
  domains          Domain[]
  channelLinks     ChannelLink[]

  @@map("users")
}

model Site {
  id              String     @id @default(uuid()) @db.Uuid
  userId          String     @map("user_id") @db.Uuid
  slug            String     @unique
  customDomain    String?    @map("custom_domain")
  businessName    String     @map("business_name")
  businessType    String     @map("business_type")
  briefJson       Json?      @map("brief_json")
  status          SiteStatus @default(drafting)
  errorMessage    String?    @map("error_message")
  codeStoragePath String?    @map("code_storage_path")
  currentVersion  Int        @default(1) @map("current_version")
  seoConfig       Json?      @map("seo_config")
  createdAt       DateTime   @default(now()) @map("created_at")
  updatedAt       DateTime   @updatedAt @map("updated_at")

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  assets        SiteAsset[]
  conversations Conversation[]
  versions      SiteVersion[]
  domains       Domain[]
  jobs          Job[]

  @@map("sites")
}

model SiteVersion {
  id               String   @id @default(uuid()) @db.Uuid
  siteId           String   @map("site_id") @db.Uuid
  versionNumber    Int      @map("version_number")
  codeStoragePath  String   @map("code_storage_path")
  briefJsonSnapshot Json?   @map("brief_json_snapshot")
  changeDescription String? @map("change_description")
  createdAt        DateTime @default(now()) @map("created_at")

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@unique([siteId, versionNumber])
  @@map("site_versions")
}

model SiteAsset {
  id           String    @id @default(uuid()) @db.Uuid
  siteId       String    @map("site_id") @db.Uuid
  type         AssetType
  originalUrl  String    @map("original_url")
  optimizedUrl String?   @map("optimized_url")
  altText      String?   @map("alt_text")

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@map("site_assets")
}

model Conversation {
  id             String   @id @default(uuid()) @db.Uuid
  siteId         String   @map("site_id") @db.Uuid
  briefExtracted Boolean  @default(false) @map("brief_extracted")
  createdAt      DateTime @default(now()) @map("created_at")

  site     Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  messages Message[]

  @@map("conversations")
}

model Message {
  id             String      @id @default(uuid()) @db.Uuid
  conversationId String      @map("conversation_id") @db.Uuid
  role           MessageRole
  content        String
  attachments    Json?
  createdAt      DateTime    @default(now()) @map("created_at")

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@map("messages")
}

model Domain {
  id              String       @id @default(uuid()) @db.Uuid
  userId          String       @map("user_id") @db.Uuid
  siteId          String       @map("site_id") @db.Uuid
  domainName      String       @map("domain_name")
  registrar       String       @default("ovh")
  status          DomainStatus @default(searching)
  expiresAt       DateTime?    @map("expires_at")
  stripePaymentId String?      @map("stripe_payment_id")
  ovhOrderId      String?      @map("ovh_order_id")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@map("domains")
}

model Job {
  id          String    @id @default(uuid()) @db.Uuid
  siteId      String    @map("site_id") @db.Uuid
  type        JobType
  status      JobStatus @default(queued)
  payload     Json?
  result      Json?
  error       String?
  createdAt   DateTime  @default(now()) @map("created_at")
  completedAt DateTime? @map("completed_at")

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@map("jobs")
}

model Subscription {
  id                   String             @id @default(uuid()) @db.Uuid
  userId               String             @map("user_id") @db.Uuid
  stripeSubscriptionId String             @map("stripe_subscription_id")
  plan                 Plan
  status               SubscriptionStatus @default(active)
  currentPeriodEnd     DateTime           @map("current_period_end")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

model ChannelLink {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  channel   Channel
  senderId  String   @map("sender_id")
  verified  Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("channel_links")
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `app/src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Generate Prisma client and create migration**

```bash
cd app
npx prisma generate
npx prisma migrate dev --name init
```

- [ ] **Step 5: Commit**

```bash
cd C:/2-Travail/Masamune
git add app/prisma/ app/src/lib/prisma.ts app/package.json app/package-lock.json
git commit -m "feat: add Prisma schema with all Masamune data models"
```

---

### Task 4: Set up Supabase Auth client

**Files:**
- Create: `app/src/lib/supabase/server.ts`
- Create: `app/src/lib/supabase/client.ts`
- Create: `app/src/lib/supabase/middleware.ts`
- Create: `app/src/middleware.ts`

- [ ] **Step 1: Install Supabase packages**

```bash
cd app
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create server-side Supabase client**

Create `app/src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create browser-side Supabase client**

Create `app/src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 4: Create middleware for auth session refresh**

Create `app/src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated and trying to access dashboard
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

Create `app/src/middleware.ts`:

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 5: Commit**

```bash
cd C:/2-Travail/Masamune
git add app/src/lib/supabase/ app/src/middleware.ts app/package.json app/package-lock.json
git commit -m "feat: set up Supabase Auth with SSR middleware"
```

---

### Task 5: Create core API routes

**Files:**
- Create: `app/src/app/api/sites/route.ts`
- Create: `app/src/app/api/sites/[id]/route.ts`
- Create: `app/src/lib/auth.ts`
- Create: `app/src/lib/queue.ts`

- [ ] **Step 1: Create auth helper**

Create `app/src/lib/auth.ts`:

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  // Ensure user exists in our DB
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
      },
    });
  }

  return { user: dbUser, error: null };
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

- [ ] **Step 2: Create BullMQ queue helper**

Create `app/src/lib/queue.ts`:

```typescript
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
```

- [ ] **Step 3: Create sites API routes**

Create `app/src/app/api/sites/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

// GET /api/sites — list user's sites
export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const sites = await prisma.site.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      domains: { select: { domainName: true, status: true } },
    },
  });

  return NextResponse.json(sites);
}

// POST /api/sites — create a new site
export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const body = await request.json();
  const { businessName, businessType } = body;

  if (!businessName || !businessType) {
    return NextResponse.json(
      { error: "businessName and businessType are required" },
      { status: 400 }
    );
  }

  // Generate unique slug
  const baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.site.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Check plan limits
  const siteCount = await prisma.site.count({ where: { userId: user!.id } });
  const limits: Record<string, number> = {
    free: 1,
    pro: 1,
    business: 3,
    enterprise: 10,
  };
  if (siteCount >= (limits[user!.plan] || 1)) {
    return NextResponse.json(
      { error: "Site limit reached for your plan" },
      { status: 403 }
    );
  }

  const site = await prisma.site.create({
    data: {
      userId: user!.id,
      slug,
      businessName,
      businessType,
      status: "drafting",
    },
  });

  // Create initial conversation
  await prisma.conversation.create({
    data: { siteId: site.id },
  });

  return NextResponse.json(site, { status: 201 });
}
```

Create `app/src/app/api/sites/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

// GET /api/sites/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { id } = await params;

  const site = await prisma.site.findFirst({
    where: { id, userId: user!.id },
    include: {
      assets: true,
      domains: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 5 },
      conversations: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json(site);
}

// DELETE /api/sites/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { id } = await params;

  const site = await prisma.site.findFirst({
    where: { id, userId: user!.id },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  await prisma.site.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Install BullMQ and IORedis in app**

```bash
cd app
npm install bullmq ioredis
```

- [ ] **Step 5: Commit**

```bash
cd C:/2-Travail/Masamune
git add app/src/app/api/ app/src/lib/auth.ts app/src/lib/queue.ts app/package.json app/package-lock.json
git commit -m "feat: add core API routes (sites CRUD) with auth and queue"
```

---

### Task 6: Create auth pages (login/signup)

**Files:**
- Create: `app/src/app/login/page.tsx`
- Create: `app/src/app/login/actions.ts`
- Create: `app/src/app/signup/page.tsx`
- Create: `app/src/app/auth/callback/route.ts`

- [ ] **Step 1: Create login page**

Create `app/src/app/login/page.tsx`:

```tsx
import { login, loginWithGoogle } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Masamune</h1>
          <p className="mt-2 text-gray-600">Connectez-vous a votre compte</p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            formAction={login}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Se connecter
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        <form>
          <button
            formAction={loginWithGoogle}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Continuer avec Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Creer un compte
          </a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create login server actions**

Create `app/src/app/login/actions.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function loginWithGoogle() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=oauth_failed");
  }

  if (data.url) {
    redirect(data.url);
  }
}
```

- [ ] **Step 3: Create signup page**

Create `app/src/app/signup/page.tsx`:

```tsx
import { signup } from "./actions";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Masamune</h1>
          <p className="mt-2 text-gray-600">Creez votre site en 5 minutes</p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            formAction={signup}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Creer mon compte gratuitement
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Deja un compte ?{" "}
          <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
```

Create `app/src/app/signup/actions.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect("/signup?error=signup_failed");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
```

- [ ] **Step 4: Create OAuth callback route**

Create `app/src/app/auth/callback/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
}
```

- [ ] **Step 5: Commit**

```bash
cd C:/2-Travail/Masamune
git add app/src/app/login/ app/src/app/signup/ app/src/app/auth/
git commit -m "feat: add login, signup, and OAuth callback pages"
```

---

### Task 7: Create minimal dashboard page

**Files:**
- Create: `app/src/app/dashboard/page.tsx`
- Create: `app/src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create dashboard layout**

Create `app/src/app/dashboard/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Masamune</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Deconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create dashboard page**

Create `app/src/app/dashboard/page.tsx`:

```tsx
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      domains: { select: { domainName: true, status: true } },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Mes sites</h2>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Creer un site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun site pour le moment
          </h3>
          <p className="text-gray-600 mb-6">
            Creez votre premier site en quelques minutes grace a l&apos;IA.
          </p>
          <Link
            href="/dashboard/new"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Creer mon premier site
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/dashboard/sites/${site.id}`}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">{site.businessName}</h3>
              <p className="text-sm text-gray-500 mt-1">{site.businessType}</p>
              <div className="flex items-center gap-2 mt-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    site.status === "live"
                      ? "bg-green-100 text-green-800"
                      : site.status === "generating"
                      ? "bg-yellow-100 text-yellow-800"
                      : site.status === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {site.status}
                </span>
                <span className="text-xs text-gray-400">
                  {site.slug}.masamune.app
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create signout API route**

Create `app/src/app/api/auth/signout/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", process.env.SITE_URL));
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/2-Travail/Masamune
git add app/src/app/dashboard/ app/src/app/api/auth/
git commit -m "feat: add dashboard layout and sites list page"
```

---

## Summary

| Task | Description | Est. time |
|------|-------------|-----------|
| 1 | Initialize Next.js project | 5 min |
| 2 | Add app + worker to Docker Compose | 10 min |
| 3 | Prisma schema (all models) | 10 min |
| 4 | Supabase Auth client setup | 5 min |
| 5 | Core API routes (sites CRUD) | 10 min |
| 6 | Auth pages (login/signup) | 10 min |
| 7 | Dashboard page | 5 min |
| **Total** | | **~55 min** |

## Next Plan

After this plan is complete, proceed to **Plan 3: Pipeline IA Qualifying** which will:
- Implement the chat interface for onboarding
- Integrate Claude Haiku for the qualifying conversation
- Build the brief_json extraction logic
- Add file upload to Supabase Storage
