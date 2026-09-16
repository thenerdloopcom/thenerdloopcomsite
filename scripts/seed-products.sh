#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "❌ .env.local not found"
  exit 1
fi

set -a
source .env.local
set +a

echo "🌱 Seeding products..."

pnpm exec tsx scripts/seed-products.ts