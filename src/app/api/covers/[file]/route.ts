import { readFile } from "fs/promises";
import { extname } from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COVER_CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Serves cover images — supports Blob URLs, legacy /tmp, and graceful fallback.
// New covers are durable Blob URLs (https://*.public.blob.vercel-storage.com) so this route is only for legacy.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!/^[\w-]+\.(?:png|jpe?g|webp)$/i.test(file)) {
    return NextResponse.json({ error: "bad filename" }, { status: 400 });
  }

  // 1) Try /tmp first (fast path for same-instance)
  try {
    const buf = await readFile(`/tmp/covers/${file}`);
    const contentType = COVER_CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(buf as unknown as BodyInit, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400, immutable" },
    });
  } catch {
    // fall through
  }

  // 2) Try public/covers (for local dev or blob fallback persisted to public)
  try {
    const buf = await readFile(`${process.cwd()}/public/covers/${file}`);
    const contentType = COVER_CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(buf as unknown as BodyInit, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    // fall through
  }

  // 3) DB lookup — if coverImage is a durable http URL (Blob/CDN/picsum), redirect instead of 404
  const slug = file.replace(/\.(?:png|jpe?g|webp)$/i, "");
  try {
    const post = await prisma.post.findFirst({ where: { slug }, select: { coverImage: true } });
    const cover = post?.coverImage;
    if (cover && cover.startsWith("http")) {
      // 302 to durable URL — keeps old /api/covers/*.jpg bookmarks working, but new posts use direct Blob URL
      return NextResponse.redirect(cover, 302);
    }
    if (cover && (cover.startsWith("/covers/") || cover.startsWith("/api/covers/"))) {
      // Legacy path that itself points here — avoid loop, use unique placeholder
      return NextResponse.redirect(`https://picsum.photos/seed/${slug}/1376/768`, 302);
    }
  } catch (e) {
    console.error("covers fallback lookup failed:", e);
  }

  // 4) Ultimate graceful fallback — unique placeholder per slug so page never shows broken image
  // seeded picsum guarantees different image per post (รูปไม่ซ้ำกัน)
  return NextResponse.redirect(`https://picsum.photos/seed/${slug}/1376/768`, 302);
}
