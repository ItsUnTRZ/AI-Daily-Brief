#!/bin/bash
# Set Vercel env vars — one env per command (v59 CLI syntax: env add NAME ENVIRONMENT)
set -e
cd ~/ai-daily-web
GEM=$(grep '^GEMINI_API_KEY=' .env.local | cut -d= -f2-)
LEO=$(grep '^LEONARDO_API_KEY=' .env.local | cut -d= -f2-)
AUTH="aidaily-$(openssl rand -hex 12)"
CRON="aidaily-cron-$(openssl rand -hex 8)"

printf '%s' "$GEM"  | vercel env add GEMINI_API_KEY production    2>&1 | tail -1
printf '%s' "$GEM"  | vercel env add GEMINI_API_KEY preview       2>&1 | tail -1
printf 'gemini-3.6-flash' | vercel env add GEMINI_MODEL production 2>&1 | tail -1
printf 'gemini-3.6-flash' | vercel env add GEMINI_MODEL preview    2>&1 | tail -1
printf '%s' "$LEO"  | vercel env add LEONARDO_API_KEY production 2>&1 | tail -1
printf '%s' "$LEO"  | vercel env add LEONARDO_API_KEY preview    2>&1 | tail -1
printf 'boss' | vercel env add ADMIN_USER production 2>&1 | tail -1
printf 'boss' | vercel env add ADMIN_USER preview    2>&1 | tail -1
printf 'Bunny2026Daily!' | vercel env add ADMIN_PASS production 2>&1 | tail -1
printf 'Bunny2026Daily!' | vercel env add ADMIN_PASS preview    2>&1 | tail -1
printf '%s' "$AUTH" | vercel env add AUTH_SECRET production 2>&1 | tail -1
printf '%s' "$AUTH" | vercel env add AUTH_SECRET preview    2>&1 | tail -1
printf '%s' "$CRON" | vercel env add CRON_SECRET production 2>&1 | tail -1
printf '%s' "$CRON" | vercel env add CRON_SECRET preview    2>&1 | tail -1

sed -i '' "s|^CRON_SECRET=.*|CRON_SECRET=$CRON|" .env.local
echo "ALL_ENVS_DONE"
