import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel } from "@/components/ui-kit";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";
import { OFFICIAL_LINKS, TOPICS, pick } from "@/lib/content";
import heroImg from "@/assets/home-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CITIZEN/PREP — Study for the Canadian citizenship test" },
      {
        name: "description",
        content:
          "Your study dashboard: continue a topic, hit your daily question goal, start a timed mock exam, or ask the study assistant.",
      },
      { property: "og:title", content: "CITIZEN/PREP — Study for the Canadian citizenship test" },
      {
        property: "og:description",
        content: "Continue learning, practise questions, take mock exams. Independent study tool.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, studyLang } = useSettings();
  const {
    completedSections,
    bookmarkedQuestions,
    bookmarkedSections,
    answeredToday,
    dailyGoal,
    accuracy,
    attempts,
    lastStudiedTopicId,
  } = useProgress();

  const nextTopic =
    TOPICS.find((topic) => topic.sections.some((s) => !completedSections.includes(s.id))) ??
    TOPICS[0]!;
  const done = nextTopic.sections.filter((s) => completedSections.includes(s.id)).length;
  const percent = Math.round((done / nextTopic.sections.length) * 100);
  const recentTopic = lastStudiedTopicId
    ? TOPICS.find((tp) => tp.id === lastStudiedTopicId)
    : undefined;

  return (
    <AppShell>
      <AppHeader />

      <section className="rise relative mb-4 overflow-hidden rounded-[18px] ring-1 ring-line/10">
        <img
          src={heroImg}
          alt="Illustration of a Canadian lakeside with Parliament-style towers and mountains"
          width={1024}
          height={640}
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-display text-2xl leading-none tracking-tight">{t("hero.title")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("hero.subtitle")}</p>
        </div>
      </section>

      <nav
        aria-label={t("actions.quickActions")}
        className="rise mb-4 grid grid-cols-4 gap-2"
        style={{ animationDelay: "40ms" }}
      >
        {[
          { to: "/topics" as const, icon: "≣", label: t("actions.study") },
          { to: "/practice" as const, icon: "?", label: t("practice.title") },
          { to: "/exam" as const, icon: "◷", label: t("cards.mockExam.title") },
          { to: "/assistant" as const, icon: "✦", label: t("actions.askAi") },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-line/5 p-2 text-center text-[11px] ring-1 ring-line/10"
          >
            <span aria-hidden="true" className="text-lg text-accent">
              {a.icon}
            </span>
            {a.label}
          </Link>
        ))}
      </nav>

      <Panel delay={60} className="mb-4">
        <div className="pointer-events-none absolute inset-y-0 -right-10 w-40 -skew-x-[24deg] bg-accent/10" />
        <div className="pointer-events-none absolute inset-y-0 right-14 w-12 -skew-x-[24deg] bg-line/5" />
        <div className="relative">
          <Eyebrow>{t("cards.continueLearning")}</Eyebrow>
          <h1 className="mt-1 font-display text-3xl leading-[1.02] tracking-tight text-balance">
            {pick(nextTopic.title, studyLang).text}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            {t("hero.sectionsProgress", { done, total: nextTopic.sections.length, percent })}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line/10">
            <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
          <Link
            to="/topics/$topicId"
            params={{ topicId: nextTopic.id }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            {t("common.continue")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Panel>

      <section className="rise mb-4 grid grid-cols-2 gap-3" style={{ animationDelay: "120ms" }}>
        <Link to="/practice" className="rounded-[16px] bg-line/5 p-4 ring-1 ring-line/10">
          <Eyebrow>{t("cards.dailyGoalTitle")}</Eyebrow>
          <p className="mt-2 text-sm font-medium text-pretty">
            {t("cards.dailyGoal", { done: answeredToday, total: dailyGoal })}
          </p>
        </Link>
        <Link to="/bookmarks" className="rounded-[16px] bg-line/5 p-4 ring-1 ring-line/10">
          <Eyebrow>{t("cards.bookmarksLabel")}</Eyebrow>
          <p className="mt-2 font-display text-2xl tracking-tight">
            {bookmarkedQuestions.length + bookmarkedSections.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("cards.bookmarks")}</p>
        </Link>
      </section>

      <Panel delay={150} className="mb-4">
        <Eyebrow>{t("cards.todaysRecommendation")}</Eyebrow>
        <p className="mt-1 text-sm text-pretty">
          {t("cards.dailyGoal", { done: answeredToday, total: dailyGoal })}
        </p>
        {recentTopic && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("cards.recentlyStudied")}{" "}
            <Link
              to="/topics/$topicId"
              params={{ topicId: recentTopic.id }}
              className="text-accent underline underline-offset-2"
            >
              {pick(recentTopic.title, studyLang).text}
            </Link>
          </p>
        )}
      </Panel>

      <Panel delay={180} className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Eyebrow>{t("cards.progress")}</Eyebrow>
          <Link to="/progress" className="text-xs text-accent">
            {t("cards.progressDetails")} →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
            <p className="font-display text-xl">{completedSections.length}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {t("cards.sections")}
            </p>
          </div>
          <div className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
            <p className="font-display text-xl">{attempts.length}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {t("cards.answered")}
            </p>
          </div>
          <div className="rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
            <p className="font-display text-xl text-accent">{accuracy}%</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {t("cards.correct")}
            </p>
          </div>
        </div>
      </Panel>

      <Panel delay={240} solid className="mb-4">
        <div className="pointer-events-none absolute inset-y-0 -left-8 w-28 -skew-x-[24deg] bg-verified/10" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow>{t("cards.mockExam.title")}</Eyebrow>
            <p className="font-display text-xl tracking-tight">{t("cards.mockExam.subtitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("exam.simulationNote")}</p>
          </div>
          <Link
            to="/exam"
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            {t("exam.startExam")}
          </Link>
        </div>
      </Panel>

      <Panel delay={300} className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Eyebrow>{t("cards.studyAssistant.title")}</Eyebrow>
          <span className="text-[10px] uppercase tracking-[0.14em] text-accent">
            {t("assistant.groundedBadge")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground text-pretty">{t("assistant.description")}</p>
        <Link
          to="/assistant"
          className="mt-3 inline-flex rounded-full bg-line/5 px-4 py-2 text-sm ring-1 ring-line/10"
        >
          {t("assistant.openLink")} →
        </Link>
      </Panel>

      <Panel delay={360} className="mb-2">
        <Eyebrow>{t("cards.officialInfo.title")}</Eyebrow>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          {t("cards.officialInfo.subtitle")}
        </p>
        <a
          href={OFFICIAL_LINKS.test}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-block text-sm text-accent underline underline-offset-2"
        >
          {t("cards.officialInfo.button")}
        </a>
      </Panel>
    </AppShell>
  );
}
