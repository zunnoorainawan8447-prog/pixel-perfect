import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel, SourceNote } from "@/components/ui-kit";
import { TOPICS, pick, questionById } from "@/lib/content";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Your progress — CITIZEN/PREP" },
      {
        name: "description",
        content:
          "Topics completed, questions attempted, accuracy, mock exam history and the mistakes to review next.",
      },
      { property: "og:title", content: "Your progress — CITIZEN/PREP" },
      {
        property: "og:description",
        content: "See what you've studied and which questions to review.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { studyLang, t } = useSettings();
  const { completedSections, attempts, accuracy, exams, wrongQuestionIds, clearProgress } =
    useProgress();

  const nextTopic = TOPICS.find((topic) =>
    topic.sections.some((s) => !completedSections.includes(s.id)),
  );

  return (
    <AppShell>
      <AppHeader title={t("progress.title")} subtitle={t("progress.title")} />

      <Panel className="mb-4">
        <Eyebrow>{t("progress.overview")}</Eyebrow>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
            <p className="font-display text-2xl">{completedSections.length}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {t("progress.sectionsDone")}
            </p>
          </div>
          <div className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
            <p className="font-display text-2xl">{attempts.length}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {t("progress.questionsAnswered")}
            </p>
          </div>
          <div className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
            <p className="font-display text-2xl text-accent">{accuracy}%</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {t("progress.accuracy")}
            </p>
          </div>
        </div>
      </Panel>

      <Panel delay={60} className="mb-4">
        <Eyebrow>{t("progress.topicCompletion")}</Eyebrow>
        <div className="mt-3 space-y-2">
          {TOPICS.map((topic) => {
            const done = topic.sections.filter((s) => completedSections.includes(s.id)).length;
            const pct = Math.round((done / topic.sections.length) * 100);
            return (
              <div key={topic.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{pick(topic.title, studyLang).text}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line/10">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {nextTopic && (
          <Link
            to="/topics/$topicId"
            params={{ topicId: nextTopic.id }}
            className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            {t("progress.suggestedNext", { topic: pick(nextTopic.title, studyLang).text })}
          </Link>
        )}
      </Panel>

      <Panel delay={120} className="mb-4">
        <Eyebrow>{t("exam.reviewMistakes", { n: wrongQuestionIds.length })}</Eyebrow>
        <div className="mt-3 space-y-2">
          {wrongQuestionIds.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("progress.noWrongAnswers")}</p>
          )}
          {wrongQuestionIds.map((id) => {
            const q = questionById(id)!;
            return (
              <div key={id} className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
                <p className="text-sm text-pretty">{pick(q.prompt, studyLang).text}</p>
                <p className="mt-1 text-sm text-verified">
                  {pick(q.options[q.answerIndex]!, studyLang).text}
                </p>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">
                  {pick(q.explanation, studyLang).text}
                </p>
                <SourceNote source={q.source} />
                <Link
                  to="/practice"
                  search={{ topic: q.topicId }}
                  className="mt-2 inline-block text-xs text-accent underline"
                >
                  {t("progress.retryTopic")}
                </Link>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel delay={180} className="mb-4">
        <Eyebrow>{t("progress.examHistory")}</Eyebrow>
        <ul className="mt-3 space-y-2">
          {exams.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("progress.noExams")}</p>
          )}
          {exams.map((e) => (
            <li key={e.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {new Date(e.at).toLocaleString()} ·{" "}
                {e.timed ? t("exam.timedLabel") : t("exam.untimedLabel")}
              </span>
              <span className="font-mono text-accent">
                {e.correct}/{e.total}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel delay={240} className="mb-2">
        <Eyebrow>{t("progress.reset")}</Eyebrow>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            {t("progress.clearProgressLabel")}
          </summary>
          <p className="mt-2 text-xs text-muted-foreground text-pretty">
            {t("progress.clearProgressDesc")}
          </p>
          <button
            onClick={clearProgress}
            className="mt-2 rounded-full bg-demo/15 px-4 py-2 text-sm font-semibold text-demo ring-1 ring-demo/40"
          >
            {t("progress.confirmClear")}
          </button>
        </details>
      </Panel>
    </AppShell>
  );
}
