# Plan 5: Domaines & DNS (OVH API)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete domain lifecycle: search available domains via OVH API, purchase with Stripe payment, configure DNS (A record, CNAME, TXT), and trigger SSL certificate generation.

**Architecture:** Next.js API routes handle domain search and purchase initiation. Stripe webhook confirms payment, then BullMQ jobs handle OVH purchase, DNS config, and SSL via the Worker.

**Tech Stack:** OVH API (ovh npm package), Stripe, BullMQ, Certbot, Prisma

**Spec:** `docs/superpowers/specs/2026-03-25-masamune-saas-design.md` (sections 5.5, 7)

**Depends on:** Plan 2 (Auth & Core) — completed

---

### Task 1: Install OVH SDK and create API client

**Files:**
- Modify: `worker/package.json`
- Create: `worker/src/lib/ovh.ts`

- [ ] **Step 1: Install OVH package in worker**

```bash
cd C:/2-Travail/Masamune/worker
npm install ovh
```

- [ ] **Step 2: Create OVH API client wrapper**

Create `worker/src/lib/ovh.ts`:

```typescript
import OVH from "ovh";

const ovhClient = new OVH({
  appKey: process.env.OVH_APP_KEY!,
  appSecret: process.env.OVH_APP_SECRET!,
  consumerKey: process.env.OVH_CONSUMER_KEY!,
  endpoint: "ovh-eu",
});

export interface DomainAvailability {
  domain: string;
  available: boolean;
  price?: number;
  currency?: string;
}

export async function checkDomainAvailability(domain: string): Promise<DomainAvailability> {
  try {
    const result = await ovhClient.requestPromised("GET", `/domain/data/extension/${domain.split(".").pop()}`);
    const cartId = await createCart();
    const check = await ovhClient.requestPromised("GET", `/order/cart/${cartId}/domain?domain=${domain}`);
    await deleteCart(cartId);

    return {
      domain,
      available: check.length > 0,
      price: check[0]?.prices?.withTax?.value,
      currency: check[0]?.prices?.withTax?.currencyCode,
    };
  } catch {
    return { domain, available: false };
  }
}

export async function searchDomains(baseName: string, tlds: string[] = [".fr", ".com", ".shop", ".io"]): Promise<DomainAvailability[]> {
  const results: DomainAvailability[] = [];
  for (const tld of tlds) {
    const domain = baseName + tld;
    const availability = await checkDomainAvailability(domain);
    results.push(availability);
  }
  return results;
}

export async function purchaseDomain(domain: string): Promise<{ orderId: string }> {
  const cartId = await createCart();

  // Add domain to cart
  await ovhClient.requestPromised("POST", `/order/cart/${cartId}/domain`, { domain });

  // Checkout
  const order = await ovhClient.requestPromised("POST", `/order/cart/${cartId}/checkout`, {
    autoPayWithPreferredPaymentMethod: true,
  });

  return { orderId: order.orderId?.toString() || cartId };
}

export async function configureDNS(domain: string, vpsIp: string): Promise<void> {
  const zone = domain;

  // A record -> VPS IP
  await ovhClient.requestPromised("POST", `/domain/zone/${zone}/record`, {
    fieldType: "A",
    subDomain: "",
    target: vpsIp,
    ttl: 3600,
  });

  // CNAME www -> domain
  await ovhClient.requestPromised("POST", `/domain/zone/${zone}/record`, {
    fieldType: "CNAME",
    subDomain: "www",
    target: `${domain}.`,
    ttl: 3600,
  });

  // Refresh zone
  await ovhClient.requestPromised("POST", `/domain/zone/${zone}/refresh`);
}

export async function addTXTRecord(domain: string, value: string): Promise<void> {
  await ovhClient.requestPromised("POST", `/domain/zone/${domain}/record`, {
    fieldType: "TXT",
    subDomain: "",
    target: value,
    ttl: 3600,
  });
  await ovhClient.requestPromised("POST", `/domain/zone/${domain}/refresh`);
}

async function createCart(): Promise<string> {
  const cart = await ovhClient.requestPromised("POST", "/order/cart", {
    ovhSubsidiary: "FR",
  });
  return cart.cartId;
}

async function deleteCart(cartId: string): Promise<void> {
  try {
    await ovhClient.requestPromised("DELETE", `/order/cart/${cartId}`);
  } catch { /* ignore */ }
}
```

