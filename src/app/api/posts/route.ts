import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

function check(req: NextRequest): boolean {
  const token = req.cookies.get("token")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^\w\u0E00-\u0E7F\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || `post-${Date.now()}`
  );
}

export async function POST(req: NextRequest) {
  if (!check(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  const slug = (b.slug || slugify(b.title)).toString();
  const post = await prisma.post.create({
    data: {
      slug,
      title: b.title,
      tldr: b.tldr,
      body: b.body,
      tag: b.tag || "general",
      sources: JSON.stringify(b.sources ?? []),
      runnersUp: JSON.stringify(b.runnersUp ?? []),
      takeaway: b.takeaway ?? "",
      readingMin: b.readingMin ?? 4,
      published: Boolean(b.published),
      featuredUntil: b.featuredUntil || null,
    },
  });
  return NextResponse.json({ ok: true, id: post.id, slug: post.slug });
}

export async function PUT(req: NextRequest) {
  if (!check(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const post = await prisma.post.update({
    where: { id: b.id },
    data: {
      ...(b.title !== undefined && { title: b.title }),
      ...(b.tldr !== undefined && { tldr: b.tldr }),
      ...(b.body !== undefined && { body: b.body }),
      ...(b.tag !== undefined && { tag: b.tag }),
      ...(b.takeaway !== undefined && { takeaway: b.takeaway }),
      ...(b.readingMin !== undefined && { readingMin: b.readingMin }),
      ...(b.published !== undefined && { published: b.published }),
      ...(b.featuredUntil !== undefined && { featuredUntil: b.featuredUntil }),
    },
  });
  return NextResponse.json({ ok: true, id: post.id });
}

export async function GET(req: NextRequest) {
  if (!check(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json(posts);
}

export async function DELETE(req: NextRequest) {
  if (!check(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
