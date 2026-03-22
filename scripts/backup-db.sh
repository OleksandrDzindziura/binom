#!/bin/bash
# Бекап бази даних Binom Mebli
# Зберігає стиснений дамп локально + відправляє в Cloudflare R2
# Запускати через cron: 0 3 * * * /opt/binom-mebli/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1

set -e

BACKUP_DIR="/opt/backups"
PROJECT_DIR="/opt/binom-mebli"
ENV_FILE="$PROJECT_DIR/.env"

# Завантажити змінні з .env
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "ERROR: $ENV_FILE not found"
  exit 1
fi

# AWS CLI використовує свої назви змінних
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"

mkdir -p "$BACKUP_DIR"
cd "$PROJECT_DIR" || exit 1

FILENAME="binom_$(date +%Y%m%d_%H%M).sql.gz"
LOCAL_PATH="$BACKUP_DIR/$FILENAME"

# 1. Створити локальний бекап
echo "[$(date)] Creating backup..."
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$LOCAL_PATH"

SIZE=$(du -h "$LOCAL_PATH" | cut -f1)
echo "[$(date)] Backup created: $LOCAL_PATH ($SIZE)"

# 2. Відправити в Cloudflare R2
echo "[$(date)] Uploading to R2..."
aws s3 cp "$LOCAL_PATH" "s3://${R2_BUCKET}/db-backups/$FILENAME" \
  --endpoint-url "$R2_ENDPOINT" \
  --no-progress \
  --region auto

echo "[$(date)] Uploaded to R2: db-backups/$FILENAME"

# 3. Видалити локальні бекапи старші 7 днів
find "$BACKUP_DIR" -name "binom_*.sql.gz" -mtime +7 -delete
echo "[$(date)] Old local backups cleaned up"

# 4. Видалити бекапи в R2 старші 7 днів
echo "[$(date)] Cleaning up old R2 backups..."
CUTOFF=$(date -d "7 days ago" +%Y-%m-%d)
aws s3 ls "s3://${R2_BUCKET}/db-backups/" \
  --endpoint-url "$R2_ENDPOINT" \
  --region auto | while read -r line; do
    FILE_DATE=$(echo "$line" | awk '{print $1}')
    FILE_NAME=$(echo "$line" | awk '{print $4}')
    if [[ -n "$FILE_NAME" && "$FILE_DATE" < "$CUTOFF" ]]; then
      aws s3 rm "s3://${R2_BUCKET}/db-backups/$FILE_NAME" \
        --endpoint-url "$R2_ENDPOINT" \
        --region auto
      echo "[$(date)] Deleted old R2 backup: $FILE_NAME"
    fi
done

echo "[$(date)] Done."
