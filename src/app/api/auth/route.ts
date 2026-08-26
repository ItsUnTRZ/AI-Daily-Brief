import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const ADMIN_USER = process.env.ADMIN_USER || "boss";
const ADMIN_PASS = process.env.ADMIN_PASS || "changeme123";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }
  const token = jwt.sign({ sub: username }, SECRET, { expiresIn: "7d" });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 86400 });
  return res;
}

export async function GET() {
  // simple probe
  const count = await prisma.post.count();
  return NextResponse.json({ ok: true, posts: count });
}
