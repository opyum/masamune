# Masamune — SaaS de creation de sites web par IA

## Spec Document

**Date** : 2026-03-25
**Statut** : Valide
**Auteur** : CEO/PO + Claude (CTO virtuel)

---

## 1. Vision produit

Masamune est un SaaS qui permet aux TPE et PME de creer un site web professionnel en quelques minutes, sans aucune competence technique. Le client repond a quelques questions via un chat IA, et le systeme genere, deploie et reference automatiquement son site.

**Objectif** : Rendre obsoletes les CMS (Wix, WordPress) et surpasser les outils IA (Lovable, Bolt.new) en offrant un service tout-en-un ou le client n'a rien a configurer.

**Cible** :
- V1 : TPE / Independants (artisans, freelances, commerces locaux) — sites vitrine 1-5 pages
- V2 : PME (10-250 employes) — sites plus complexes, multi-pages, blog, integrations

---

## 2. Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend + Backend | Next.js (App Router, TypeScript) |
| Base de donnees | Supabase (PostgreSQL self-hosted) |
| Auth | Supabase GoTrue |
| Storage | Supabase Storage (S3-compatible) |
| CSS | Tailwind CSS |
| Queue async | BullMQ + Redis |
| Paiement | Stripe + Stripe Tax |
| Domaines | OVH API |
| IA qualifying | Claude Haiku (API Anthropic) |
| IA generation | Claude Sonnet (API Anthropic) |
| Canaux messaging | OpenClaw (WhatsApp, Telegram, Discord) |
| Infra | Docker Compose + Dokploy |
| Hebergement | VPS Hostinger (2 vCPU, 8GB RAM, 100GB NVMe) |
| Reverse proxy | Nginx |
| SSL | Let's Encrypt (Certbot) |
| Email | Resend (transactionnel) |
| Analytics | Umami (self-hosted, leger) |
| Dev | Claude Code Max |

---

## 2.1 Domaines et DNS Masamune

- `masamune.fr` : landing page marketing
- `app.masamune.fr` : plateforme/dashboard client
- `*.masamune.app` : sous-domaines gratuits des sites clients (ex: monsite.masamune.app)

Les deux domaines `masamune.fr` et `masamune.app` doivent etre enregistres.

---

## 3. Architecture globale

### 3.1 Vue d'ensemble

```
VPS Hostinger (Docker Compose + Dokploy)
|
|-- Nginx (reverse proxy + sites statiques clients)
|-- Next.js App (monolithe : dashboard, onboarding, API)
|-- Worker Node.js (BullMQ : generation, domaines, SEO)
|-- Redis (queue BullMQ)
|-- PostgreSQL (Supabase)
|-- Supabase Auth (GoTrue)
|-- Supabase Storage
|-- OpenClaw Gateway (WhatsApp, Telegram)
|-- Certbot (SSL auto-renewal)
```

### 3.2 Approche architecturale

**Monolithe + Queue async** : Un seul Next.js pour la plateforme + un Worker BullMQ separe pour les taches lourdes (generation de site, achat domaine, config DNS, SEO).

**Justification** : Le monolithe seul souffrirait quand un client lance une generation (appels API Claude, build SSG, config DNS = plusieurs minutes). Le worker async isole ces taches sans la complexite des micro-services. Redis est leger (~50MB RAM).

### 3.3 Deploiement des sites clients

**Combo statique + multi-tenant** :
- Sites clients : generes en SSG (HTML/CSS/JS statique), servis par Nginx
- Plateforme Masamune : multi-tenant, une seule app Next.js, routing par domaine

**Avantages** : PageSpeed 95+, SEO optimal, quasi zero ressources par site client, le VPS peut heberger des centaines de sites.

### 3.4 Budget RAM

