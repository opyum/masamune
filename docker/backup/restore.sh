#!/bin/bash
set -euo pipefail

DATE=$1
BACKUP_DIR="./backups"

if [ -z "$DATE" ]; then
    echo "Usage: $0 <backup-date>"
    exit 1
fi

echo "Restoring Masamune from backup $DATE..."

echo "Restoring PostgreSQL..."
docker compose stop app worker 2>/dev/null || true
gunzip -c "$BACKUP_DIR/postgres-$DATE.sql.gz" | docker compose exec -T postgres psql -U "${POSTGRES_USER:-masamune}" masamune

echo "Restoring client sites..."
tar xzf "$BACKUP_DIR/sites-clients-$DATE.tar.gz" -C .

echo "Restoring Nginx configs..."
tar xzf "$BACKUP_DIR/nginx-conf-$DATE.tar.gz" -C .

docker compose up -d
docker compose exec nginx nginx -s reload

echo "Restore complete. Verify: docker compose ps"
