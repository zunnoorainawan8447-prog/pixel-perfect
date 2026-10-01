import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel } from "@/components/ui-kit";
import { TOPICS, pick, questionById } from "@/lib/content";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks — CITIZEN/PREP" },
      {
        name: "description",
        content: "Your saved practice questions and study sections, ready to review again.",
      },
      { property: "og:title", content: "Bookmarks — CITIZEN/PREP" },
      { property: "og:description", content: "Saved questions and study sections for later review." },
    ],
  }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const { studyLang, t } = useSettings();
  const { bookmarkedQuestions, bookmarkedSections, toggleQuestionBookmark, toggleSectionBookmark } = useProgress();
  const [query, setQuery] = useState("");

  const sections = TOPICS.flatMap((topic) =>
    topic.sections.filter((s) => bookmarkedSections.includes(s.id)).map((s) => ({ topic, section: s })),
  );

  const filter = (text: string) => text.toLowerCase().includes(query.toLowerCase());

  return (
    <AppShell>
      <AppHeader title={t("bookmarks.title")} subtitle={t("bookmarks.title")} />

      <Panel className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("bookmarks.search")}
          aria-label={t("bookmarks.search")}
          className="w-full rounded-full bg-surface px-4 py-3 text-sm ring-1 ring-line/10 placeholder:text-muted-foreground"
        />
      </Panel>

      <Panel delay={60} className="mb-4">
        <Eyebrow>{t("bookmarks.savedQuestions", { n: bookmarkedQuestions.length })}</Eyebrow>
        <div className="mt-3 space-y-2">
          {bookmarkedQuestions.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("bookmarks.emptyQuestions")}</p>
          )}
          {bookmarkedQuestions
            .map((id) => questionById(id)!)
            .filter((q) => q && filter(q.prompt.en))
            .map((q) => (
              <div key={q.id} className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
                <p className="text-sm text-pretty">{pick(q.prompt, studyLang).text}</p>
                <p className="mt-1 text-sm text-verified">{pick(q.options[q.answerIndex]!, studyLang).text}</p>
                <button
                  onClick={() => toggleQuestionBookmark(q.id)}
                  className="mt-2 text-xs text-muted-foreground underline"
                >
                  {t("bookmarks.remove")}
                </button>
              </div>
            ))}
        </div>
      </Panel>

      <Panel delay={120} className="mb-4">
        <Eyebrow>{t("bookmarks.savedSections", { n: sections.length })}</Eyebrow>
        <div className="mt-3 space-y-2">
          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("bookmarks.emptySections")}</p>
          )}
          {sections
            .filter(({ section }) => filter(section.title.en))
            .map(({ topic, section }) => (
              <div key={section.id} className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
                <p className="text-sm font-semibold">{pick(section.title, studyLang).text}</p>
                <p className="text-xs text-muted-foreground">{pick(topic.title, studyLang).text}</p>
                <div className="mt-2 flex gap-3 text-xs">
                  <Link to="/topics/$topicId" params={{ topicId: topic.id }} className="text-accent underline">
                    {t("bookmarks.continueStudying")}
                  </Link>
                  <button onClick={() => toggleSectionBookmark(section.id)} className="text-muted-foreground underline">
                    {t("bookmarks.remove")}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </Panel>
    </AppShell>
  );
}
