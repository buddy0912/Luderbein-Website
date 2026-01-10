DATEI: /RUN-FEEDS.command
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
bash "tools/run-feeds.sh"

echo ""
echo "Drücke ENTER zum Schließen…"
read -r