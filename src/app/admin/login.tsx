"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });
    if (res.ok) router.push("/admin");
    else setErr("username / password ไม่ถูกต้อง");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center px-5">
      <form onSubmit={submit} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-7">
        <h1 className="text-lg font-bold">Admin Login</h1>
        <input
          className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          placeholder="username" value={u} onChange={(e) => setU(e.target.value)} />
        <input
          type="password"
          className="mt-3 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          placeholder="password" value={p} onChange={(e) => setP(e.target.value)} />
        {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
        <button className="mt-4 w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-semibold text-[#0B1220] hover:brightness-110">
          เข้าสู่ระบบ
        </button>
      </form>
    </main>
  );
}
