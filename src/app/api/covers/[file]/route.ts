import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Serves cover images generated at runtime (stored in /tmp/covers on the serverless instance),
// or proxies from the Leonardo CDN if not found locally.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!/^[\w-]+\.jpg$/.test(file)) {
    return NextResponse.json({ error: "bad filename" }, { status: 400 });
  }

  try {
    const fs = await import("fs/promises");
    const buf = await fs.readFile(`/tmp/covers/${file}`);
    return new NextResponse(buf as unknown as BodyInit, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    // /tmp is per-instance and ephemeral — fall back to DB lookup of the original CDN URL
    const slug = file.replace(/\.jpg$/, "");
    const post = await prisma.post.findFirst({ where: { slug }, select: { coverImage: true } });
    return NextResponse.json({ error: "not found", hint: post?.coverImage ?? null }, { status: 404 });
  }
}
