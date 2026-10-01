import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AppHeader,
  AppShell,
  Eyebrow,
  Panel,
  ReportIssue,
  SourceNote,
  StatusPill,
} from "@/components/ui-kit";
import { QUESTIONS, TOPICS, getLanguage, pick, shuffled } from "@/lib/content";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";

type Search = { topic?: string | undefined; difficulty?: "easy" | "medium" | "hard" | undefined };

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const topic = search["topic"];
    const difficulty = search["difficulty"];
    const out: Search = {};
    if (typeof topic === "string") out.topic = topic;
    if (difficulty === "easy" || difficulty === "medium" || difficulty === "hard")
      out.difficulty = difficulty;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Practice questions — CITIZEN/PREP" },
      {
        name: "description",
        content:
          "Answer multiple-choice practice questions with explanations and sources. Filter by topic and difficulty.",
      },
      { property: "og:title", content: "Practice questions — CITIZEN/PREP" },
      {
        property: "og:description",
        content: "Multiple-choice practice with explanations, sources and bookmarks.",
      },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { studyLang, t } = useSettings();
  const { recordAttempt, toggleQuestionBookmark, bookmarkedQuestions } = useProgress();

  const pool = useMemo(() => {
    const filtered = QUESTIONS.filter(
      (q) =>
        (!search.topic || q.topicId === search.topic) &&
        (!search.difficulty || q.difficulty === search.difficulty),
    );
    return shuffled(filtered.length ? filtered : QUESTIONS);
  }, [search.topic, search.difficulty]);

  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = pool[i % pool.length]!;
  const translation = getLanguage(studyLang).study;
  const isCorrect = submitted && selected === question.answerIndex;

  function submit() {
    if (selected === null || submitted) return;
    setSubmitted(true);
    recordAttempt(question.id, selected === question.answerIndex);
  }

  function next() {
    setSubmitted(false);
    setSelected(null);
    setI((v) => v + 1);
  }

  return (
    <AppShell>
      <AppHeader title={t("practice.title")} subtitle={t("practice.title")} />

      <Panel className="mb-4">
        <Eyebrow>{t("practice.filters")}</Eyebrow>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select
            value={search.topic ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              navigate({
                search: value ? { ...search, topic: value } : { ...search, topic: undefined },
              });
              setI(0);
              setSubmitted(false);
              setSelected(null);
            }}
            className="rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-line/10"
          >
            <option value="">{t("practice.allTopics")}</option>
            {TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {pick(topic.title, studyLang).text}
              </option>
            ))}
          </select>
          <select
            value={search.difficulty ?? ""}
            onChange={(e) => {
              const value = e.target.value as NonNullable<Search["difficulty"]> | "";
              navigate({
                search: value
                  ? { ...search, difficulty: value }
                  : { ...search, difficulty: undefined },
              });
              setI(0);
              setSubmitted(false);
              setSelected(null);
            }}
            className="rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-line/10"
          >
            <option value="">{t("practice.allLevels")}</option>
            <option value="easy">{t("practice.easy")}</option>
            <option value="medium">{t("practice.medium")}</option>
            <option value="hard">{t("practice.hard")}</option>
          </select>
        </div>
      </Panel>

      <Panel delay={80} className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Eyebrow>
            {t("practice.questionCounter", { n: (i % pool.length) + 1, total: pool.length })}
          </Eyebrow>
          <StatusPill status={translation} />
        </div>
        <h2 className="mb-4 font-display text-xl leading-tight tracking-tight text-balance">
          {pick(question.prompt, studyLang).text}
        </h2>
        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const chosen = selected === idx;
            let cls = "ring-line/10 bg-line/5";
            if (submitted && idx === question.answerIndex) cls = "ring-verified bg-verified/10";
            else if (submitted && chosen) cls = "ring-demo bg-demo/10";
            else if (chosen) cls = "ring-accent bg-accent/10 font-semibold";
            return (
              <button
                key={idx}
                onClick={() => !submitted && setSelected(idx)}
                className={`w-full rounded-xl px-4 py-3 text-start text-sm ring-1 ${cls}`}
              >
                {pick(opt, studyLang).text}
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button
            onClick={submit}
            disabled={selected === null}
            className="mt-4 w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground disabled:opacity-40"
          >
            {t("practice.checkAnswer")}
          </button>
        ) : (
          <>
            <p
              className={`mt-4 text-sm font-semibold ${isCorrect ? "text-verified" : "text-demo"}`}
            >
              {isCorrect ? t("practice.correct") : t("practice.incorrect")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              {pick(question.explanation, studyLang).text}
            </p>
            <SourceNote source={question.source} />
            <div className="mt-4 flex gap-2">
              <button
                onClick={next}
                className="flex-1 rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground"
              >
                {t("practice.nextQuestion")}
              </button>
              <button
                onClick={() => toggleQuestionBookmark(question.id)}
                className="rounded-full bg-line/5 px-4 text-sm ring-1 ring-line/10"
              >
                {bookmarkedQuestions.includes(question.id) ? "★" : "☆"}
              </button>
            </div>
          </>
        )}

        <ReportIssue label={t("topics.reportIssue")} />
      </Panel>
    </AppShell>
  );
}
