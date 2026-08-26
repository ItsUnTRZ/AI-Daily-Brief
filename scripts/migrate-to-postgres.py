#!/usr/bin/env python3
"""Migrate posts from local SQLite to Vercel Postgres (Neon)."""
import sqlite3, os, sys, urllib.request, json

ROOT = os.path.expanduser("~/ai-daily-web")

# read DATABASE_URL from .env.local
url = None
for line in open(f"{ROOT}/.env.local"):
    if line.startswith("DATABASE_URL="):
        url = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
if not url:
    sys.exit("no DATABASE_URL in .env.local")
print("target:", url.split("@")[1][:40], "...")

# read from sqlite
sq = sqlite3.connect(f"{ROOT}/prisma/dev.db")
sq.row_factory = sqlite3.Row
rows = [dict(r) for r in sq.execute("SELECT * FROM Post")]

# use psql if available, else prisma db push + insert via node
subprocess_ok = False
import subprocess
try:
    r = subprocess.run(["psql", "--version"], capture_output=True)
    subprocess_ok = r.returncode == 0
except FileNotFoundError:
    pass

env = dict(os.environ, DATABASE_URL=url)

# 1. push schema
r = subprocess.run(["npx", "prisma", "db", "push", "--skip-generate"], cwd=ROOT, env=env,
                   capture_output=True, text=True, timeout=180)
print("db push:", "OK" if r.returncode == 0 else r.stdout[-400:] + r.stderr[-400:])

# 2. seed rows via node + prisma client
seed_js = f"""
const {{ PrismaClient }} = require('@prisma/client');
const p = new PrismaClient();
const rows = {json.dumps(rows)};
(async () => {{
  for (const r of rows) {{
    await p.post.upsert({{
      where: {{ slug: r.slug }},
      create: {{
        slug: r.slug, title: r.title, tldr: r.tldr, body: r.body, tag: r.tag,
        sources: r.sources, runnersUp: r.runnersUp, takeaway: r.takeaway,
        readingMin: r.readingMin ?? 4,
        coverImage: r.coverImage || null,
        published: !!r.published,
        featuredUntil: r.featuredUntil || null,
        createdAt: r.createdAt ? new Date(r.createdAt.replace(' ', 'T') + (r.createdAt.includes('Z')?'':'Z')) : undefined,
      }},
      update: {{}}
    }});
    console.log('upserted', r.slug);
  }}
  await p.$disconnect();
}})().catch(e => {{ console.error(e.message); process.exit(1); }});
"""
open(f"{ROOT}/prisma/seed-neon.js", "w").write(seed_js)
r = subprocess.run(["node", "prisma/seed-neon.js"], cwd=ROOT, env=env, capture_output=True, text=True, timeout=120)
print(r.stdout or "", r.stderr[-300:] if r.returncode else "")
print("MIGRATION DONE" if r.returncode == 0 else "MIGRATION FAILED")
