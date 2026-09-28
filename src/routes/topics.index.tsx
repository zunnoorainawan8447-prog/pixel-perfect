import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel, StatusPill } from "@/components/ui-kit";
import { TOPICS, pick } from "@/lib/content";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/topics/")({
  head: () => ({
    meta: [
      { title: "Study topics — CITIZEN/PREP" },
      {
        name: "description",
        content:
          "Study Canadian history, government, rights and responsibilities, geography, symbols, economy and citizenship, with sources and review dates.",
      },
      { property: "og:title", content: "Study topics — CITIZEN/PREP" },
      {
        property: "og:description",
        content: "Eight study areas for the Canadian citizenship knowledge test, each with sources and review dates.",
      },
    ],
  }),
  component: TopicsPage,
});

function TopicsPage() {
  const { studyLang, t } = useSettings();
  const { completedSections } = useProgress();

  return (
    <AppShell>
      <AppHeader title="TOPICS" subtitle={t("topics")} />
      <div className="space-y-3">
        {TOPICS.map((topic, i) => {
          const done = topic.sections.filter((s) => completedSections.includes(s.id)).length;
          const complete = done === topic.sections.length;
          return (
            <Link key={topic.id} to="/topics/$topicId" params={{ topicId: topic.id }} className="block">
              <Panel delay={i * 40}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl leading-tight tracking-tight">
                      {pick(topic.title, studyLang).text}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      {pick(topic.intro, studyLang).text}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-accent">
                    {done}/{topic.sections.length}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill status={complete ? "verified" : "reviewed"} />
                  <span className="text-[11px] text-muted-foreground">
                    {topic.readingMinutes} {t("minRead")} · reviewed {topic.source.lastVerifiedAt}
                  </span>
                </div>
              </Panel>
            </Link>
          );
        })}
      </div>
      <div className="mt-4">
        <Panel>
          <Eyebrow>Content sources and review dates</Eyebrow>
          <p className="mt-2 text-xs text-muted-foreground text-pretty">
            Study text here is paraphrased from the Government of Canada citizenship study guide and reviewed on the
            dates shown. Practice questions are original sample questions written for this app.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
