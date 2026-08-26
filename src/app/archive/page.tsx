import Link from "next/link";
import { getAllPublished } from "@/lib/posts";
import { Header, TagPill } from "@/components/chrome";

export const dynamic = "force-dynamic";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

function shortDate(d: Date) {
  const MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default async function Archive() {
  const posts = await getAllPublished();

  const groups = new Map<string, typeof posts>();
  for (const p of posts) {
    const d = p.createdAt;
    const key = `${d.getFullYear()}|${d.getMonth()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--text)]">Archive</h1>
        <p className="mt-1.5 text-[14px] font-light text-[var(--muted)]">
          ทุกเรื่องที่เคย publish — เรียงจากใหม่ไปเก่า
        </p>

        {[...groups.entries()].map(([key, items]) => {
          const [year, month] = key.split("|");
          return (
            <section key={key} className="mt-10">
              <h2 className="flex items-baseline gap-2 border-b border-[var(--border-subtle)] pb-2 text-[15px] font-semibold text-[var(--accent)]">
                {MONTHS_TH[Number(month)]} {Number(year) + 543}
                <span className="mono text-[11px] font-normal text-[var(--faint)]">{items.length} เรื่อง</span>
              </h2>
              <div className="mt-1">
                {items.map((p) => (
                  <Link
                    key={p.id}
                    href={`/post/${p.slug}`}
                    className="-mx-3 flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    <span className="flex min-w-0 items-baseline gap-3.5">
                      <span className="mono w-12 shrink-0 whitespace-nowrap text-[12px] text-[var(--faint)]">{shortDate(p.createdAt)}</span>
                      <span className="truncate text-[15px] text-[var(--body-c)] transition-colors hover:text-[var(--text)]">{p.title}</span>
                    </span>
                    <TagPill tag={p.tag} />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {posts.length === 0 && (
          <p className="mt-12 text-center text-[15px] text-[var(--muted)]">ยังไม่มีโพสต์</p>
        )}
      </main>
    </>
  );
}