| Service | RAM estimee |
|---------|-------------|
| Nginx | ~50MB |
| Redis | ~50MB |
| Supabase (PostgreSQL + GoTrue) | ~500MB |
| Next.js | ~300MB |
| Worker | ~200MB |
| OpenClaw | ~100MB |
| Marge OS | ~400MB |
| Umami | ~50MB |
| Resend | 0 (API externe) |
| **Total** | **~1.7GB / 8GB disponibles** |

### 3.5 Strategie de scaling

- **Worker concurrency** : BullMQ limite a 2 jobs simultanes (evite les pics RAM)
- **Backpressure** : au-dela de 10 jobs en queue, le client voit "Generation en file d'attente, temps estime : X min"
- **Seuil d'upgrade VPS** : quand >50 clients actifs ou RAM moyenne >6GB, migrer vers VPS 16GB (~20EUR/mois)
- **Separation future** : si >200 clients, deplacer le Worker sur un second VPS dedie

---

## 4. Modele de donnees

### users
- id (uuid, PK)
- email
- plan (free | pro | business | enterprise)
- stripe_customer_id
- created_at

### sites
- id (uuid, PK)
- user_id (FK -> users)
- slug (unique, pour sous-domaine)
- custom_domain (nullable)
- business_name
- business_type (boulangerie, plombier, etc.)
- brief_json (brief structure par Haiku)
- status (drafting | generating | live | error)
- error_message (text, nullable)
- code_storage_path (text, chemin vers Supabase Storage — le code source n'est PAS stocke en DB)
- current_version (integer, default 1)
- seo_config (jsonb : meta, keywords, schema.org)
- created_at
- updated_at

### site_versions
- id (uuid, PK)
- site_id (FK -> sites)
- version_number (integer)
- code_storage_path (text, chemin Supabase Storage vers cette version)
- brief_json_snapshot (jsonb, brief au moment de la generation)
- change_description (text, ce qui a change)
- created_at

Note : le code source genere est stocke dans Supabase Storage (pas en DB) pour eviter le bloat PostgreSQL. Chaque version est un snapshot complet permettant le rollback.

### site_assets
- id (uuid, PK)
- site_id (FK -> sites)
- type (image | video | logo)
- original_url (Supabase Storage)
- optimized_url
- alt_text (genere par IA)

### conversations
- id (uuid, PK)
- site_id (FK -> sites)
- brief_extracted (boolean)
- created_at

### messages
- id (uuid, PK)
- conversation_id (FK -> conversations)
- role (user | assistant | system)
- content (text)
- attachments (jsonb, nullable — refs vers assets uploades)
- created_at

Note : messages dans une table separee (pas JSONB array) pour un append-only performant et la recherche.

### domains
- id (uuid, PK)
- user_id (FK -> users, denormalise pour RLS)
- site_id (FK -> sites)
- domain_name
- registrar (ovh)
- status (searching | purchased | dns_configured | ssl_active | error)
- expires_at
- stripe_payment_id
- ovh_order_id

### jobs
- id (uuid, PK)
- site_id (FK -> sites)
- type (generate | rebuild | domain_purchase | dns_config | seo_submit)
- status (queued | processing | completed | failed)
- payload (jsonb)
- result (jsonb)
- error (text, nullable)
- created_at
- completed_at

### subscriptions
- id (uuid, PK)
- user_id (FK -> users)
- stripe_subscription_id
- plan (free | pro | business | enterprise)
- status (active | cancelled | past_due)
- current_period_end

### page_views (analytics)
- id (uuid, PK)
- site_id (FK -> sites)
- path (text)
- referrer (text, nullable)
- country (text, nullable)
- device (text : mobile | desktop | tablet)
- created_at

### channel_links (liaison OpenClaw)
- id (uuid, PK)
- user_id (FK -> users)
- channel (whatsapp | telegram | discord)
- sender_id (text, ex: +33612345678 ou @username)
- verified (boolean)
- created_at

Note : alternative — utiliser Umami self-hosted qui gere sa propre DB. Dans ce cas cette table n'est pas necessaire, Umami est integre via un script tracker injecte dans les sites generes.

---

## 4.1 API Routes (Next.js)

### Auth
- `POST /api/auth/signup` — inscription (proxy Supabase GoTrue)
- `POST /api/auth/login` — connexion
- `POST /api/auth/logout` — deconnexion

### Sites
- `GET /api/sites` — liste des sites de l'utilisateur
- `POST /api/sites` — creer un nouveau site (lance le chat onboarding)
- `GET /api/sites/:id` — detail d'un site
- `DELETE /api/sites/:id` — supprimer un site
- `POST /api/sites/:id/regenerate` — relancer la generation

### Chat
- `POST /api/chat/:siteId/message` — envoyer un message (qualifying ou iteration)
- `GET /api/chat/:siteId/history` — historique des messages

### Domaines
- `POST /api/domains/search` — rechercher disponibilite (OVH API)
- `POST /api/domains/purchase` — acheter un domaine (declenche Stripe + Worker)
- `GET /api/domains/:id/status` — statut du domaine (DNS, SSL)

### Stripe
- `POST /api/stripe/create-checkout` — creer une session Stripe Checkout
- `POST /api/stripe/webhook` — webhook Stripe (paiements, abonnements)
- `GET /api/stripe/portal` — lien vers le portail client Stripe

### SEO
- `GET /api/seo/:siteId/report` — rapport SEO du site
- `POST /api/seo/:siteId/resubmit` — resoumettre aux moteurs

### Jobs
- `GET /api/jobs/:siteId` — liste des jobs pour un site (progression temps reel via Supabase Realtime)

### OpenClaw webhook
- `POST /api/openclaw/incoming` — message entrant WhatsApp/Telegram

**Auth** : toutes les routes (sauf webhook Stripe et OpenClaw) necessitent un JWT Supabase valide. Les webhooks sont verifies par signature.

---

## 5. Parcours utilisateur

### 5.1 Inscription
- Sign up via email ou Google (Supabase Auth)
- Plan gratuit par defaut, sous-domaine monsite.masamune.app

### 5.2 Onboarding conversationnel (Chat IA)
- Haiku pose 5-10 questions adaptatives selon le secteur detecte
- Detection automatique du secteur d'activite
- Questions adaptees : Restaurant (menu, reservation), Artisan (zone, devis), Commerce (catalogue), Freelance (portfolio, RDV)
- Upload d'images/videos vers Supabase Storage
- Output : brief_json structure transmis au Worker via BullMQ

### 5.3 Generation (Worker async, 2-5 minutes)
1. Claude Sonnet recoit le brief + analyse le secteur
2. Genere le code HTML/CSS (Tailwind) + JS minimal, page par page
3. Integre les images/videos (optimisation automatique)
4. Build SSG -> fichiers statiques
5. Deploiement dans /var/www/sites-clients/[slug]/
6. Config Nginx virtual host
7. Notification temps reel au client (Supabase Realtime)

### 5.4 Previsualisation et iterations
- Le client voit son site sur monsite.masamune.app
- Modifications via chat : "Change la couleur en bleu"
- Patch cible (CSS) : ~30 secondes
- Modification structurelle (nouvelle section) : ~2 minutes
- Chaque iteration versionee, rollback possible
- Limite : 5 iterations/mois (gratuit), illimite (Pro+)

### 5.5 Upgrade + Domaine custom
- Upgrade via Stripe -> plan Pro
- Suggestions de noms de domaine (Sonnet + OVH API)
- Affichage prix par TLD, tri par pertinence SEO + prix
- Paiement domaine via Stripe -> achat OVH API automatique
- Config DNS automatique -> SSL Let's Encrypt -> site live

### 5.6 Canal WhatsApp/Telegram (via OpenClaw)
- Onboarding complet possible via WhatsApp
- Modifications du site via message
- Notifications proactives (visites, SEO, renouvellement domaine)
- Disponible en Pro (1 canal) et Business (tous canaux)

---

## 6. Pipeline IA

### 6.1 Phase 1 — Qualifying (Haiku)

**Input** : messages utilisateur
**Process** : Detection secteur, questions adaptatives, collecte assets, extraction infos
**Output** : brief_json structure

```json
{
  "business": { "name", "type", "location", "description" },
  "pages": ["accueil", "services", "contact"],
  "features": ["formulaire_contact", "google_maps", "horaires"],
  "style": { "tone": "chaleureux", "colors_hint": "naturel" },
  "assets": [ { "id", "type", "description" } ],
  "seo": { "target_keywords", "competitors", "locality" }
}
```

### 6.2 Phase 2 — Generation (Sonnet)

1. Analyse concurrentielle (sites concurrents du secteur/localite)
2. Architecture du site (pages, sections, navigation)
3. Design system (palette couleurs, typo, spacing par secteur)
4. Generation code (HTML/CSS Tailwind + JS minimal, page par page)
5. Integration assets (placement intelligent, alt-text SEO)
6. SEO on-page (meta tags, Schema.org, Open Graph, sitemap)
7. Responsive mobile-first (3 breakpoints)

### 6.3 Phase 3 — Iterations (Sonnet)

- Haiku analyse la demande : modification simple ou structurelle
- Simple -> patch cible (CSS uniquement)
- Structurelle -> re-generation partielle
- Sonnet recoit : brief_json + generated_code + demande de modif
- Genere un diff (pas tout le site)
- Re-build SSG -> deploiement

### 6.4 Garde-fous
- Limite iterations par plan
- Versioning de chaque iteration via table site_versions, rollback possible
- Si Haiku ne comprend pas -> demande de precisions

### 6.5 Gestion des erreurs generation

1. **Claude API timeout/rate limit** : retry avec backoff exponentiel (3 tentatives max)
2. **Code genere invalide** : validation HTML basique avant build SSG. Si echec, retry avec prompt corrige
3. **Build SSG echoue** : log l'erreur, notifier le client "Generation en cours de correction", retry 1x. Si echec persistant, alerte admin
4. **Generation partielle (3/5 pages OK)** : deployer les pages reussies, marquer le site en status "partial", notifier le client, relancer les pages manquantes
5. **Max retries atteint** : status "error" + error_message sur la table sites, notification client "Notre equipe a ete alertee", alerte email admin
6. **Jobs table** : chaque etape est tracee dans la table jobs avec son statut — le client voit la progression en temps reel

---

## 7. Automatisation domaines et DNS (OVH API)

### 7.1 Flow d'achat

1. **Suggestions** : Sonnet genere 5-10 suggestions basees sur le business
2. **Verification** : OVH API /domain/check -> dispo + prix par TLD
3. **Paiement** : Client paie via Stripe (one-shot)
4. **Achat** : Worker -> OVH API /order/cart -> create -> add domain -> checkout
5. **DNS** : OVH API /domain/zone/{domain}/record -> A record (IP VPS), CNAME www, TXT (Google Search Console)
6. **SSL** : Certbot / Let's Encrypt -> config Nginx HTTPS
7. **Notification** : "Votre site est live sur https://votre-domaine.fr"

### 7.2 Modele financier domaines
- Compte OVH preprovisionne (~500EUR)
- Client paie prix domaine + marge 2-5EUR
- Renouvellement annuel : rappel 30j avant -> paiement Stripe -> renouvellement OVH API

### 7.3 Gestion des erreurs
- Domaine plus dispo -> remboursement Stripe automatique + notification
- Echec DNS -> retry 3x puis alerte admin
- Echec SSL -> fallback HTTP temporaire + retry

---

## 8. SEO automatique

### 8.1 A la generation
- Meta title/description optimises (secteur + localite)
- Open Graph + Twitter Cards
- Schema.org : LocalBusiness, Restaurant, Store, ProfessionalService, BreadcrumbList
- robots.txt configure
- sitemap.xml genere

### 8.2 Post-deploiement (Worker async)
- Google Search Console API : ajout propriete, verification TXT DNS, soumission sitemap, demande indexation
- Bing Webmaster API : ajout site, soumission sitemap, IndexNow (indexation rapide)
- Analyse concurrentielle : 5 premiers resultats Google pour les mots-cles cibles
- Optimisation images : compression WebP, lazy loading, alt text SEO, dimensions par breakpoint

### 8.3 Monitoring (Pro/Business)
- Check hebdomadaire : indexation
- Suivi positions mots-cles (SerpAPI ou similaire)
- Alertes si chute de position
- Suggestions d'amelioration mensuelles par email

### 8.4 Differenciation par plan
- Gratuit : meta tags, sitemap, Schema.org
- Pro : + soumission moteurs, analyse concurrence, rapport SEO
- Business : + monitoring positions, suggestions mensuelles, audit technique

---

## 9. Infrastructure et DevOps

### 9.1 Docker Compose

```yaml
services:
  nginx:            # Reverse proxy + sites statiques clients
  app:              # Next.js monolithe
  worker:           # Worker BullMQ
  redis:            # Queue BullMQ
  postgres:         # Supabase PostgreSQL
  supabase-auth:    # GoTrue
  supabase-storage: # Storage S3-compatible
  openclaw:         # Gateway WhatsApp/Telegram
  certbot:          # SSL Let's Encrypt auto-renewal
```

### 9.2 Nginx dynamique

```
# Plateforme
app.masamune.fr -> Next.js (port 3000)

# Sous-domaines gratuits
*.masamune.app -> /var/www/sites-clients/{slug}/

# Domaines custom
boulangerie-vieux-lyon.fr -> /var/www/sites-clients/{domain}/
```

Template Nginx genere automatiquement par le Worker. `nginx -s reload` apres chaque ajout (zero downtime).

### 9.3 Volumes Docker

```
./data/postgres     -> donnees PostgreSQL
./data/redis        -> dump Redis
./data/storage      -> assets clients
./sites-clients/    -> fichiers statiques generes
./nginx/conf.d/     -> configs virtual hosts dynamiques
./certbot/          -> certificats SSL
./openclaw-config/  -> config OpenClaw
```

### 9.4 Securite
- UFW : ports 80, 443, 22 uniquement
- Fail2ban sur SSH
- Rate limiting Nginx sur l'API
- Supabase RLS sur toutes les tables
- Variables sensibles dans .env

### 9.4.1 Backup et restauration

**Ce qui est sauvegarde :**
- PostgreSQL : dump quotidien (pg_dump)
- Supabase Storage (assets clients) : sync quotidien
- Sites statiques (/var/www/sites-clients/) : sync quotidien
- Configs Nginx (/nginx/conf.d/) : sync quotidien
- OpenClaw config : sync quotidien

**Destination** : stockage S3-compatible externe (ex: Backblaze B2 ~0.005$/GB/mois, ou OVH Object Storage)

**Politique :**
- Retention : 7 backups quotidiens + 4 hebdomadaires + 2 mensuels
- RTO (Recovery Time Objective) : 1h
- RPO (Recovery Point Objective) : 24h (dernier backup quotidien)

**Procedure de restauration :**
1. Provisionner un nouveau VPS si necessaire
2. Restaurer Docker Compose + .env
3. Restaurer PostgreSQL (pg_restore)
4. Restaurer assets et sites statiques depuis S3
5. Restaurer configs Nginx
6. Verifier les healthchecks
7. Mettre a jour le DNS si changement d'IP

### 9.5 Monitoring
- Dokploy dashboard pour les containers
- Healthcheck endpoints sur app + worker
- Alertes email si container crash
- Log rotation

### 9.6 Deploiement continu
- Push sur main -> Dokploy rebuild automatique app + worker
- Rollback en un clic via Dokploy

---

## 10. Pricing

| Plan | Prix | Inclus |
|------|------|--------|
| Gratuit | 0EUR | 1 site, sous-domaine, 5 iterations/mois, SEO basique |
| Pro | 39EUR/mois (29EUR/mois annuel) | Domaine custom, SEO complet, iterations illimitees, 1 canal WhatsApp/Telegram |
| Business | 79EUR/mois (59EUR/mois annuel) | 3 sites, monitoring SEO, analytics, tous canaux, notifications proactives |
| Enterprise | 149EUR/mois | 10 sites, support dedie, design premium, API |

### Couts detailles par client/mois

| Poste | Gratuit | Pro | Business |
|-------|---------|-----|----------|
| Haiku qualifying (1 onboarding, ~5K tokens) | 0.01EUR | 0.01EUR | 0.01EUR |
| Sonnet generation initiale (~100K tokens) | 1.50EUR | 1.50EUR | 4.50EUR (x3 sites) |
| Sonnet iterations (5 gratuit, ~20 Pro, ~50 Biz) | 0.15EUR | 0.60EUR | 1.50EUR |
| SEO analyse Sonnet (~20K tokens) | 0EUR | 0.30EUR | 0.30EUR |
| SerpAPI monitoring | 0EUR | 0EUR | 2.00EUR |
| Infra repartie (VPS/Redis/PG/Nginx) | 0.10EUR | 0.30EUR | 0.50EUR |
| Umami analytics | 0EUR | 0EUR | 0.10EUR |
| Backups S3 | 0.01EUR | 0.02EUR | 0.05EUR |
| Stripe fees (2.9% + 0.25EUR) | 0EUR | 1.38EUR | 2.54EUR |
| **Total couts** | **~1.77EUR** | **~4.11EUR** | **~11.50EUR** |

Note : le cout du plan Gratuit est essentiellement la generation initiale (~1.50EUR par Sonnet). C'est le cout d'acquisition — acceptable si le taux de conversion vers Pro est >5%.

### Marges

| Plan | Revenu | Couts | Marge nette |
|------|--------|-------|-------------|
| Gratuit | 0EUR | ~1.77EUR | -1.77EUR (acquisition) |
| Pro | 39EUR | ~4.11EUR | ~34.89EUR (89%) |
| Business | 79EUR | ~11.50EUR | ~67.50EUR (85%) |
| Enterprise | 149EUR | ~15EUR | ~134EUR (90%) |

Domaines : marge additionnelle ~5-8EUR/domaine/an.
Abonnement annuel : le discount de 25% reduit la marge unitaire mais garantit 12 mois de retention.

---

## 11. Landing page (masamune.fr)

### Structure
1. **Hero** : "Votre site professionnel en 5 minutes, sans aucune competence technique" + CTA + demo animee
2. **Social proof** : nombre de sites crees, temoignages, avis
3. **Comment ca marche** : 3 etapes (Decrivez, L'IA cree, En ligne)
4. **Exemples** : galerie 6-8 sites par secteur (cliquables)
5. **Comparatif** : Masamune vs Agence / vs CMS / vs Lovable-Bolt
6. **Pricing** : toggle mensuel/annuel, CTA par plan
7. **FAQ** : 8-10 questions
8. **Footer** : mentions legales, CGV, contact

### Dashboard client (app.masamune.fr)
- Sidebar : Mes sites, Domaines, Abonnement, Aide, Parametres
- Par site : Previsualisation, Chat IA, Analytics, SEO, Parametres
- Chat IA : historique, input + upload, progression, apercu live (iframe split-screen)
- Zero jargon technique, mobile-friendly, notifications temps reel

---

## 12. Analyse concurrentielle et differenciation

### Problemes concurrents

**Lovable / Bolt.new** : code fragile, pas de vrai deploiement, pas de domaine custom, zero SEO, design generique IA, necessite de comprendre le code.

**Wix / WordPress / Webflow** : courbe d'apprentissage, templates identiques, performance mediocre, SEO necessite plugins payants, dependance plugins, heures de customisation.

### Differenciation Masamune

| Aspect | Concurrents | Masamune |
|--------|------------|----------|
| Creation | Templates ou code IA bancal | Conversation naturelle -> site fini |
| Deploiement | Manuel ou limite | 100% automatique |
| Domaine | Config manuelle | Achat + config en 1 clic |
| SEO | Plugins a configurer | Automatique des la mise en ligne |
| Performance | Lourd (CMS, JS) | Statique pur, PageSpeed 95+ |
| Maintenance | MAJ, plugins, securite | Zero maintenance cote client |
| Iterations | Drag & drop ou re-coder | "Change la couleur en bleu" |
| Canaux | Dashboard web uniquement | WhatsApp, Telegram, web |
| Cible | Devs ou power users | N'importe qui sachant ecrire |

### Avantages competitifs cles
1. Sites statiques = PageSpeed 95+
2. SEO day-one = reference des la mise en ligne
3. Zero friction = juste un chat
4. Tout inclus = domaine, SSL, SEO, hebergement, maintenance
5. WhatsApp/Telegram = gestion depuis le telephone
6. Prix agence divise par 10

---

## 13. Organisation des agents

### Equipe

| Agent | Role | Documentation |
|-------|------|---------------|
| CTO | Architecture globale, choix techniques, remise en question | AgentDoc/CTO/ |
| Architecte | Schemas detailles, API contracts, modele de donnees | AgentDoc/Architecte/ |
| UI/UX Designer | Design system, wireframes, prompts IA pour le design | AgentDoc/UIUXDesigner/ |
| Dev Frontend | Next.js, composants React, pages, integration Supabase | AgentDoc/DevFrontend/ |
| Dev Backend | API Routes, Worker BullMQ, integrations (OVH, Stripe, Claude) | AgentDoc/DevBackend/ |
| DevOps | Docker Compose, Dokploy, Nginx, SSL, monitoring | AgentDoc/DevOps/ |
| Prompt Engineer | Prompts Haiku/Sonnet, templates par secteur, prompts SEO | AgentDoc/PromptEngineer/ |
| Testeur QA | Tests E2E, tests API, tests generation, tests perf | AgentDoc/TesteurQA/ |
| Analyste Marche | Analyse concurrence, frustrations utilisateurs, features | AgentDoc/AnalysteMarche/ |
| Expert OpenClaw | Deploiement passerelle, config canaux, routing multi-agent | AgentDoc/ExpertOpenClaw/ |

### Workflow de communication

```
1. Analyste Marche -> analyse concurrence -> transmet au PO
2. PO -> redige User Stories -> transmet a l'Architecte
3. Architecte -> questions si flou, valide faisabilite -> transmet au CTO
4. CTO -> challenge, optimise, valide -> retour Architecte si ajustements
5. Architecte -> transmet au UI/UX Designer (ecrans) + Prompt Engineer (prompts IA)
6. UI/UX Designer -> design system + wireframes -> transmet aux Devs
7. Prompt Engineer -> catalogue prompts valides -> transmet au Dev Backend
8. Dev Frontend -> implemente les ecrans
9. Dev Backend -> implemente API + Worker
10. DevOps -> prepare infra Docker
11. Expert OpenClaw -> configure la passerelle multicanal
12. Testeur QA -> verifie chaque livraison
13. PO -> valide, propose prochaines features
```

### Fichiers partages
- AgentDoc/BACKLOG.md : US priorisees
- AgentDoc/DECISIONS.md : log des decisions architecturales
- AgentDoc/STATUS.md : etat d'avancement par agent

---

## 14. OpenClaw — Integration multicanal

### Cas d'usage

1. **Canal client alternatif** : modifications du site via WhatsApp/Telegram
2. **Onboarding via WhatsApp** : creation de site complete sans dashboard
3. **Notifications proactives** : visites, SEO, renouvellement domaine
4. **Multi-agent routing** : workspaces isolees (onboarding, modifications, support, admin)

### Deploiement
- Container Docker supplementaire (~100MB RAM)
- Config via openclaw.json (canaux, routing, tokens)
- Dashboard interne port 3001 (non expose publiquement, acces via reverse proxy authentifie)

### Integration technique avec Masamune

**Webhook entrant** : OpenClaw recoit un message WhatsApp/Telegram -> appelle `POST /api/openclaw/incoming` avec :
```json
{
  "channel": "whatsapp",
  "sender_id": "+33612345678",
  "message": "Je veux changer mes horaires",
  "attachments": [],
  "session_id": "openclaw-session-uuid"
}
```

**Liaison compte** : a l'upgrade Pro, le client lie son numero WhatsApp/Telegram via un code de verification :
1. Client entre son numero dans le dashboard
2. Masamune envoie un code 6 chiffres via OpenClaw -> WhatsApp
3. Client repond avec le code -> liaison confirmee
4. Le sender_id est associe au user_id dans une table `channel_links`

Note : la table `channel_links` est definie en Section 4 (modele de donnees).

**Multi-agent routing** :
- Workspace "onboarding" : messages sans site existant -> Agent Haiku qualifying
- Workspace "modifications" : messages avec site lie -> Agent Sonnet iterations
- Workspace "support" : messages contenant "aide", "probleme", "question" -> Agent Haiku FAQ
- Routing configure dans openclaw.json via regles keyword + contexte session

**Fallback** : si OpenClaw est indisponible, les messages sont mis en queue Redis et traites au retour. Le client recoit un message automatique "Service temporairement indisponible, utilisez app.masamune.fr".

**Rate limiting** : max 30 messages/heure par sender_id pour eviter les abus.

### Valeur par plan
- Gratuit : dashboard web uniquement
- Pro : + 1 canal (WhatsApp OU Telegram)
- Business : + tous canaux, notifications proactives

---

## 15. Legal et conformite

### RGPD
- **Donnees collectees** : email, nom business, adresse, telephone, images/videos uploadees
- **Base legale** : contrat (fourniture du service) pour les donnees necessaires, consentement pour le marketing
- **Droit a la suppression** : endpoint `DELETE /api/account` supprime toutes les donnees utilisateur, ses sites, assets, et conversations sous 30 jours
- **DPA (Data Processing Agreement)** : a rediger pour les sous-traitants (Anthropic, Stripe, OVH)
- **Localisation des donnees** : VPS en Europe (Hostinger), backups en Europe

### Pages legales obligatoires (masamune.fr)
- Mentions legales (identite editeur, hebergeur)
- CGV / Conditions Generales de Vente (abonnements, domaines, remboursement)
- Politique de confidentialite (RGPD)
- Politique cookies

### Pages legales injectees dans les sites clients
- Mentions legales du client (a renseigner lors de l'onboarding)
- Bandeau cookie (consentement RGPD, requis pour le tracker analytics)

### Domaines — conformite registrar
- OVH est accredite ICANN et registrar AFNIC (.fr)
- Masamune agit comme revendeur : le client reste le titulaire du domaine (whois)
- En cas de resiliation, le client conserve son domaine (transfert possible)

### Facturation
- Factures conformes au droit francais (numero sequentiel, TVA, coordonnees, date)
- Generees automatiquement via Stripe Invoicing
- Accessibles dans le dashboard client

---

## 16. Email transactionnel (Resend)

### Emails envoyes
- **Auth** : verification email, reset mot de passe (via Supabase + Resend SMTP)
- **Sites** : "Votre site est pret", "Modification appliquee", "Erreur de generation"
- **Domaines** : "Domaine achete", "DNS configure", "SSL actif", "Renouvellement dans 30j"
- **SEO** : rapport mensuel (Business), alerte chute de position
- **Billing** : confirmation paiement, echec paiement, relance

### Integration
- Resend API (gratuit jusqu'a 3000 emails/mois, puis ~1$/1000 emails)
- Templates email en React (react-email) pour un rendu pro
- Pas de container Docker necessaire : API externe
