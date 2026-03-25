# Docker Setup — Masamune Infrastructure

## Services

| Service | Image | Port (host) | Purpose |
|---------|-------|-------------|---------|
| postgres | postgres:15-alpine | 127.0.0.1:5432 | Base de donnees principale |
| redis | redis:7-alpine | 127.0.0.1:6379 | Queue BullMQ |
| supabase-auth | supabase/gotrue:v2.151.0 | interne (9999) | Authentification |
| supabase-rest | postgrest/postgrest:v12.0.1 | interne (3000) | API REST PostgreSQL |
| supabase-storage | supabase/storage-api:v1.0.6 | interne (5000) | Stockage fichiers |
| nginx | nginx:alpine | 80, 443 | Reverse proxy + sites statiques |
| certbot | certbot/certbot | - | SSL Let's Encrypt |
| umami | umami:postgresql-latest | 127.0.0.1:3001 | Analytics |

## Commandes

```bash
# Demarrer tout
docker compose up -d

# Arreter tout
docker compose down

# Voir les logs d'un service
docker compose logs -f <service>

# Rebuild un service
docker compose up -d --build <service>

# Statut
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

## Variables d'environnement

Copier `.env.example` vers `.env` et remplir toutes les valeurs `CHANGE_ME`.

| Variable | Description |
|----------|-------------|
| POSTGRES_USER | Utilisateur PostgreSQL (default: masamune) |
| POSTGRES_PASSWORD | Mot de passe PostgreSQL |
| REDIS_PASSWORD | Mot de passe Redis |
| JWT_SECRET | Secret JWT pour Supabase Auth (openssl rand -base64 32) |
| API_EXTERNAL_URL | URL externe GoTrue |
| SITE_URL | URL du frontend Next.js |
| SMTP_HOST/PORT/USER/PASS | Config email Resend |
| SUPABASE_ANON_KEY | Cle anonyme Supabase (generer via JWT) |
| SUPABASE_SERVICE_KEY | Cle service Supabase (generer via JWT) |
| UMAMI_APP_SECRET | Secret Umami |

## Volumes

| Volume | Contenu |
|--------|---------|
| postgres_data | Donnees PostgreSQL |
| redis_data | Dump Redis (AOF) |
| storage_data | Assets clients (images, videos) |
| certbot_conf | Certificats SSL |
| certbot_www | Challenge ACME |

## Reseau

Tous les services sont sur le reseau Docker `masamune` (bridge). Seuls nginx (80/443), postgres (127.0.0.1:5432), redis (127.0.0.1:6379) et umami (127.0.0.1:3001) exposent des ports. Les ports 127.0.0.1 ne sont accessibles que depuis le VPS.