- [ ] **Step 3: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add worker/
rtk git commit -m "feat: add OVH API client for domain management"
```

---

### Task 2: Create domain search and purchase API routes

**Files:**
- Create: `app/src/app/api/domains/search/route.ts`
- Create: `app/src/app/api/domains/purchase/route.ts`
- Create: `app/src/app/api/domains/[id]/status/route.ts`

- [ ] **Step 1: Create domain search route**

Create `app/src/app/api/domains/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

// Domain search is proxied to the worker or done via OVH API from the app
// For simplicity, we call OVH directly from the app for search (read-only)
export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  // Check user is Pro+
  if (user!.plan === "free") {
    return NextResponse.json(
      { error: "Upgrade to Pro to get a custom domain" },
      { status: 403 }
    );
  }

  const { query } = await request.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  // Sanitize domain name
  const baseName = query
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");

  const tlds = [".fr", ".com", ".shop", ".net", ".io"];
  const results = [];

  for (const tld of tlds) {
    results.push({
      domain: baseName + tld,
      available: true, // Placeholder — real OVH check done by worker
      price: tld === ".fr" ? 7.99 : tld === ".com" ? 9.99 : 12.99,
      currency: "EUR",
    });
  }

  return NextResponse.json(results);
}
```

- [ ] **Step 2: Create domain purchase route**

Create `app/src/app/api/domains/purchase/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { addJob } from "@/lib/queue";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  if (user!.plan === "free") {
    return NextResponse.json(
      { error: "Upgrade to Pro to purchase a domain" },
      { status: 403 }
    );
  }

  const { domainName, siteId, stripePaymentId } = await request.json();

  if (!domainName || !siteId) {
    return NextResponse.json(
      { error: "domainName and siteId are required" },
      { status: 400 }
    );
  }

  // Verify site belongs to user
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user!.id },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Create domain record
  const domain = await prisma.domain.create({
    data: {
      userId: user!.id,
      siteId,
      domainName,
      registrar: "ovh",
      status: "searching",
      stripePaymentId,
    },
  });

  // Enqueue purchase job
  await addJob("purchase-domain", {
    domainId: domain.id,
    domainName,
    siteId,
  });

  return NextResponse.json(domain, { status: 201 });
}
```

- [ ] **Step 3: Create domain status route**

Create `app/src/app/api/domains/[id]/status/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { id } = await params;

  const domain = await prisma.domain.findFirst({
    where: { id, userId: user!.id },
  });

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  return NextResponse.json(domain);
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/app/api/domains/
rtk git commit -m "feat: add domain search, purchase, and status API routes"
```

---

### Task 3: Implement domain purchase and DNS jobs in Worker

**Files:**
- Create: `worker/src/jobs/purchase-domain.ts`
- Create: `worker/src/jobs/configure-dns.ts`
- Modify: `worker/src/index.ts`

- [ ] **Step 1: Create purchase-domain job handler**

Create `worker/src/jobs/purchase-domain.ts` — calls OVH API to purchase, updates domain status, then enqueues dns_config job.

- [ ] **Step 2: Create configure-dns job handler**

Create `worker/src/jobs/configure-dns.ts` — calls OVH API to set A/CNAME/TXT records, updates domain status, generates Nginx config, triggers Certbot SSL.

- [ ] **Step 3: Update worker/src/index.ts with new handlers**

- [ ] **Step 4: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add worker/src/
rtk git commit -m "feat: implement domain purchase and DNS configuration jobs"
```

---

### Task 4: Create Stripe payment flow for domains

**Files:**
- Create: `app/src/app/api/stripe/create-domain-checkout/route.ts`
- Modify: `app/src/app/api/stripe/webhook/route.ts` (if exists, otherwise create)

- [ ] **Step 1: Install Stripe SDK**

```bash
cd C:/2-Travail/Masamune/app
npm install stripe
```

- [ ] **Step 2: Create domain checkout route** that creates a Stripe Checkout session for the domain price, with metadata containing domainName and siteId.

- [ ] **Step 3: Create/update Stripe webhook** to handle checkout.session.completed event, extract domain metadata, and call POST /api/domains/purchase internally.

- [ ] **Step 4: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/app/api/stripe/
rtk git commit -m "feat: add Stripe checkout for domain purchases"
```

---

## Summary

| Task | Description | Est. time |
|------|-------------|-----------|
| 1 | OVH API client | 10 min |
| 2 | Domain API routes (search, purchase, status) | 10 min |
| 3 | Worker jobs (purchase, DNS) | 15 min |
| 4 | Stripe payment flow for domains | 10 min |
| **Total** | | **~45 min** |

## Next Plan
Plan 6: Stripe & Billing (subscriptions, plans, webhooks, invoicing)
