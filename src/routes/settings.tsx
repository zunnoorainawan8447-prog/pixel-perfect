import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel, StatusPill } from "@/components/ui-kit";
import { LANGUAGES, OFFICIAL_LINKS, type LangCode } from "@/lib/content";
import { useSettings, type TextSize } from "@/lib/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CITIZEN/PREP" },
      {
        name: "description",
        content:
          "Choose your interface language and study content language, adjust text size, and read the privacy and content policy.",
      },
      { property: "og:title", content: "Settings — CITIZEN/PREP" },
      { property: "og:description", content: "Language, text size and privacy settings for your study app." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { uiLang, studyLang, textSize, set, t } = useSettings();

  return (
    <AppShell>
      <AppHeader title="SETTINGS" subtitle={t("settings")} />

      <Panel className="mb-4">
        <Eyebrow>App interface language</Eyebrow>
        <p className="mt-1 text-xs text-muted-foreground">Menus, buttons and navigation.</p>
        <div className="mt-3 space-y-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              disabled={l.ui === "unavailable"}
              onClick={() => set({ uiLang: l.code as LangCode })}
              className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-3 py-2.5 text-start ring-1 ${
                uiLang === l.code ? "bg-accent/10 ring-accent" : "bg-line/5 ring-line/10"
              } disabled:opacity-40`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{l.endonym}</span>
                <span className="block truncate text-xs text-muted-foreground">{l.englishName}</span>
              </span>
              <StatusPill status={l.ui} />
            </button>
          ))}
        </div>
      </Panel>

      <Panel delay={60} className="mb-4">
        <Eyebrow>Study content language</Eyebrow>
        <p className="mt-1 text-xs text-muted-foreground">
          Learning text and explanations. You can read in one language while navigating in another.
        </p>
        <div className="mt-3 space-y-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              disabled={l.study === "unavailable"}
              onClick={() => set({ studyLang: l.code as LangCode })}
              className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-3 py-2.5 text-start ring-1 ${
                studyLang === l.code ? "bg-accent/10 ring-accent" : "bg-line/5 ring-line/10"
              } disabled:opacity-40`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{l.endonym}</span>
                <span className="block truncate text-xs text-muted-foreground">{l.englishName}</span>
              </span>
              <StatusPill status={l.study} />
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground text-pretty">
          Machine-translated content has not been checked by a human reviewer. Nothing here is labelled professionally
          verified unless it has actually been reviewed.
        </p>
      </Panel>

      <Panel delay={120} className="mb-4">
        <Eyebrow>Text size</Eyebrow>
        <div className="mt-3 flex gap-2">
          {(["normal", "large", "xlarge"] as TextSize[]).map((size) => (
            <button
              key={size}
              onClick={() => set({ textSize: size })}
              className={`flex-1 rounded-full py-2 text-sm ring-1 ${
                textSize === size ? "bg-accent/10 font-semibold text-accent ring-accent" : "bg-line/5 ring-line/10"
              }`}
            >
              {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
            </button>
          ))}
        </div>
      </Panel>

      <Panel delay={180} className="mb-4">
        <Eyebrow>Privacy</Eyebrow>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Your answers, bookmarks and settings are stored only on this device. No account is needed and nothing is
          sent to a server in this prototype.
        </p>
      </Panel>

      <Panel delay={240} className="mb-4">
        <Eyebrow>About this app</Eyebrow>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">{t("disclaimer")}</p>
        <div className="mt-3 flex flex-col gap-1 text-sm">
          <a href={OFFICIAL_LINKS.test} target="_blank" rel="noreferrer noopener" className="text-accent underline">
            Official citizenship test information
          </a>
          <a href={OFFICIAL_LINKS.guide} target="_blank" rel="noreferrer noopener" className="text-accent underline">
            Official study guide
          </a>
          <Link to="/progress" className="text-accent underline">
            Manage your progress data
          </Link>
        </div>
      </Panel>
    </AppShell>
  );
}
