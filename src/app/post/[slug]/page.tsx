import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPostBySlug } from "@/lib/posts";
import { Header, TagPill, MonoMeta } from "@/components/chrome";
import { ReadingProgress } from "@/components/reading-progress";

export const dynamic = "force-dynamic";

const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function thDate(d: Date) {
  return `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published) notFound();

  const sources: { name: string; url: string }[] = JSON.parse(post.sources || "[]");
  const runners: { title: string; why: string; url?: string }[] = JSON.parse(post.runnersUp || "[]");
  const html = await marked.parse(post.body);

  return (
    <>
      <ReadingProgress />
      <Header />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-10">
        <Link href="/" className="text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--text)]">
          ← กลับหน้าแรก
        </Link>

        <article className="mt-7">
          <div className="flex flex-wrap items-center gap-3">
            <TagPill tag={post.tag} />
            <MonoMeta>{thDate(post.createdAt)} · ~{post.readingMin} นาที</MonoMeta>
          </div>

          <h1 className="mt-4 text-[28px] font-bold leading-[1.3] tracking-[-0.025em] text-[var(--text)] sm:text-[34px]">
            {post.title}
          </h1>

          {post.coverImage && (
            <div className="relative mt-6 aspect-[21/9] w-full overflow-hidden rounded-2xl" style={{ border: "1px solid var(--border-std)" }}>
              <Image src={post.coverImage} alt={post.title} fill priority className="object-cover" style={{ filter: "brightness(0.92)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 60%, rgba(8,9,10,0.7))" }} />
            </div>
          )}

          <div
            className="mt-6 rounded-xl p-5 text-[15.5px] leading-relaxed"
            style={{
              background: "rgba(74,158,255,0.05)",
              border: "1px solid rgba(74,158,255,0.15)",
              borderLeft: "3px solid var(--accent)",
              color: "var(--body-c)",
            }}
          >
            <strong className="text-[var(--text)]">TL;DR —</strong> {post.tldr}
          </div>

          <div className="article-body mt-9" dangerouslySetInnerHTML={{ __html: html }} />

          {post.takeaway && (
            <div
              className="mt-9 rounded-xl p-5 text-[15px] leading-relaxed"
              style={{
                background: "rgba(245,176,76,0.06)",
                border: "1px solid rgba(245,176,76,0.22)",
                color: "var(--body-c)",
              }}
            >
              💡 <strong style={{ color: "var(--amber)" }}>สรุปสั้น:</strong> {post.takeaway}
            </div>
          )}

          {runners.length > 0 && (
            <section className="mt-12">
              <h2 className="border-b border-[var(--border-subtle)] pb-2 text-[12px] font-semibold uppercase tracking-widest text-[var(--faint)]">
                เรื่องอื่นที่น่าจับตาของวันนี้
              </h2>
              <ul className="mt-3 space-y-2.5 text-[14.5px]">
                {runners.map((r, i) => (
                  <li key={i} className="leading-relaxed">
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener" className="text-[var(--accent)] hover:underline">{r.title}</a>
                    ) : (
                      <span className="text-[var(--body-c)]">{r.title}</span>
                    )}
                    {" — "}
                    <em className="text-[var(--muted)]">{r.why}</em>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sources.length > 0 && (
            <section className="mt-10 text-[13px]">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--faint)]">แหล่งที่มา</h2>
              <ul className="space-y-1.5">
                {sources.map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener" className="text-[var(--muted)] transition-colors hover:text-[var(--accent)] hover:underline">
                      {s.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
    </>
  );
}
