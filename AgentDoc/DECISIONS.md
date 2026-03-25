# Masamune — Decisions Log

## 2026-03-25 — Architecture initiale

### DEC-001: Monolithe + Worker async
- **Decideur**: CTO
- **Choix**: Next.js monolithe + Worker BullMQ separe
- **Alternatives rejetees**: Micro-services (trop complexe pour 8GB RAM), Monolithe pur (bloquerait l'UX pendant la generation)
- **Raison**: Equilibre simplicite/performance. Redis ~50MB, Worker isole les taches lourdes.

### DEC-002: Sites clients en statique (SSG)
- **Decideur**: CTO + Architecte
- **Choix**: Generation HTML/CSS/JS statique servi par Nginx
- **Alternatives rejetees**: Container Docker par client (trop gourmand), SSR par client (inutile pour des vitrine)
- **Raison**: PageSpeed 95+, quasi zero ressources, des centaines de sites sur un VPS 8GB.

### DEC-003: Supabase self-hosted
- **Decideur**: CTO
- **Choix**: PostgreSQL + GoTrue + Storage auto-heberge
- **Alternatives rejetees**: Supabase cloud (cout recurrent), Firebase (vendor lock-in)
- **Raison**: Controle total, zero cout SaaS, donnees en Europe.

### DEC-004: OVH pour les domaines
- **Decideur**: PO + CTO
- **Choix**: OVH API pour achat/config domaines
- **Alternatives rejetees**: Cloudflare (pas de .fr a prix coutant), Gandi (plus cher), Namecheap (moins adapte FR)
- **Raison**: API complete, bons prix .fr, registrar francais.

### DEC-005: Haiku qualifying + Sonnet generation
- **Decideur**: CTO + Prompt Engineer
- **Choix**: Haiku pour le chat conversationnel, Sonnet pour la generation de code
- **Alternatives rejetees**: LLM local (VPS sans GPU), tout Sonnet (trop cher pour le chat)
- **Raison**: Haiku ~20x moins cher que Sonnet, suffisant pour poser des questions.

### DEC-006: OpenClaw pour le multicanal
- **Decideur**: CTO + Expert OpenClaw
- **Choix**: OpenClaw Gateway auto-heberge
- **Alternatives rejetees**: Twilio (payant par message), dev custom WhatsApp Business API (trop complexe)
- **Raison**: Open source, leger (~100MB), multi-canal natif, routing multi-agent.

### DEC-007: Pricing Freemium 0/39/79/149
- **Decideur**: PO
- **Choix**: 4 plans avec freemium
- **Raison**: Le gratuit coute ~1.77EUR/client (acquisition). Marge 85-90% sur les plans payants.
