# Plan 1: Infrastructure & DevOps

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the complete Docker Compose infrastructure for Masamune on the VPS, including Nginx, PostgreSQL, Redis, Supabase Auth, Supabase Storage, Umami, Certbot, and backup system.

**Architecture:** Docker Compose orchestrates all services on a single VPS (Hostinger, 2 vCPU, 8GB RAM, 100GB NVMe). Nginx acts as reverse proxy for the Next.js app and serves static client sites. Dokploy manages deployments. All data is persisted via Docker volumes.

**Tech Stack:** Docker, Docker Compose, Nginx, PostgreSQL 15, Redis 7, GoTrue (Supabase Auth), Supabase Storage, PostgREST, Umami, Certbot, Dokploy

**Spec:** `docs/superpowers/specs/2026-03-25-masamune-saas-design.md`

**Note:** OpenClaw is deferred to Plan 8. The `app` (Next.js) and `worker` services are deferred to Plan 2. Nginx uses variable-based upstreams with resolver to handle missing app service gracefully.

---

### Task 1: Initialize Git repo and project structure

**Files:**
- Create: `.gitignore`
- Create: `docker-compose.yml` (skeleton)

- [ ] **Step 1: Initialize git repo**

```bash
cd C:/2-Travail/Masamune
git init
```

- [ ] **Step 2: Create .gitignore**

```gitignore
# Environment
.env
.env.local
.env.production

# Node
node_modules/
.next/
out/

# Data volumes (never commit)
data/
sites-clients/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

- [ ] **Step 3: Create initial docker-compose.yml skeleton**

```yaml
services:

volumes:
  postgres_data:
  redis_data:
  storage_data:
  certbot_conf:
  certbot_www:

networks:
  masamune:
    driver: bridge
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore docker-compose.yml
git commit -m "chore: initialize project with Docker Compose skeleton"
```

---

### Task 2: Configure PostgreSQL service

**Files:**
- Modify: `docker-compose.yml`
- Create: `docker/postgres/init.sql`
- Create: `.env.example`

- [ ] **Step 1: Create init SQL script**

Create `docker/postgres/init.sql`:

```sql
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

- [ ] **Step 2: Add PostgreSQL to docker-compose.yml under `services:`**

```yaml
  postgres:
    image: postgres:15-alpine
    container_name: masamune-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-masamune}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: masamune
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - masamune
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-masamune}"]
      interval: 10s
      timeout: 5s
      retries: 5
```

- [ ] **Step 3: Create `.env.example` at project root**

```env
# PostgreSQL
POSTGRES_USER=masamune
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# Redis
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD
```

- [ ] **Step 4: Test PostgreSQL starts**

```bash
docker compose up -d postgres
docker compose exec postgres psql -U masamune -c "\l"
```

Expected: `masamune` database listed

- [ ] **Step 5: Stop and commit**

```bash
docker compose down
git add docker-compose.yml docker/postgres/init.sql .env.example
git commit -m "feat: add PostgreSQL 15 service with init script"
```

---

### Task 3: Configure Redis service

**Files:**
- Modify: `docker-compose.yml`
- Create: `docker/redis/redis.conf`

- [ ] **Step 1: Create Redis config**

Create `docker/redis/redis.conf`:

```conf
maxmemory 50mb
maxmemory-policy noeviction
appendonly yes
appendfsync everysec
bind 0.0.0.0
requirepass REDIS_PASSWORD_PLACEHOLDER
```

Note: At deployment, replace `REDIS_PASSWORD_PLACEHOLDER` with the actual password, or use a startup script. BullMQ will connect with `redis://:${REDIS_PASSWORD}@redis:6379`.

- [ ] **Step 2: Add Redis to docker-compose.yml**

```yaml
  redis:
    image: redis:7-alpine
    container_name: masamune-redis
    restart: unless-stopped
    command: redis-server /usr/local/etc/redis/redis.conf --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      - ./docker/redis/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - masamune
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

- [ ] **Step 3: Test Redis**

```bash
docker compose up -d redis
docker compose exec redis redis-cli -a "${REDIS_PASSWORD}" ping
```

Expected: `PONG`

- [ ] **Step 4: Stop and commit**

```bash
docker compose down
git add docker-compose.yml docker/redis/redis.conf
git commit -m "feat: add Redis 7 service with password auth"
```

---

### Task 4: Configure Supabase Auth (GoTrue)

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`

- [ ] **Step 1: Add GoTrue to docker-compose.yml**

