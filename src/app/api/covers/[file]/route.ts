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

// Serves cover images generated at runtime and stored in /tmp/covers on Vercel.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!/^[\w-]+\.(?:png|jpe?g|webp)$/i.test(file)) {
    return NextResponse.json({ error: "bad filename" }, { status: 400 });
  }

  try {
    const buf = await readFile(`/tmp/covers/${file}`);
    const contentType = COVER_CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(buf as unknown as BodyInit, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    // /tmp is per-instance and ephemeral; keep the DB hint for diagnostics.
    const slug = file.replace(/\.(?:png|jpe?g|webp)$/i, "");
    const post = await prisma.post.findFirst({ where: { slug }, select: { coverImage: true } });
    return NextResponse.json({ error: "not found", hint: post?.coverImage ?? null }, { status: 404 });
  }
}
