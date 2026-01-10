DATEI: /tools/run-feeds.sh
#!/usr/bin/env bash
set -euo pipefail

# ========= Einstellungen (kannst du ändern) =========
WERKSTATT_MAX="${WERKSTATT_MAX:-60}"   # 0 = alle
QUALITY="${QUALITY:-82}"              # WebP Qualität
CLEAN="${CLEAN:-1}"                   # 1 = --clean, 0 = ohne
CATEGORY_REELS="${CATEGORY_REELS:-1}" # 1 = --category-reels, 0 = ohne
# ====================================================

# Repo-Root: ein Ordner über /tools/
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Incoming liegt als Geschwisterordner neben dem Repo:
# .../GitHub/Luderbein-Website  -> .../GitHub/luderbein-incoming
PARENT_DIR="$(cd "$REPO_DIR/.." && pwd)"
INCOMING_DIR="${INCOMING_DIR:-$PARENT_DIR/luderbein-incoming}"

PYTHON="${PYTHON:-python3}"
SCRIPT="$REPO_DIR/tools/luderbein-reels.py"
ASSETS_DIR="$REPO_DIR/assets"

echo "== Luderbein Feed Runner =="
echo "Repo:     $REPO_DIR"
echo "Incoming: $INCOMING_DIR"
echo "Assets:   $ASSETS_DIR"
echo ""

if [[ ! -d "$ASSETS_DIR" ]]; then
  echo "❌ assets/ nicht gefunden: $ASSETS_DIR"
  exit 2
fi

if [[ ! -f "$SCRIPT" ]]; then
  echo "❌ Script nicht gefunden: $SCRIPT"
  exit 2
fi

if [[ ! -d "$INCOMING_DIR" ]]; then
  echo "❌ Incoming-Ordner nicht gefunden: $INCOMING_DIR"
  echo "   Tipp: Ordnername muss exakt 'luderbein-incoming' sein."
  echo "   Oder: INCOMING_DIR=/pfad/zu/incoming bash tools/run-feeds.sh"
  exit 2
fi

echo "➡️  Stelle sicher, dass Pillow da ist …"
$PYTHON -m pip install --user pillow >/dev/null

ARGS=( "$SCRIPT" --src "$INCOMING_DIR" --assets "$ASSETS_DIR" --quality "$QUALITY" --werkstatt-max "$WERKSTATT_MAX" )

if [[ "$CLEAN" == "1" ]]; then
  ARGS+=( --clean )
fi
if [[ "$CATEGORY_REELS" == "1" ]]; then
  ARGS+=( --category-reels )
fi

echo ""
echo "➡️  Starte Build:"
echo "   $PYTHON ${ARGS[*]}"
echo ""

cd "$REPO_DIR"
$PYTHON "${ARGS[@]}"

echo ""
echo "✅ Fertig."
echo "👉 Jetzt: GitHub Desktop öffnen → Commit → Push"