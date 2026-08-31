// Auto-generate pipeline: collect news → Gemini writes Thai brief → Leonardo cover → insert DB
import { mkdir, stat, writeFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { assertCoverUrl, assertImagePayload, type ImageFormat } from "@/lib/cover-image";
import { prisma } from "@/lib/db";

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const LEONARDO_KEY = process.env.LEONARDO_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET!;

// ── 1. Collect candidates from HN Algolia ──
async function collectCandidates(): Promise<Candidate[]> {
  const seen = new Set<string>();
  const out: Candidate[] = [];
  const since = Math.floor(Date.now() / 1000) - 36 * 3600;
  for (const kw of ["LLM", "OpenAI", "Claude", "Gemini", "GPT", "DeepSeek", "Qwen", "Grok", "Mistral", "Llama", "ox alpha", "GLM", "Kimi", "foundation model", "open weights", "benchmark"]) {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(kw)}&tags=story&numericFilters=created_at_i>${since},points>30&hitsPerPage=25`;
    try {
      const r = await fetch(url, { headers: { "User-Agent": "ai-daily-brief/1.0" } });
      const j = await r.json();
      for (const h of j.hits ?? []) {
        if (seen.has(h.objectID)) continue;
        if ((h.title ?? "").startsWith("Show HN") && h.points < 80) continue;
        seen.add(h.objectID);
        out.push({
          id: h.objectID,
          title: h.title,
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          points: h.points ?? 0,
          comments: h.num_comments ?? 0,
          hnUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
        });
      }
    } catch {
      /* skip keyword on error */
    }
  }
  return out.sort((a, b) => b.points * 2 + b.comments - (a.points * 2 + a.comments)).slice(0, 12);
}

interface Candidate {
  id: string; title: string; url: string; points: number; comments: number; hnUrl: string;
}

// ── 2. Gemini writes the Thai brief ──
async function writeBrief(cands: Candidate[], existingTitles: string[]) {
  const list = cands
    .map((c, i) => `${i + 1}. ${c.title}\n   URL: ${c.url} | HN: ${c.hnUrl} (${c.points} pts, ${c.comments} comments)`)
    .join("\n");
  const prompt = `คุณคือบรรณาธิการข่าว AI ภาษาไทยของ "AI Daily Brief" — เลือกข่าวที่น่าสนใจที่สุด "1 เรื่อง" จาก list ด้านล่าง

⚠️ เกณฑ์หลัก: **เน้นข่าวเกี่ยวกับโมเดล AI เป็นหลัก** — โมเดลใหม่ (release, stealth model, open weights), benchmark/ความสามารถของโมเดล, เทคนิค train/inference ใหม่ๆ
❌ หลีกเลี่ยง: ข่าว hardware/ชิป/ธุรกิจ/นโยบาย ยกเว้นจะไม่มีข่าวโมเดลเลยจึงเลือกได้ แต่ต้องระบุเหตุผลใน note
${existingTitles.length ? `\n⚠️ เรื่องเหล่านี้เขียนไปแล้ว ห้ามเลือกซ้ำ:\n${existingTitles.map((t) => "- " + t).join("\n")}\n` : ""}
Candidate stories:
${list}

วิเคราะห์จากชื่อข่าวและประสบการณ์ของคุณ ตอบเป็น JSON เท่านั้น ไม่มี markdown fence:
{
  "selected_index": <number>,
  "title_th": "หัวข้อไทยที่น่าอ่าน ไม่เกิน 90 ตัวอักษร",
  "tldr": "สรุป 1-2 ประโยค",
  "body_markdown": "## เกิดอะไรขึ้น\\n...\\n## ทำไมสำคัญ\\n... (เขียนลึก 4-6 ย่อหน้า ใช้ markdown, ตัวเลขชัดเจน, ถ้าไม่แน่ใจตัวเลขให้บอกว่า 'รายงานระบุ')",
  "takeaway": "สรุปสั้น 1 ประโยคที่ reader เอาไปใช้ได้",
  "runners_up": [{"title":"...","why":"ทำไมน่าจับตา","url":"..."}],
  "tag": "hardware|model|technique|industry",
  "note": "เหตุผลสั้นๆ ว่าทำไมเลือกเรื่องนี้ (ถ้าเป็น hardware/business เพราะไม่มีข่าวโมเดลใหม่ใน list ให้บอก)",
  "reading_min": <number 3-6>,
  "cover_prompt": "English prompt for editorial cover illustration, dark near-black background #08090a, deep ocean blue palette, no text in image"
}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
  });
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY }, body }
  );
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini empty response");
  return JSON.parse(text);
}