```yaml
  supabase-auth:
    image: supabase/gotrue:v2.151.0
    container_name: masamune-auth
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: ${API_EXTERNAL_URL:-http://localhost:9999}
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://${POSTGRES_USER:-masamune}:${POSTGRES_PASSWORD}@postgres:5432/masamune?search_path=auth
      GOTRUE_SITE_URL: ${SITE_URL:-http://localhost:3000}
      GOTRUE_URI_ALLOW_LIST: ${ADDITIONAL_REDIRECT_URLS:-}
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_JWT_ADMIN_ROLES: service_role
      GOTRUE_JWT_AUD: authenticated
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "false"
      GOTRUE_SMTP_HOST: ${SMTP_HOST:-}
      GOTRUE_SMTP_PORT: ${SMTP_PORT:-587}
      GOTRUE_SMTP_USER: ${SMTP_USER:-}
      GOTRUE_SMTP_PASS: ${SMTP_PASS:-}
      GOTRUE_SMTP_ADMIN_EMAIL: ${SMTP_ADMIN_EMAIL:-noreply@masamune.fr}
      GOTRUE_EXTERNAL_GOOGLE_ENABLED: ${GOOGLE_AUTH_ENABLED:-false}
      GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
      GOTRUE_EXTERNAL_GOOGLE_SECRET: ${GOOGLE_CLIENT_SECRET:-}
      GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI: ${API_EXTERNAL_URL:-http://localhost:9999}/callback
    networks:
      - masamune
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:9999/health"]
      interval: 10s
      timeout: 5s
      retries: 5
```

- [ ] **Step 2: Add auth env vars to .env.example**

Append to `.env.example`:

```env
# JWT
JWT_SECRET=CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32

# URLs
API_EXTERNAL_URL=http://localhost:9999
SITE_URL=http://localhost:3000

# SMTP (Resend)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=CHANGE_ME_RESEND_API_KEY
SMTP_ADMIN_EMAIL=noreply@masamune.fr

# Google OAuth (optional)
GOOGLE_AUTH_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- [ ] **Step 3: Test GoTrue starts**

```bash
docker compose up -d postgres supabase-auth
docker compose exec supabase-auth wget -qO- http://localhost:9999/health
```

Expected: `{"status":"ok"}` (note: use exec, port not exposed to host)

- [ ] **Step 4: Stop and commit**

```bash
docker compose down
git add docker-compose.yml .env.example
git commit -m "feat: add Supabase Auth (GoTrue) service"
```

---

### Task 5: Configure Supabase Storage + PostgREST

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`

- [ ] **Step 1: Add PostgREST with healthcheck to docker-compose.yml**

```yaml
  supabase-rest:
    image: postgrest/postgrest:v12.0.1
    container_name: masamune-rest
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PGRST_DB_URI: postgres://${POSTGRES_USER:-masamune}:${POSTGRES_PASSWORD}@postgres:5432/masamune
      PGRST_DB_SCHEMAS: public,storage,auth
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: ${JWT_SECRET}
      PGRST_DB_USE_LEGACY_GUCS: "false"
    networks:
      - masamune
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/ready || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
```

- [ ] **Step 2: Add Storage to docker-compose.yml**

```yaml
  supabase-storage:
    image: supabase/storage-api:v1.0.6
    container_name: masamune-storage
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      supabase-auth:
        condition: service_healthy
      supabase-rest:
        condition: service_healthy
    environment:
      ANON_KEY: ${SUPABASE_ANON_KEY}
      SERVICE_KEY: ${SUPABASE_SERVICE_KEY}
      POSTGREST_URL: http://supabase-rest:3000
      PGRST_JWT_SECRET: ${JWT_SECRET}
      DATABASE_URL: postgres://${POSTGRES_USER:-masamune}:${POSTGRES_PASSWORD}@postgres:5432/masamune
      FILE_SIZE_LIMIT: 52428800
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      TENANT_ID: stub
      REGION: eu-west-1
      GLOBAL_S3_BUCKET: stub
      IS_MULTITENANT: "false"
    volumes:
      - storage_data:/var/lib/storage
    networks:
      - masamune
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/status"]
      interval: 10s
      timeout: 5s
      retries: 5
```

- [ ] **Step 3: Add Supabase keys to .env.example**

```env
# Supabase Keys (generate with supabase CLI or jwt.io using JWT_SECRET)
SUPABASE_ANON_KEY=CHANGE_ME
SUPABASE_SERVICE_KEY=CHANGE_ME
```

- [ ] **Step 4: Test stack starts**

