# Plan 6: Stripe & Billing (Subscriptions, Plans, Webhooks)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete billing system with Stripe: subscription plans (Free/Pro/Business/Enterprise), checkout, customer portal, webhooks for plan changes, and Stripe Tax for EU compliance.

**Architecture:** Next.js API routes create Stripe Checkout sessions and customer portal links. Stripe webhooks update user plans in the database. Stripe Tax handles EU VAT automatically.

**Tech Stack:** Stripe (@stripe/stripe-js, stripe), Next.js API routes, Prisma

**Spec:** `docs/superpowers/specs/2026-03-25-masamune-saas-design.md` (sections 10, 15)

**Depends on:** Plan 2 (Auth & Core) — completed

---

### Task 1: Set up Stripe SDK and products

**Files:**
- Create: `app/src/lib/stripe.ts`
- Create: `app/src/lib/stripe-products.ts`

- [ ] **Step 1: Install Stripe packages**

```bash
cd C:/2-Travail/Masamune/app
npm install stripe @stripe/stripe-js
```

- [ ] **Step 2: Create Stripe server client**

Create `app/src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
```

- [ ] **Step 3: Create product/price configuration**

Create `app/src/lib/stripe-products.ts`:

```typescript
export const PLANS = {
  free: {
    name: "Gratuit",
    price: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: [
      "1 site",
      "Sous-domaine masamune.app",
      "5 modifications/mois",
      "SEO basique",
    ],
    limits: { sites: 1, iterationsPerMonth: 5 },
  },
  pro: {
    name: "Pro",
    price: 39,
    priceYearly: 29,
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
    features: [
      "1 site",
      "Domaine custom",
      "SEO complet",
      "Modifications illimitees",
      "WhatsApp ou Telegram",
    ],
    limits: { sites: 1, iterationsPerMonth: -1 },
  },
  business: {
    name: "Business",
    price: 79,
    priceYearly: 59,
    stripePriceIdMonthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || "",
    features: [
      "3 sites",
      "Domaines custom",
      "Monitoring SEO",
      "Analytics",
      "Tous les canaux",
      "Notifications proactives",
    ],
    limits: { sites: 3, iterationsPerMonth: -1 },
  },
  enterprise: {
    name: "Enterprise",
    price: 149,
    stripePriceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
    stripePriceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
    features: [
      "10 sites",
      "Support dedie",
      "Design premium",
      "API",
    ],
    limits: { sites: 10, iterationsPerMonth: -1 },
  },
} as const;

export type PlanKey = keyof typeof PLANS;
```

- [ ] **Step 4: Add Stripe price env vars to .env.example**

```env
# Stripe Price IDs (create in Stripe Dashboard or via API)
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_xxx
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxx
```

- [ ] **Step 5: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/lib/stripe.ts app/src/lib/stripe-products.ts app/package.json app/package-lock.json .env.example
rtk git commit -m "feat: set up Stripe SDK with plan configuration"
```

---

### Task 2: Create subscription checkout and portal routes

**Files:**
- Create: `app/src/app/api/stripe/create-checkout/route.ts`
- Create: `app/src/app/api/stripe/portal/route.ts`

- [ ] **Step 1: Create checkout route**

Creates a Stripe Checkout session for subscription (monthly or yearly), with automatic_tax enabled, and redirects to success/cancel URLs.

- [ ] **Step 2: Create portal route**

Creates a Stripe Billing Portal session so the user can manage their subscription (upgrade, downgrade, cancel, update payment method).

- [ ] **Step 3: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/app/api/stripe/
rtk git commit -m "feat: add Stripe checkout and customer portal routes"
```

---

### Task 3: Create Stripe webhook handler

**Files:**
- Create: `app/src/app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Create webhook route**

Handle these Stripe events:
- `checkout.session.completed` — create subscription record, update user plan
- `customer.subscription.updated` — update plan on upgrade/downgrade
- `customer.subscription.deleted` — revert to free plan
- `invoice.payment_failed` — update subscription status to past_due
- `checkout.session.completed` with domain metadata — trigger domain purchase

Verify webhook signature using STRIPE_WEBHOOK_SECRET.

- [ ] **Step 2: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/app/api/stripe/webhook/
rtk git commit -m "feat: add Stripe webhook handler for subscriptions and domains"
```

---

### Task 4: Create pricing page component

**Files:**
- Create: `app/src/components/pricing/PricingTable.tsx`
- Create: `app/src/app/pricing/page.tsx`
- Create: `app/src/app/dashboard/billing/page.tsx`

- [ ] **Step 1: Create PricingTable component** with plan cards, monthly/yearly toggle, CTA buttons linking to checkout.

- [ ] **Step 2: Create public pricing page** at /pricing.

- [ ] **Step 3: Create dashboard billing page** showing current plan, usage, and upgrade/manage buttons.

- [ ] **Step 4: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/components/pricing/ app/src/app/pricing/ app/src/app/dashboard/billing/
rtk git commit -m "feat: add pricing table and billing dashboard page"
```

---

## Summary

| Task | Description | Est. time |
|------|-------------|-----------|
| 1 | Stripe SDK + plan config | 5 min |
| 2 | Checkout + portal routes | 10 min |
| 3 | Webhook handler | 15 min |
| 4 | Pricing page + billing dashboard | 10 min |
| **Total** | | **~40 min** |

## Next Plan
Plan 7: SEO automatique (Google Search Console, Bing, sitemap, Schema.org)
