import Link from "next/link";
import Image from "next/image";
import { getFeaturedPost, getRecentPosts } from "@/lib/posts";
import { Header, TagPill, TagDot, MonoMeta, Kicker } from "@/components/chrome";
import { formatDate } from "@/lib/theme";

export const dynamic = "force-dynamic";

function shortDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}`;
}

const thDate = (d: Date) => formatDate(d.toISOString());

export default async function Home() {
  const featured = await getFeaturedPost();
  const rest = await getRecentPosts(featured?.id);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        {!featured && (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--panel)] p-16 text-center text-[15px] text-[var(--muted)]">
            ยังไม่มีโพสต์ — เริ่มเขียนที่ /admin
          </div>
        )}

        {featured && (
          <section aria-label="เรื่องของวัน">
            <Kicker>✦ เรื่องของวัน · {thDate(featured.createdAt)}</Kicker>

            <Link href={`/post/${featured.slug}`} className="group mt-5 block">
              <article
                className="overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  border: "1px solid var(--border-std)",
                }}
              >
                <div
                  className="h-[2px] opacity-100"
                  style={{ background: "linear-gradient(90deg, var(--accent), var(--teal))" }}
                />
                {featured.coverImage && (
                  <div className="relative aspect-[21/9] w-full overflow-hidden">
                    <Image
                      src={featured.coverImage}
                      alt={featured.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      style={{ filter: "brightness(0.92)" }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(8,9,10,0.85))" }} />
                  </div>
                )}
                <div className="group-hover:border-[rgba(74,158,255,0.45)] p-8 sm:p-10 [&:hover]:border-[rgba(74,158,255,0.4)]" style={{ borderLeft: "none" }}>
                  <div className="flex flex-wrap items-center gap-3">
                    <TagPill tag={featured.tag} />
                    <MonoMeta>~{featured.readingMin} นาที</MonoMeta>
                  </div>

                  <h1 className="mt-5 text-[26px] font-bold leading-snug tracking-tight text-[var(--text)] transition-colors group-hover:text-white sm:text-[30px] sm:leading-[1.25] sm:tracking-[-0.02em]">
                    {featured.title}
                  </h1>

                  <p className="mt-4 text-[16px] font-light leading-relaxed text-[var(--body-c)]">
                    {featured.tldr}
                  </p>

                  <div className="mt-7 flex items-center justify-between text-[13px] text-[var(--faint)]">
                    <span>{thDate(featured.createdAt)}</span>
                    <span className="font-medium text-[var(--accent)]">อ่านต่อ →</span>
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        {rest.length > 0 && (
          <section aria-label="ย้อนหลัง" className="mt-14">
            <h2 className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5 text-[12px] font-semibold uppercase tracking-widest text-[var(--faint)]">
              <span>ย้อนหลัง</span>
              <Link href="/archive" className="mono normal-case tracking-normal hover:text-[var(--muted)]">/archive</Link>
            </h2>

            {rest.map((p) => (
              <Link
                key={p.id}
                href={`/post/${p.slug}`}
                className="-mx-3 flex items-baseline justify-between gap-4 border-b border-[var(--border-subtle)] px-3 py-3.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.03)]"
              >
                <span className="flex min-w-0 items-baseline gap-3.5">
                  <span className="mono whitespace-nowrap text-[12px] text-[var(--faint)]">{shortDate(p.createdAt)}</span>
                  <span className="truncate text-[15px] font-normal text-[var(--body-c)] transition-colors hover:text-[var(--text)]">
                    {p.title}
                  </span>
                </span>
                <TagDot tag={p.tag} />
              </Link>
            ))}
          </section>
        )}
      </main>
      <footer className="mx-auto max-w-3xl px-6 pb-10 pt-4 text-center text-[12px] text-[var(--muted)]">
        AI DAILY BRIEF — วันละ 1 เรื่อง 3–5 นาที
      </footer>
    </>
  );
}
