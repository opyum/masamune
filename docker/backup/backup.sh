#!/bin/bash
set -euo pipefail

BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M)
S3_BUCKET="${S3_BACKUP_BUCKET:-masamune-backups}"
S3_ENDPOINT="${S3_BACKUP_ENDPOINT:-}"

echo "[$DATE] Starting Masamune backup..."
mkdir -p "$BACKUP_DIR"

echo "Backing up PostgreSQL..."
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-masamune}" masamune | gzip > "$BACKUP_DIR/postgres-$DATE.sql.gz"

echo "Backing up Redis..."
docker compose exec -T redis redis-cli -a "${REDIS_PASSWORD}" BGSAVE
sleep 2

echo "Backing up client sites..."
tar czf "$BACKUP_DIR/sites-clients-$DATE.tar.gz" -C . sites-clients/ 2>/dev/null || echo "No sites-clients directory yet"

echo "Backing up Nginx configs..."
tar czf "$BACKUP_DIR/nginx-conf-$DATE.tar.gz" -C . docker/nginx/conf.d/

if [ -n "$S3_ENDPOINT" ]; then
    echo "Uploading to S3..."
    for f in "$BACKUP_DIR"/*$DATE*; do
        aws s3 cp "$f" "s3://$S3_BUCKET/$DATE/" --endpoint-url "$S3_ENDPOINT"
    done
fi

find "$BACKUP_DIR" -mtime +7 -delete 2>/dev/null || true
echo "[$DATE] Backup complete."
