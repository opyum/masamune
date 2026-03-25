# Plan 9: Landing Page & Dashboard UI

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production landing page (masamune.fr) and polish the dashboard UI using the design system from AgentDoc/UIUXDesigner/.

**Design refs:**
- `AgentDoc/UIUXDesigner/design-system.md` — Colors, typography, components, Tailwind classes
- `AgentDoc/UIUXDesigner/user-flows.md` — Wireframes for all screens
- `AgentDoc/AnalysteMarche/user-pain-points.md` — Positioning and messaging

**Depends on:** Plan 2 (Auth), Plan 6 (Billing/Pricing)

---

### Task 1: Landing page (masamune.fr)

**Files:**
- Create: `app/src/app/(marketing)/page.tsx`
- Create: `app/src/app/(marketing)/layout.tsx`
- Create: `app/src/components/landing/Hero.tsx`
- Create: `app/src/components/landing/HowItWorks.tsx`
- Create: `app/src/components/landing/Examples.tsx`
- Create: `app/src/components/landing/Comparison.tsx`
- Create: `app/src/components/landing/FAQ.tsx`
- Create: `app/src/components/landing/Footer.tsx`

Sections:
1. Hero — "Decrivez votre activite. Votre site est en ligne." + CTA + demo animation
2. Social proof — counter + testimonials
3. How it works — 3 steps (Decrivez, L'IA cree, En ligne)
4. Examples — gallery of 6 demo sites by sector
5. Comparison — Masamune vs Agence / CMS / Lovable-Bolt
6. Pricing — reuse PricingTable component from Plan 6
7. FAQ — 8-10 questions
8. Footer — legal links, contact

- [ ] **Step 1-8:** Create each component and assemble the page
- [ ] **Step 9:** Commit

### Task 2: Polish dashboard

- [ ] **Step 1:** Apply design system to dashboard layout (sidebar nav, brand colors)
- [ ] **Step 2:** Add domains management page at /dashboard/domains
- [ ] **Step 3:** Add site preview iframe at /dashboard/sites/[id] alongside chat
- [ ] **Step 4:** Commit

### Task 3: Legal pages

- [ ] **Step 1:** Create /mentions-legales, /cgu, /confidentialite pages (placeholder content)
- [ ] **Step 2:** Commit

---

## Summary
| Task | Est. time |
|------|-----------|
| 1. Landing page | 30 min |
| 2. Dashboard polish | 20 min |
| 3. Legal pages | 5 min |
| **Total** | **~55 min** |
