# Plan 8: OpenClaw Integration (WhatsApp/Telegram)

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy OpenClaw gateway, configure WhatsApp/Telegram channels, implement channel linking for Pro+ users, and route messages to the chat API.

**Depends on:** Plan 1 (Infra), Plan 3 (Qualifying)

---

### Task 1: Add OpenClaw to Docker Compose

- [ ] **Step 1:** Add openclaw service to docker-compose.yml (~100MB RAM)
- [ ] **Step 2:** Create openclaw-config/openclaw.json with channel config, routing rules
- [ ] **Step 3:** Commit

### Task 2: Create incoming webhook route

**Files:**
- Create: `app/src/app/api/openclaw/incoming/route.ts`

- [ ] **Step 1:** Handle incoming messages from OpenClaw (WhatsApp/Telegram)
- [ ] **Step 2:** Look up user via channel_links table by sender_id
- [ ] **Step 3:** Route to appropriate handler (onboarding/modification/support)
- [ ] **Step 4:** Send response back via OpenClaw API
- [ ] **Step 5:** Commit

### Task 3: Channel linking flow

**Files:**
- Create: `app/src/app/api/channels/link/route.ts`
- Create: `app/src/app/api/channels/verify/route.ts`
- Create: `app/src/app/dashboard/channels/page.tsx`

- [ ] **Step 1:** Create link route — sends 6-digit code via OpenClaw to user's WhatsApp/Telegram
- [ ] **Step 2:** Create verify route — validates code, creates channel_link record
- [ ] **Step 3:** Create dashboard page for managing linked channels
- [ ] **Step 4:** Commit

### Task 4: Proactive notifications

- [ ] **Step 1:** Create notification sender utility that sends messages via OpenClaw
- [ ] **Step 2:** Integrate with domain status changes, SEO reports, site visit milestones
- [ ] **Step 3:** Commit

---

## Summary
| Task | Est. time |
|------|-----------|
| 1. Docker Compose + config | 10 min |
| 2. Incoming webhook | 15 min |
| 3. Channel linking | 15 min |
| 4. Notifications | 10 min |
| **Total** | **~50 min** |
