import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel, SourceNote } from "@/components/ui-kit";
import { QUESTIONS, TOPICS, pick, questionById, shuffled } from "@/lib/content";
import { useSettings } from "@/lib/settings";
import { useProgress, type ExamResult } from "@/lib/progress";

export const Route = createFileRoute("/exam")({
  head: () => ({
    meta: [
      { title: "Mock exam — CITIZEN/PREP" },
      {
        name: "description",
        content:
          "Take a timed practice simulation: choose the number of questions, answer with a timer, then review every mistake with explanations.",
      },
      { property: "og:title", content: "Mock exam — CITIZEN/PREP" },
      { property: "og:description", content: "A timed practice simulation with full answer review. Not an official exam." },
    ],
  }),
  component: ExamPage,
});

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function ExamPage() {
  const { studyLang, t } = useSettings();
  const { activeExam, setActiveExam, saveExam, recordAttempt, exams } = useProgress();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeExam?.endsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeExam?.endsAt]);

  const timeLeft = activeExam?.endsAt ? activeExam.endsAt - now : null;

  useEffect(() => {
    if (activeExam && timeLeft !== null && timeLeft <= 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function start(count: number, timed: boolean, topicId: string) {
    const pool = topicId ? QUESTIONS.filter((q) => q.topicId === topicId) : QUESTIONS;
    const ids = shuffled(pool.length ? pool : QUESTIONS)
      .slice(0, Math.min(count, pool.length || QUESTIONS.length))
      .map((q) => q.id);
    setResult(null);
    setActiveExam({
      questionIds: ids,
      answers: {},
      index: 0,
      timed,
      endsAt: timed ? Date.now() + ids.length * 90 * 1000 : null,
    });
  }

  function finish() {
    if (!activeExam) return;
    const wrongIds: string[] = [];
    let correct = 0;
    for (const id of activeExam.questionIds) {
      const q = questionById(id)!;
      const ok = activeExam.answers[id] === q.answerIndex;
      recordAttempt(id, ok);
      if (ok) correct++;
      else wrongIds.push(id);
    }
    const res: ExamResult = {
      id: `exam-${Date.now()}`,
      at: Date.now(),
      total: activeExam.questionIds.length,
      correct,
      questionIds: activeExam.questionIds,
      wrongIds,
      timed: activeExam.timed,
    };
    saveExam(res);
    setResult(res);
    setConfirming(false);
  }

  if (result) return <Results result={result} onRetry={() => setResult(null)} />;

  if (activeExam) {
    const qid = activeExam.questionIds[activeExam.index]!;
    const q = questionById(qid)!;
    const answered = Object.keys(activeExam.answers).length;
    return (
      <AppShell>
        <AppHeader title={t("exam.title")} subtitle={t("exam.simulationNote")} />
        <Panel solid className="mb-4">
          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Eyebrow>
                {t("exam.questionOf", { n: activeExam.index + 1, total: activeExam.questionIds.length })}
              </Eyebrow>
              <p className="font-display text-xl tracking-tight">{t("exam.answeredCount", { n: answered })}</p>
            </div>
            {timeLeft !== null && (
              <p className="shrink-0 font-mono text-2xl tabular-nums text-accent">{fmt(timeLeft)}</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {activeExam.questionIds.map((id, idx) => {
              const state =
                idx === activeExam.index
                  ? "bg-accent/20 ring-1 ring-accent"
                  : activeExam.answers[id] !== undefined
                    ? "bg-accent/80"
                    : "bg-line/10";
              return (
                <button
                  key={id}
                  aria-label={t("exam.questionAriaLabel", { n: idx + 1 })}
                  onClick={() => setActiveExam({ ...activeExam, index: idx })}
                  className={`size-6 rounded-md ${state}`}
                />
              );
            })}
          </div>
        </Panel>

        <Panel className="mb-4">
          <h2 className="mb-4 font-display text-xl leading-tight tracking-tight text-balance">
            {pick(q.prompt, studyLang).text}
          </h2>
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setActiveExam({ ...activeExam, answers: { ...activeExam.answers, [qid]: idx } })}
                className={`w-full rounded-xl px-4 py-3 text-start text-sm ring-1 ${
                  activeExam.answers[qid] === idx
                    ? "bg-accent/10 font-semibold ring-accent"
                    : "bg-line/5 ring-line/10"
                }`}
              >
                {pick(opt, studyLang).text}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              disabled={activeExam.index === 0}
              onClick={() => setActiveExam({ ...activeExam, index: activeExam.index - 1 })}
              className="rounded-full bg-line/5 px-4 py-2 text-sm ring-1 ring-line/10 disabled:opacity-40"
            >
              ←
            </button>
            {activeExam.index < activeExam.questionIds.length - 1 ? (
              <button
                onClick={() => setActiveExam({ ...activeExam, index: activeExam.index + 1 })}
                className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-accent-foreground"
              >
                {t("topics.next")} →
              </button>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-accent-foreground"
              >
                {t("exam.finishExam")}
              </button>
            )}
          </div>
          <button onClick={() => setConfirming(true)} className="mt-3 text-xs text-muted-foreground underline">
            {t("exam.endExamEarly")}
          </button>
        </Panel>

        {confirming && (
          <Panel solid className="mb-4">
            <p className="text-sm text-pretty">
              {t("exam.confirmEndTitle")}{" "}
              {t("exam.confirmEnd", { n: activeExam.questionIds.length - answered })}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={finish}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
              >
                {t("exam.confirm")}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-full bg-line/5 px-4 py-2 text-sm ring-1 ring-line/10"
              >
                {t("exam.cancel")}
              </button>
            </div>
          </Panel>
        )}

        <p className="mb-2 text-center text-[11px] text-muted-foreground">
          {t("exam.autosaveNote")}
        </p>
      </AppShell>
    );
  }

  return <ExamSetup onStart={start} history={exams} />;
}

function ExamSetup({
  onStart,
  history,
}: {
  onStart: (count: number, timed: boolean, topicId: string) => void;
  history: ExamResult[];
}) {
  const { studyLang, t } = useSettings();
  const [count, setCount] = useState(20);
  const [timed, setTimed] = useState(true);
  const [topicId, setTopicId] = useState("");

  return (
    <AppShell>
      <AppHeader title={t("exam.title")} subtitle={t("exam.simulationNote")} />
      <Panel className="mb-4">
        <h1 className="mt-1 font-display text-3xl leading-[1.02] tracking-tight">{t("exam.setupTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          {t("exam.setupDescription")}
        </p>

        <label className="mt-4 block text-xs text-muted-foreground">
          {t("exam.questionCount")}
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-line/10"
          >
            {[10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {t("exam.questionsOption", { n })}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-xs text-muted-foreground">
          {t("exam.topicFilter")}
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-line/10"
          >
            <option value="">{t("exam.allTopics")}</option>
            {TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {pick(topic.title, studyLang).text}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="size-4" />
          {t("exam.timedToggle")}
        </label>

        <button
          onClick={() => onStart(count, timed, topicId)}
          className="mt-4 w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground"
        >
          {t("exam.startExam")}
        </button>
      </Panel>

      {history.length > 0 && (
        <Panel delay={80} className="mb-4">
          <Eyebrow>{t("exam.pastAttempts")}</Eyebrow>
          <ul className="mt-2 space-y-2">
            {history.slice(0, 5).map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{new Date(h.at).toLocaleDateString()}</span>
                <span className="font-mono text-accent">
                  {h.correct}/{h.total}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </AppShell>
  );
}

function Results({ result, onRetry }: { result: ExamResult; onRetry: () => void }) {
  const { studyLang, t } = useSettings();
  const percent = Math.round((result.correct / result.total) * 100);

  return (
    <AppShell>
      <AppHeader title={t("exam.resultsTitle")} subtitle={t("exam.simulationNote")} />
      <Panel className="mb-4">
        <Eyebrow>{t("exam.resultsTitle")}</Eyebrow>
        <p className="mt-1 font-display text-5xl tracking-tight text-accent">{percent}%</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("exam.scoreLine", { correct: result.correct, total: result.total })} ·{" "}
          {result.timed ? t("exam.timedLabel") : t("exam.untimedLabel")}
        </p>
        <p className="mt-2 text-xs text-muted-foreground text-pretty">
          {t("exam.examDisclaimer")}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onRetry}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            {t("exam.newExam")}
          </button>
          <Link to="/progress" className="rounded-full bg-line/5 px-4 py-2 text-sm ring-1 ring-line/10">
            {t("exam.seeProgress")}
          </Link>
        </div>
      </Panel>

      <Panel delay={80} className="mb-4">
        <Eyebrow>{t("exam.reviewMistakes", { n: result.wrongIds.length })}</Eyebrow>
        <div className="mt-3 space-y-3">
          {result.wrongIds.length === 0 && <p className="text-sm text-muted-foreground">{t("exam.noMistakes")}</p>}
          {result.wrongIds.map((id) => {
            const q = questionById(id)!;
            return (
              <div key={id} className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
                <p className="text-sm font-semibold text-pretty">{pick(q.prompt, studyLang).text}</p>
                <p className="mt-1 text-sm text-verified">
                  {pick(q.options[q.answerIndex]!, studyLang).text}
                </p>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">
                  {pick(q.explanation, studyLang).text}
                </p>
                <SourceNote source={q.source} />
              </div>
            );
          })}
        </div>
      </Panel>
    </AppShell>
  );
}
