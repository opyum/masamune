# Deployment — Masamune

## VPS Specs

- **Provider** : Hostinger
- **CPU** : 2 vCPU
- **RAM** : 8 GB
- **Disk** : 100 GB NVMe
- **Bandwidth** : 8 TB
- **OS** : Ubuntu 22.04+ recommande

## Setup initial du VPS

### 1. Installer Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Configurer le firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Installer Fail2ban

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### 4. Installer Dokploy

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Acceder au dashboard Dokploy : `https://<ip-vps>:3000` (premier lancement uniquement).

### 5. Cloner et configurer

```bash
git clone <repo-url> /opt/masamune
cd /opt/masamune
cp .env.example .env
# Editer .env avec les vraies valeurs
nano .env
```

### 6. Lancer

```bash
docker compose up -d
```

## Deploiement continu (Dokploy)

1. Connecter le repo Git dans Dokploy
2. Configurer le trigger : push sur `main` -> rebuild `app` et `worker`
3. Les services infra (postgres, redis, nginx...) ne sont PAS rebuilds automatiquement

## Rollback

Via Dokploy : clic sur le deploiement precedent -> "Rollback".

Ou manuellement :
```bash
git log --oneline -10
git checkout <commit-hash>
docker compose up -d --build app worker
```

## Backups

### Configuration cron

```bash
crontab -e
# Ajouter :
0 3 * * * cd /opt/masamune && ./docker/backup/backup.sh >> /var/log/masamune-backup.log 2>&1
```

### Restauration

```bash
cd /opt/masamune
./docker/backup/restore.sh 2026-03-25_03-00
```

### Backup S3

Configurer dans `.env` :
```env
S3_BACKUP_ENDPOINT=https://s3.eu-west-1.amazonaws.com
S3_BACKUP_BUCKET=masamune-backups
```

Installer AWS CLI :
```bash
sudo apt install awscli -y
aws configure
```

## Monitoring

```bash
# Statut des containers
docker compose ps

# Logs en temps reel
docker compose logs -f

# Utilisation ressources
docker stats

# Espace disque
df -h
du -sh data/ sites-clients/
```

## Seuils d'alerte

| Metrique | Seuil | Action |
|----------|-------|--------|
| RAM moyenne > 6GB | Upgrade VPS 16GB | ~20EUR/mois |
| Disk > 80GB | Cleanup ou extend | Nettoyer backups locaux |
| CPU > 90% soutenu | Upgrade VPS 4 vCPU | Ou separer le Worker |
| > 50 clients actifs | Planifier scaling | Voir spec section 3.5 |
