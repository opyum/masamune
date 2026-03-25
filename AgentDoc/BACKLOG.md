# Masamune — Product Backlog

## Priorite: P0 (MVP)

### Epic 1: Infrastructure
- US-001: En tant que DevOps, je dois deployer l'infra Docker Compose sur le VPS Hostinger
- US-002: En tant que DevOps, je dois configurer Nginx comme reverse proxy avec virtual hosts dynamiques
- US-003: En tant que DevOps, je dois deployer Supabase self-hosted (PostgreSQL + GoTrue + Storage)
- US-004: En tant que DevOps, je dois configurer Redis pour BullMQ
- US-005: En tant que DevOps, je dois configurer Certbot pour SSL automatique
- US-006: En tant que DevOps, je dois configurer Dokploy pour le deploiement continu
- US-007: En tant que DevOps, je dois mettre en place les backups automatiques

### Epic 2: Auth & Core SaaS
- US-010: En tant qu'utilisateur, je peux m'inscrire avec email ou Google
- US-011: En tant qu'utilisateur, je peux me connecter et acceder a mon dashboard
- US-012: En tant qu'utilisateur, je peux creer un nouveau site (initie le chat onboarding)
- US-013: En tant qu'utilisateur, je peux voir la liste de mes sites avec leur statut
- US-014: En tant qu'utilisateur, je peux supprimer un site

### Epic 3: Pipeline IA — Qualifying
- US-020: En tant qu'utilisateur, je peux discuter avec l'IA pour decrire mon activite
- US-021: L'IA detecte mon secteur et adapte ses questions
- US-022: Je peux uploader des images/videos pendant le chat
- US-023: L'IA genere un brief structure (brief_json) a la fin de la conversation

### Epic 4: Pipeline IA — Generation
- US-030: Le Worker recoit un brief et genere le code du site via Claude Sonnet
- US-031: Le site est build en statique (SSG) automatiquement
- US-032: Le site est deploye dans le dossier Nginx et accessible via sous-domaine
- US-033: Je recois une notification temps reel quand mon site est pret
- US-034: Je peux demander des modifications via le chat (iterations)

### Epic 5: Domaines & DNS
- US-040: En tant qu'utilisateur Pro, je peux rechercher des noms de domaine disponibles
- US-041: Je vois les prix par TLD et des suggestions basees sur mon activite
- US-042: Je peux acheter un domaine (paiement Stripe + achat OVH automatique)
- US-043: Le DNS et SSL sont configures automatiquement apres l'achat

### Epic 6: Stripe & Billing
- US-050: En tant qu'utilisateur, je peux souscrire a un plan Pro/Business/Enterprise
- US-051: Je peux gerer mon abonnement (upgrade, downgrade, annuler)
- US-052: Je recois des factures conformes au droit francais
- US-053: Le systeme gere les paiements one-shot pour les domaines

### Epic 7: SEO automatique
- US-060: Le site genere inclut des meta tags, Schema.org, sitemap optimises
- US-061: Le site est soumis automatiquement a Google Search Console et Bing
- US-062: En tant qu'utilisateur Pro, je vois un rapport SEO de mon site
- US-063: En tant qu'utilisateur Business, je recois un suivi mensuel de mes positions

### Epic 8: OpenClaw
- US-070: En tant qu'utilisateur Pro, je peux lier mon WhatsApp/Telegram a mon compte
- US-071: Je peux modifier mon site via WhatsApp/Telegram
- US-072: Je recois des notifications proactives sur mes canaux

### Epic 9: Landing page & Dashboard
- US-080: La landing page masamune.fr presente le produit et convertit
- US-081: Le dashboard client permet de gerer tous mes sites
- US-082: Le chat IA avec apercu live est integre au dashboard

### Epic 10: Analytics & Email
- US-090: En tant qu'utilisateur, je recois des emails transactionnels (confirmation, alertes)
- US-091: En tant qu'utilisateur Business, je vois les analytics de mes sites

## Priorite: P1 (Post-MVP)
- US-100: Onboarding PME avance (plus de customisation)
- US-101: Templates par secteur d'activite
- US-102: Multi-langues (FR/EN)
- US-103: API publique (plan Enterprise)
- US-104: Design premium (plan Enterprise)
