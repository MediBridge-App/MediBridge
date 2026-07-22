#!/usr/bin/env bash
# run_migrations.sh
# Applies every migration in this folder, in order, against $DATABASE_URL.
#
# Usage:
#   export DATABASE_URL="postgresql://user:pass@localhost:5432/medibridge"
#   ./run_migrations.sh

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Set DATABASE_URL first, e.g.:"
  echo '  export DATABASE_URL="postgresql://user:pass@localhost:5432/medibridge"'
  exit 1
fi

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for file in "$DIR"/[0-9][0-9][0-9][0-9]_*.sql; do
  [ -e "$file" ] || continue
  echo "Applying $(basename "$file")..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "All migrations applied successfully."