```bash
docker compose up -d postgres supabase-auth supabase-rest supabase-storage
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

Expected: all 4 services running/healthy

- [ ] **Step 5: Stop and commit**

```bash
docker compose down
git add docker-compose.yml .env.example
git commit -m "feat: add Supabase Storage and PostgREST with healthchecks"
```

---

### Task 6: Configure Nginx config files

**Files:**
- Create: `docker/nginx/nginx.conf`
- Create: `docker/nginx/conf.d/default.conf`
- Create: `docker/nginx/templates/client-site.conf.template`

- [ ] **Step 1: Create main Nginx config**

Create `docker/nginx/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    include /etc/nginx/conf.d/*.conf;
}
```

- [ ] **Step 2: Create default server config with resolver-based upstream**

Create `docker/nginx/conf.d/default.conf`:

```nginx
# Docker DNS resolver for variable-based upstreams
resolver 127.0.0.11 valid=30s ipv6=off;

# Masamune Platform — app.masamune.fr
server {
    listen 80;
    server_name app.masamune.fr masamune.fr www.masamune.fr localhost;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Proxy to Next.js app (uses variable to avoid startup failure if app is not running)
    set $app_upstream http://app:3000;

    location / {
        proxy_pass $app_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass $app_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth rate limiting (stricter)
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass $app_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Supabase Auth proxy
    location /auth/ {
        set $auth_upstream http://supabase-auth:9999;
        proxy_pass $auth_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Supabase Storage proxy
    location /storage/ {
        set $storage_upstream http://supabase-storage:5000;
        proxy_pass $storage_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Client sites — *.masamune.app (subdomains)
server {
    listen 80;
    server_name *.masamune.app;

    set $subdomain "";
    if ($host ~* ^([^.]+)\.masamune\.app$) {
        set $subdomain $1;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    root /var/www/sites-clients/$subdomain;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

- [ ] **Step 3: Create template for custom domain sites (outside conf.d)**

Create `docker/nginx/templates/client-site.conf.template`:

```nginx
# Template: generated by Worker for each custom domain
# Worker copies this to conf.d/ replacing DOMAIN_NAME and SITE_PATH
server {
    listen 80;
    server_name DOMAIN_NAME www.DOMAIN_NAME;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    root /var/www/sites-clients/SITE_PATH;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add docker/nginx/
git commit -m "feat: add Nginx config with resolver-based upstreams and HSTS"
```

---

### Task 7: Add Nginx and Certbot to Docker Compose

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add Nginx service (no depends_on app — deferred to Plan 2)**

```yaml
  nginx:
    image: nginx:alpine
    container_name: masamune-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
      - ./sites-clients:/var/www/sites-clients:ro
      - certbot_conf:/etc/letsencrypt:ro
      - certbot_www:/var/www/certbot:ro
    networks:
      - masamune
```

Note: `conf.d` is writable (no `:ro`) because the Worker will add client site configs at runtime. The template file is in `docker/nginx/templates/` (not in `conf.d/`) to prevent Nginx from parsing it.

- [ ] **Step 2: Add Certbot service**

```yaml
  certbot:
    image: certbot/certbot
    container_name: masamune-certbot
    volumes:
      - certbot_conf:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - masamune
```

- [ ] **Step 3: Test Nginx starts and config is valid**

```bash
docker compose up -d nginx
docker compose exec nginx nginx -t
```

Expected: "syntax is ok" / "test is successful". Nginx starts without errors even though `app` service doesn't exist (resolver handles this gracefully — requests to `/` will get 502 until app is running, which is expected).

- [ ] **Step 4: Stop and commit**

```bash
docker compose down
git add docker-compose.yml
git commit -m "feat: add Nginx and Certbot services to Docker Compose"
```

---

### Task 8: Configure Umami analytics

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`

- [ ] **Step 1: Add Umami to docker-compose.yml**

```yaml
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    container_name: masamune-umami
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER:-masamune}:${POSTGRES_PASSWORD}@postgres:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${UMAMI_APP_SECRET}
    ports:
      - "127.0.0.1:3001:3000"
    networks:
      - masamune
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/heartbeat || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
```

- [ ] **Step 2: Create Umami database**

Add to `docker/postgres/init.sql`:

```sql
CREATE DATABASE umami;
```

- [ ] **Step 3: Add Umami env var to .env.example**

```env
# Umami
UMAMI_APP_SECRET=CHANGE_ME_RANDOM_STRING
```

- [ ] **Step 4: Test Umami starts**

```bash
docker compose up -d postgres umami
docker compose exec umami wget -qO- http://localhost:3000/api/heartbeat
```

Expected: `{"ok":true}` or similar health response

- [ ] **Step 5: Stop and commit**

```bash
docker compose down
git add docker-compose.yml docker/postgres/init.sql .env.example
git commit -m "feat: add Umami self-hosted analytics service"
```

---

### Task 9: Configure backup system

**Files:**
- Create: `docker/backup/backup.sh`
- Create: `docker/backup/restore.sh`

- [ ] **Step 1: Create backup script**

Create `docker/backup/backup.sh`:

```bash
#!/bin/bash
# Masamune Daily Backup Script
# Run via cron: 0 3 * * * cd /path/to/masamune && ./docker/backup/backup.sh
set -euo pipefail

BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M)
S3_BUCKET="${S3_BACKUP_BUCKET:-masamune-backups}"
S3_ENDPOINT="${S3_BACKUP_ENDPOINT:-}"

echo "[$DATE] Starting Masamune backup..."
mkdir -p "$BACKUP_DIR"

# 1. PostgreSQL dump
echo "Backing up PostgreSQL..."
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-masamune}" masamune | gzip > "$BACKUP_DIR/postgres-$DATE.sql.gz"

# 2. Redis dump
echo "Backing up Redis..."
docker compose exec -T redis redis-cli -a "${REDIS_PASSWORD}" BGSAVE
sleep 2

# 3. Sites clients (host path)
echo "Backing up client sites..."
tar czf "$BACKUP_DIR/sites-clients-$DATE.tar.gz" -C . sites-clients/ 2>/dev/null || echo "No sites-clients directory yet"

# 4. Nginx dynamic configs
echo "Backing up Nginx configs..."
tar czf "$BACKUP_DIR/nginx-conf-$DATE.tar.gz" -C . docker/nginx/conf.d/

# 5. Upload to S3
if [ -n "$S3_ENDPOINT" ]; then
    echo "Uploading to S3..."
    for f in "$BACKUP_DIR"/$DATE*; do
        aws s3 cp "$f" "s3://$S3_BUCKET/$DATE/" --endpoint-url "$S3_ENDPOINT"
    done
fi

# 6. Cleanup local backups older than 7 days
find "$BACKUP_DIR" -mtime +7 -delete 2>/dev/null || true

echo "[$DATE] Backup complete."
```

- [ ] **Step 2: Create restore script**

Create `docker/backup/restore.sh`:

```bash
#!/bin/bash
# Usage: ./docker/backup/restore.sh <backup-date>
# Example: ./docker/backup/restore.sh 2026-03-25_03-00
set -euo pipefail

DATE=$1
BACKUP_DIR="./backups"

if [ -z "$DATE" ]; then
    echo "Usage: $0 <backup-date>"
    exit 1
fi

echo "Restoring Masamune from backup $DATE..."

# 1. Restore PostgreSQL
echo "Restoring PostgreSQL..."
docker compose stop app worker 2>/dev/null || true
gunzip -c "$BACKUP_DIR/postgres-$DATE.sql.gz" | docker compose exec -T postgres psql -U "${POSTGRES_USER:-masamune}" masamune

# 2. Restore sites clients
echo "Restoring client sites..."
tar xzf "$BACKUP_DIR/sites-clients-$DATE.tar.gz" -C .

# 3. Restore Nginx configs
echo "Restoring Nginx configs..."
tar xzf "$BACKUP_DIR/nginx-conf-$DATE.tar.gz" -C .

# 4. Restart
docker compose up -d
docker compose exec nginx nginx -s reload

echo "Restore complete. Verify: docker compose ps"
```

- [ ] **Step 3: Make executable and commit**

```bash
chmod +x docker/backup/backup.sh docker/backup/restore.sh
git add docker/backup/
git commit -m "feat: add backup and restore scripts with S3 support"
```

---

### Task 10: Assemble and validate complete Docker Compose

**Files:**
- Modify: `docker-compose.yml` (final validation)

- [ ] **Step 1: Validate compose file syntax**

```bash
docker compose config --quiet
```

Expected: no errors

- [ ] **Step 2: Start full infra stack**

```bash
docker compose up -d
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

Expected: postgres, redis, supabase-auth, supabase-rest, supabase-storage, nginx, certbot, umami all running/healthy. Requests to localhost:80 return 502 (expected — app not yet running).

- [ ] **Step 3: Verify healthchecks**

```bash
docker compose exec postgres pg_isready -U masamune
docker compose exec redis redis-cli -a "${REDIS_PASSWORD}" ping
docker compose exec supabase-auth wget -qO- http://localhost:9999/health
```

Expected: all healthy

- [ ] **Step 4: Stop and commit**

```bash
docker compose down
git add docker-compose.yml
git commit -m "feat: validate complete infrastructure stack"
```

---

### Task 11: Create test client site for Nginx validation

**Files:**
- Create: `sites-clients/test-site/index.html`

- [ ] **Step 1: Create test static site**

Create `sites-clients/test-site/index.html`:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Test Masamune</title>
    <style>
        body { font-family: system-ui; max-width: 600px; margin: 100px auto; text-align: center; }
        h1 { color: #1a1a2e; }
        p { color: #666; }
    </style>
</head>
<body>
    <h1>Masamune Test Site</h1>
    <p>Si vous voyez cette page, le routing Nginx fonctionne correctement.</p>
</body>
</html>
```

- [ ] **Step 2: Start Nginx and test subdomain routing**

```bash
docker compose up -d nginx
curl -H "Host: test-site.masamune.app" http://localhost/
```

Expected: HTML content of the test page with "Masamune Test Site"

- [ ] **Step 3: Cleanup and commit**

```bash
docker compose down
git add sites-clients/test-site/
git commit -m "test: add test client site for Nginx routing validation"
```

---

### Task 12: Write DevOps agent documentation

**Files:**
- Create: `AgentDoc/DevOps/docker-setup.md`
- Create: `AgentDoc/DevOps/nginx-config.md`
- Create: `AgentDoc/DevOps/deployment.md`

- [ ] **Step 1: Write docker-setup.md**

Create `AgentDoc/DevOps/docker-setup.md` covering:
- List of all services with image versions, ports, and env vars
- How to start/stop: `docker compose up -d` / `docker compose down`
- How to view logs: `docker compose logs -f <service>`
- How to rebuild: `docker compose up -d --build <service>`
- Env vars reference: all vars from `.env.example` with descriptions
- Volume locations and what they contain

- [ ] **Step 2: Write nginx-config.md**

Create `AgentDoc/DevOps/nginx-config.md` covering:
- How Nginx routes platform traffic vs client sites
- How to add a new custom domain client site:
  1. Copy `docker/nginx/templates/client-site.conf.template` to `docker/nginx/conf.d/<domain>.conf`
  2. Replace `DOMAIN_NAME` and `SITE_PATH`
  3. Run `docker compose exec nginx nginx -s reload`
- SSL certificate generation: `./docker/certbot/renew-cron.sh <domain>`
- Rate limiting zones and limits

- [ ] **Step 3: Write deployment.md**

Create `AgentDoc/DevOps/deployment.md` covering:
- VPS specs: Hostinger 2 vCPU, 8GB RAM, 100GB NVMe
- Initial VPS setup: Docker install, UFW config (80, 443, 22), Fail2ban
- Dokploy installation and configuration
- CI/CD: push to main -> Dokploy auto-rebuild
- Backup cron setup: `0 3 * * * cd /path/to/masamune && ./docker/backup/backup.sh`
- Restore procedure reference
- Monitoring: `docker compose ps`, healthcheck endpoints

- [ ] **Step 4: Commit**

```bash
git add AgentDoc/DevOps/
git commit -m "docs: add DevOps agent documentation"
```

---

## Summary

| Task | Description | Est. time |
|------|-------------|-----------|
| 1 | Git init + project structure | 2 min |
| 2 | PostgreSQL service | 5 min |
| 3 | Redis service (with auth) | 3 min |
| 4 | Supabase Auth (GoTrue) | 5 min |
| 5 | Supabase Storage + PostgREST (with healthchecks) | 5 min |
| 6 | Nginx config files (resolver-based, HSTS) | 5 min |
| 7 | Nginx + Certbot in Docker Compose | 3 min |
| 8 | Umami analytics | 5 min |
| 9 | Backup/restore scripts | 5 min |
| 10 | Validate complete stack | 5 min |
| 11 | Test client site | 3 min |
| 12 | DevOps documentation | 10 min |
| **Total** | | **~56 min** |

## Next Plan

After this plan is complete, proceed to **Plan 2: Auth & Core SaaS** which will:
- Initialize the Next.js app with TypeScript and Tailwind
- Add `app` and `worker` services to docker-compose
- Implement the database schema (Prisma migrations)
- Set up Supabase client and auth flows
- Create CRUD API routes for sites and users
