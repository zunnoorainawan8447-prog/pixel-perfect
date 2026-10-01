import { useState, useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel, ReportIssue, SourceNote, StatusPill } from "@/components/ui-kit";
import { topicById, pick, getLanguage, LANGUAGES } from "@/lib/content";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/topics/$topicId")({
  loader: ({ params }) => {
    const topic = topicById(params.topicId);
    if (!topic) throw notFound();
    return { title: topic.title.en, intro: topic.intro.en };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Topic unavailable — CITIZEN/PREP" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — CITIZEN/PREP` },
        { name: "description", content: loaderData.intro },
        { property: "og:title", content: `${loaderData.title} — CITIZEN/PREP` },
        { property: "og:description", content: loaderData.intro },
      ],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { topicId } = Route.useParams();
  const topic = topicById(topicId)!;
  const { studyLang, t, set } = useSettings();
  const { completedSections, bookmarkedSections, toggleSectionComplete, toggleSectionBookmark, recordStudyVisit } = useProgress();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    recordStudyVisit(topicId);
  }, [topicId, recordStudyVisit]);
  const section = topic.sections[index]!;
  const translation = getLanguage(studyLang).study;

  return (
    <AppShell>
      <AppHeader title={t("topics.title")} subtitle={pick(topic.title, studyLang).text} />

      <Panel className="mb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusPill status={translation} />
          <span className="text-[11px] text-muted-foreground">
            {t("topics.minRead", { n: topic.readingMinutes })}
          </span>
        </div>
        <h1 className="font-display text-3xl leading-[1.02] tracking-tight text-balance">
          {pick(topic.title, studyLang).text}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">{pick(topic.intro, studyLang).text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {topic.sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={`rounded-full px-3 py-1.5 text-xs ring-1 ${
                i === index ? "bg-accent/15 text-accent ring-accent" : "bg-line/5 text-muted-foreground ring-line/10"
              }`}
            >
              {i + 1}. {pick(s.title, studyLang).text}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-xs text-muted-foreground">
          {t("topics.studyLanguageLabel")}
          <select
            value={studyLang}
            onChange={(e) => set({ studyLang: e.target.value as typeof studyLang })}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-line/10"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.endonym} ({l.englishName})
              </option>
            ))}
          </select>
        </label>
      </Panel>

      <Panel className="mb-4" solid>
        <Eyebrow>
          {t("topics.section")} {index + 1} / {topic.sections.length}
        </Eyebrow>
        <h2 className="mt-1 font-display text-2xl leading-tight tracking-tight">
          {pick(section.title, studyLang).text}
        </h2>
        <div className="mt-3 space-y-3">
          {section.body.map((p, i) => (
            <p key={i} className="text-size-lg leading-relaxed text-pretty">
              {pick(p, studyLang).text}
            </p>
          ))}
        </div>

        {section.vocabulary && (
          <div className="mt-4 rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
            <Eyebrow>{t("topics.vocabulary")}</Eyebrow>
            <dl className="mt-2 space-y-2">
              {section.vocabulary.map((v, i) => (
                <div key={i}>
                  <dt className="text-sm font-semibold">{pick(v.term, studyLang).text}</dt>
                  <dd className="text-sm text-muted-foreground">{pick(v.meaning, studyLang).text}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <SourceNote source={topic.source} />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => toggleSectionComplete(section.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              completedSections.includes(section.id)
                ? "bg-verified/15 text-verified ring-1 ring-verified/40"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {completedSections.includes(section.id) ? `✓ ${t("topics.completed")}` : t("topics.markComplete")}
          </button>
          <button
            onClick={() => toggleSectionBookmark(section.id)}
            className="rounded-full bg-line/5 px-4 py-2 text-sm ring-1 ring-line/10"
          >
            {bookmarkedSections.includes(section.id) ? `★ ${t("topics.bookmarkedSection")}` : `☆ ${t("topics.bookmarkSection")}`}
          </button>
          <Link
            to="/assistant"
            search={{ q: `Explain "${section.title.en}" simply` }}
            className="rounded-full bg-line/5 px-4 py-2 text-sm text-accent ring-1 ring-line/10"
          >
            ✦ {t("topics.askAssistant")}
          </Link>
        </div>

        <ReportIssue label={t("topics.reportIssue")} />
      </Panel>

      <div className="mb-2 flex items-center justify-between gap-3">
        <button
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="rounded-full bg-line/5 px-4 py-2 text-sm ring-1 ring-line/10 disabled:opacity-40"
        >
          ← {t("topics.previous")}
        </button>
        {index < topic.sections.length - 1 ? (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            {t("topics.next")} →
          </button>
        ) : (
          <Link
            to="/practice"
            search={{ topic: topic.id }}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            {t("topics.practiceTopic")} →
          </Link>
        )}
      </div>
    </AppShell>
  );
}