// ── 3. Leonardo generates the cover ──
async function generateCover(coverPrompt: string): Promise<string | null> {
  const H = { Authorization: `Bearer ${LEONARDO_KEY}`, "Content-Type": "application/json", accept: "application/json" };
  const createRes = await fetch("https://cloud.leonardo.ai/api/rest/v2/generations", {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      public: false,
      model: "gpt-image-2",
      parameters: { quality: "MEDIUM", prompt: coverPrompt.slice(0, 1200), quantity: 1, width: 1376, height: 768 },
    }),
  });
  if (!createRes.ok) return null;
  const cj = await createRes.json();
  const gid = cj?.generate?.generationId;
  if (!gid) return null;

  // poll up to ~90s
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 6000));
    const gRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${gid}`, { headers: { Authorization: `Bearer ${LEONARDO_KEY}` } });
    if (!gRes.ok) continue;
    const gj = await gRes.json();
    const g = gj?.generations_by_pk;
    if (g?.status === "COMPLETE" && g.generated_images?.[0]?.url) return g.generated_images[0].url as string;
    if (g?.status === "FAILED") return null;
  }
  return null;
}

const FALLBACK_COVER_PROMPT =
  "Editorial illustration about artificial intelligence news, dark near-black background #08090a, deep navy and cyan palette, cinematic lighting, no text, no letters, no typography, no logo";

type PersistedCover = {
  url: string;
  filePath: string;
};

async function persistCover(buffer: Buffer, slug: string, format: ImageFormat): Promise<PersistedCover> {
  const filename = `${slug}.${format.extension}`;
  const destinations = [
    { directory: join(process.cwd(), "public", "covers"), url: `/covers/${filename}` },
    { directory: "/tmp/covers", url: `/api/covers/${filename}` },
  ];

  let lastError: unknown = null;
  for (const destination of destinations) {
    const filePath = join(/* turbopackIgnore: true */ destination.directory, filename);
    try {
      await mkdir(destination.directory, { recursive: true });
      await writeFile(filePath, buffer);
      const saved = await stat(/* turbopackIgnore: true */ filePath);
      if (!saved.isFile() || saved.size !== buffer.byteLength) {
        throw new Error(`cover file verification failed: ${filePath}`);
      }
      return { url: destination.url, filePath };
    } catch (error) {
      lastError = error;
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`unable to persist cover image: ${message}`);
}

async function generateRequiredCover(coverPrompt: string, slug: string): Promise<PersistedCover> {
  const prompts = [coverPrompt.trim() || FALLBACK_COVER_PROMPT, FALLBACK_COVER_PROMPT];
  let lastError: unknown = null;

  for (let attempt = 0; attempt < prompts.length; attempt += 1) {
    try {
      const cdnUrl = await generateCover(prompts[attempt]);
      if (!cdnUrl) throw new Error("image provider returned no URL");

      const imageResponse = await fetch(cdnUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!imageResponse.ok) {
        throw new Error(`cover download failed with HTTP ${imageResponse.status}`);
      }

      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      const format = assertImagePayload(buffer, imageResponse.headers.get("content-type") ?? "");
      return await persistCover(buffer, slug, format);
    } catch (error) {
      lastError = error;
      console.error(`cover attempt ${attempt + 1}/${prompts.length} failed:`, error);
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`cover generation failed after ${prompts.length} attempts: ${message}`);
}

function slugify(s: string): string {
  return (
    s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 70) ||
    `post-${Date.now()}`
  );
}

export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  // auth via secret header or query param
  const url = new URL(req.url);
  // auth: Vercel Cron sends Authorization: Bearer CRON_SECRET; manual calls use ?secret=
  const authHeader = req.headers.get("authorization") || "";
  const secret =
    (authHeader.startsWith("Bearer ") && process.env.CRON_SECRET && authHeader.slice(7) === process.env.CRON_SECRET
      ? process.env.CRON_SECRET
      : null) ||
    url.searchParams.get("secret");
  if (!secret || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const cands = await collectCandidates();
    if (cands.length === 0) {
      return NextResponse.json({ ok: false, reason: "no fresh candidates" });
    }

    const existing = await prisma.post.findMany({ select: { title: true }, take: 60 });
    const brief = await writeBrief(cands, existing.map((p) => p.title));
    const sel = cands[(brief.selected_index ?? 1) - 1] ?? cands[0];

    // dedupe check
    if (existing.some((p) => p.title === brief.title_th)) {
      return NextResponse.json({ ok: false, reason: "duplicate skipped" });
    }

    // A post is never published without a verified cover asset.
    const postSlug = slugify(sel.title);
    let coverUrl: string;
    try {
      const cover = await generateRequiredCover(
        brief.cover_prompt || FALLBACK_COVER_PROMPT,
        postSlug,
      );
      coverUrl = assertCoverUrl(cover.url);
      console.log(`cover verified: ${cover.filePath} → ${coverUrl}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("cover required; refusing to publish:", message);
      return NextResponse.json(
        { ok: false, reason: "cover generation failed; post not published", error: message },
        { status: 502 },
      );
    }

    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const post = await prisma.post.create({
      data: {
        slug: postSlug,
        title: brief.title_th,
        tldr: brief.tldr,
        body: brief.body_markdown,
        tag: brief.tag || "general",
        sources: JSON.stringify([
          { name: sel.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0], url: sel.url },
          { name: "Hacker News discussion", url: sel.hnUrl },
        ]),
        runnersUp: JSON.stringify(brief.runners_up ?? []),
        takeaway: brief.takeaway || "",
        readingMin: brief.reading_min || 4,
        coverImage: coverUrl,
        published: true,
        featuredUntil: tomorrow,
      },
    });

    return NextResponse.json({ ok: true, slug: post.slug, title: post.title, cover: coverUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("cron generate failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
