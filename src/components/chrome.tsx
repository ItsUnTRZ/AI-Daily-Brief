import Link from "next/link";
import { TAGS } from "@/lib/theme";

export function Header() {
  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="text-[14px] font-semibold tracking-tight">
          AI DAILY <span className="text-[var(--accent)]">BRIEF</span>
        </Link>
        <nav className="flex gap-6 text-[13px] font-medium text-[var(--muted)]">
          <Link href="/" className="transition-colors hover:text-[var(--text)]">หน้าแรก</Link>
          <Link href="/archive" className="transition-colors hover:text-[var(--text)]">Archive</Link>
        </nav>
      </div>
    </header>
  );
}

const TAG_DOT: Record<string, string> = {
  hardware: "var(--amber)",
  model: "var(--accent)",
  technique: "var(--teal)",
  industry: "#B48CFF",
  general: "var(--faint)",
};

export function TagPill({ tag }: { tag: string }) {
  const t = TAGS[tag] ?? TAGS.general;
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide"
      style={{ color: t.color, border: `1px solid ${t.color}44`, background: t.color + "10" }}
    >
      {t.label}
    </span>
  );
}

export function TagDot({ tag }: { tag: string }) {
  return (
    <span
      className="inline-block h-[7px] w-[7px] shrink-0 self-center rounded-full"
      style={{ background: TAG_DOT[tag] ?? TAG_DOT.general }}
      title={(TAGS[tag] ?? TAGS.general).label}
    />
  );
}

export function MonoMeta({ children }: { children: React.ReactNode }) {
  return <span className="mono text-[12px] text-[var(--faint)]">{children}</span>;
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
      style={{
        color: "var(--accent)",
        border: "1px solid rgba(74,158,255,0.25)",
        background: "rgba(74,158,255,0.06)",
      }}
    >
      {children}
    </span>
  );
}
