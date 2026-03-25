#!/usr/bin/env bash
set -euo pipefail

DB_NAME="pinnwand_datenbank"
TABLE_NAME="rights_confirmations"

if [[ $# -lt 1 ]]; then
  echo "Verwendung: $0 /absoluter/zielordner" >&2
  exit 1
fi

TARGET_DIR="$1"
STAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="${TARGET_DIR%/}/${TABLE_NAME}_${STAMP}.sql"

mkdir -p "$TARGET_DIR"

echo "Exportiere Tabelle '${TABLE_NAME}' aus D1-Datenbank '${DB_NAME}' ..."
echo "Zieldatei: $OUTPUT_FILE"

npx wrangler d1 export "$DB_NAME" \
  --remote \
  --table="$TABLE_NAME" \
  --output="$OUTPUT_FILE"

echo "Export abgeschlossen."
