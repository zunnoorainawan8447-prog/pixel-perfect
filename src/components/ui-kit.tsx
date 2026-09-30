import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { SourceMeta, TranslationStatus } from "@/lib/content";
import { useSettings } from "@/lib/settings";

export function Panel({
  children,
  className = "",
  delay = 0,
  solid = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  solid?: boolean;
}) {
  return (
    <section
      className={`rise relative overflow-hidden rounded-[18px] ring-1 ring-line/10 ${
        solid ? "bg-surface" : "bg-line/5"
      } p-5 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{children}</p>;
}

export function StatusPill({ status }: { status: TranslationStatus | "demo" | "verified" }) {
  const map = {
    reviewed: { label: "Reviewed translation", color: "text-verified", bg: "bg-verified/10", dot: "bg-verified" },
    verified: { label: "Verified source", color: "text-verified", bg: "bg-verified/10", dot: "bg-verified" },
    machine: {
      label: "Machine-translated",
      color: "text-translated",
      bg: "bg-translated/10",
      dot: "bg-translated",
    },
    unavailable: {
      label: "Not yet available",
      color: "text-muted-foreground",
      bg: "bg-line/5",
      dot: "bg-muted-foreground",
    },
    demo: { label: "Demo content", color: "text-demo", bg: "bg-demo/10", dot: "bg-demo" },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${map.bg} px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${map.color}`}
    >
      <span className={`size-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

export function SourceNote({ source }: { source: SourceMeta }) {
  return (
    <div className="mt-3 rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Source:</span> {source.sourceTitle}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Last verified {source.lastVerifiedAt} ·{" "}
        {source.contentStatus === "demo"
          ? "Original sample question — not an official exam question"
          : "Paraphrased from official material"}
      </p>
      {source.sourceUrl && (
        <a
          href={source.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 inline-block text-[11px] text-accent underline underline-offset-2"
        >
          Open official page
        </a>
      )}
    </div>
  );
}

export function ReportIssue({ label }: { label: string }) {
  return (
    <details className="mt-3 rounded-xl bg-line/5 ring-1 ring-line/10">
      <summary className="min-h-11 cursor-pointer list-none px-3 py-3 text-xs text-muted-foreground">⚑ {label}</summary>
      <form
        className="space-y-2 px-3 pb-3"
        onSubmit={(e) => {
          e.preventDefault();
          const el = e.currentTarget;
          el.reset();
          const note = el.querySelector("[data-sent]");
          if (note) note.classList.remove("hidden");
        }}
      >
        <select className="w-full rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-line/10">
          <option>Incorrect answer</option>
          <option>Outdated information</option>
          <option>Translation problem</option>
          <option>Unclear explanation</option>
          <option>Technical issue</option>
        </select>
        <textarea
          rows={2}
          placeholder="Tell us more (optional)"
          className="w-full rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-line/10 placeholder:text-muted-foreground"
        />
        <button className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground">
          Submit report
        </button>
        <p data-sent className="hidden text-[11px] text-verified">
          Thanks — reports are stored locally in this prototype.
        </p>
      </form>
    </details>
  );
}

const NAV = [
  { to: "/", icon: "▦", key: "home" as const },
  { to: "/topics", icon: "≣", key: "topics" as const },
  { to: "/practice", icon: "?", key: "practice" as const },
  { to: "/exam", icon: "◷", key: "exam" as const },
  { to: "/progress", icon: "◔", key: "progress" as const },
];

export function BottomNav() {
  const { t } = useSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="sticky bottom-3 z-20 mt-4 flex items-center justify-around rounded-full bg-surface/90 p-1.5 ring-1 ring-line/10 backdrop-blur">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex min-w-0 flex-col items-center gap-0.5 min-h-12 justify-center rounded-full px-2.5 py-2 text-[10px] uppercase tracking-wider ${
              active ? "bg-accent/15 font-semibold text-accent" : "text-muted-foreground"
            }`}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {item.icon}
            </span>
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useSettings();
  return (
    <div className="relative flex min-h-screen w-full justify-center overflow-hidden bg-background px-3 py-6 text-foreground">
      <div className="drift pointer-events-none absolute -right-1/4 -top-1/3 aspect-square w-[80%] rounded-full bg-accent/10 blur-[90px]" />
      <div
        className="drift pointer-events-none absolute -bottom-1/3 -left-1/4 aspect-square w-[70%] rounded-full bg-verified/10 blur-[90px]"
        style={{ animationDelay: "-8s" }}
      />
      <main className="relative w-full max-w-[420px]">
        {children}
        <Link
          to="/assistant"
          aria-label="Open AI study assistant"
          className="sticky bottom-24 z-30 ms-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20"
        >
          <span aria-hidden="true">✦</span> Ask AI
        </Link>
        <BottomNav />
        <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
      </main>
    </div>
  );
}

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { t, uiLang, studyLang } = useSettings();
  return (
    <header className="rise mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="min-w-0">
        <Link to="/" className="block">
          <p className="font-display text-3xl leading-none tracking-tight">
            {title ?? (
              <>
                CITIZEN<span className="text-accent">/</span>PREP
              </>
            )}
          </p>
        </Link>
        <p className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {subtitle ?? t("notOfficial")}
        </p>
      </div>
      <Link
        to="/settings"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-line/5 px-3 py-2 text-sm ring-1 ring-line/10"
      >
        <span className="font-semibold uppercase text-accent">{uiLang}</span>
        <span className="text-xs text-muted-foreground">/ {studyLang}</span>
      </Link>
    </header>
  );
}
