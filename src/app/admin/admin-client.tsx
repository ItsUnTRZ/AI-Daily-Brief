"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]";

function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center px-5">
      <form
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-7"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: u, password: p }),
          });
          if (res.ok) router.refresh();
          else setErr("username / password ไม่ถูกต้อง");
        }}
      >
        <h1 className="text-lg font-bold">Admin Login</h1>
        <input className={`${inputCls} mt-4`} placeholder="username" value={u} onChange={(e) => setU(e.target.value)} />
        <input type="password" className={`${inputCls} mt-3`} placeholder="password" value={p} onChange={(e) => setP(e.target.value)} />
        {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
        <button className="mt-4 w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-semibold text-[#0B1220] hover:brightness-110">
          เข้าสู่ระบบ
        </button>
      </form>
    </main>
  );
}

export default function AdminClient({ mode }: { mode: "login" | "editor" }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tldr, setTldr] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("model");
  const [takeaway, setTakeaway] = useState("");
  const [sources, setSources] = useState("[]");
  const [runnersUp, setRunnersUp] = useState("[]");
  const [readingMin, setReadingMin] = useState(4);
  const [featuredUntil, setFeaturedUntil] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [msg, setMsg] = useState("");

  if (mode === "login") return <Login />;

  async function publish(published: boolean) {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, slug, tldr, body, tag, takeaway, readingMin,
        sources: JSON.parse(sources || "[]"),
        runnersUp: JSON.parse(runnersUp || "[]"),
        featuredUntil, published,
      }),
    });
    const j = await res.json();
    setMsg(res.ok ? `✅ saved → /post/${j.slug}` : `❌ ${j.error}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-xl font-bold">✍️ เขียนโพสต์ใหม่</h1>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">หัวข้อ *</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">slug (เว้นว่าง = auto)</label>
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">tag</label>
            <select className={inputCls} value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="model">โมเดลใหม่</option>
              <option value="technique">เทคนิค/วิธีใช้</option>
              <option value="hardware">ฮาร์ดแวร์</option>
              <option value="industry">วงการ AI</option>
              <option value="general">ทั่วไป</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">TL;DR (1-2 ประโยค) *</label>
          <textarea className={`${inputCls} h-16`} value={tldr} onChange={(e) => setTldr(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">เนื้อหา (Markdown)</label>
          <textarea className={`${inputCls} h-72 font-mono text-xs`} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Takeaway</label>
          <textarea className={`${inputCls} h-14`} value={takeaway} onChange={(e) => setTakeaway(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">sources JSON [{`[{name,url}]`}]</label>
            <textarea className={`${inputCls} h-20 font-mono text-xs`} value={sources} onChange={(e) => setSources(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">runners-up JSON</label>
            <textarea className={`${inputCls} h-20 font-mono text-xs`} value={runnersUp} onChange={(e) => setRunnersUp(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">reading minutes</label>
            <input type="number" className={inputCls} value={readingMin} onChange={(e) => setReadingMin(+e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">เด่นจนถึงวันที่ (featured until)</label>
            <input type="date" className={inputCls} value={featuredUntil} onChange={(e) => setFeaturedUntil(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => publish(true)} className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[#0B1220] hover:brightness-110">
            Publish
          </button>
          <button onClick={() => publish(false)} className="rounded-lg border border-[var(--border)] px-5 py-2 text-sm text-[var(--muted)] hover:border-[var(--accent)]">
            Save draft
          </button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </div>
    </main>
  );
}
