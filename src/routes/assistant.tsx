import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel, ReportIssue } from "@/components/ui-kit";
import { LANGUAGES } from "@/lib/content";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/assistant")({
  validateSearch: (search: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Study assistant — CITIZEN/PREP" },
      {
        name: "description",
        content:
          "Ask questions about the study material and get plain-language answers with the source shown. AI answers grounded in approved study content, with sources.",
      },
      { property: "og:title", content: "Study assistant — CITIZEN/PREP" },
      { property: "og:description", content: "Plain-language answers grounded in this app's approved study content." },
    ],
  }),
  component: AssistantPage,
});

type Source = { title: string; sourceTitle: string; url?: string | undefined; lastVerifiedAt: string };
type Message =
  | { role: "user"; text: string }
  | {
      role: "assistant";
      status: "answered" | "not_found" | "out_of_scope" | "error";
      answer: string;
      explanation: string;
      whyItMatters: string;
      vocabulary: string;
      sources: Source[];
      question: string;
      feedback?: "up" | "down" | undefined;
    };

const STARTER_KEYS = [
  "assistant.starter1",
  "assistant.starter2",
  "assistant.starter3",
  "assistant.starter4",
] as const;

async function ask(question: string, lang: string, simple: boolean, connectionError: string): Promise<Message> {
  try {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lang, simple }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
    return { role: "assistant", question, ...data };
  } catch (e) {
    return {
      role: "assistant",
      status: "error",
      answer: e instanceof Error && e.message ? e.message : connectionError,
      explanation: "",
      whyItMatters: "",
      vocabulary: "",
      sources: [],
      question,
    };
  }
}

function AssistantPage() {
  const { q } = Route.useSearch();
  const { t, uiLang } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<string>("app");
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);
  const answerLang = lang === "app" ? uiLang : lang;

  async function send(value: string, opts?: { lang?: string; simple?: boolean }) {
    const text = value.trim().slice(0, 500);
    if (text.length < 2 || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    const reply = await ask(text, opts?.lang ?? answerLang, !!opts?.simple, t("assistant.error"));
    setMessages((m) => [...m, reply]);
    setLoading(false);
    inputRef.current?.focus();
  }

  useEffect(() => {
    if (q && !sentInitial.current) {
      sentInitial.current = true;
      void send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const setFeedback = (i: number, f: "up" | "down") =>
    setMessages((m) => m.map((x, j) => (j === i && x.role === "assistant" ? { ...x, feedback: f } : x)));

  return (
    <AppShell>
      <AppHeader title={t("assistant.title")} subtitle={t("assistant.title")} />

      <Panel className="mb-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Eyebrow>{t("assistant.aiEyebrow")}</Eyebrow>
          <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
            {t("assistant.groundedBadge")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-pretty">
          {t("assistant.description")}
        </p>
        <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {t("assistant.answerLanguage")}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="min-h-10 flex-1 rounded-lg bg-surface px-3 text-sm text-foreground ring-1 ring-line/10"
          >
            <option value="app">{t("assistant.myAppLanguage")}</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.endonym}
              </option>
            ))}
          </select>
        </label>
      </Panel>

      <Panel delay={80} className="mb-4">
        {messages.length === 0 && (
          <div className="mb-3">
            <p className="mb-2 text-xs text-muted-foreground">{t("assistant.tryAsking")}</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => void send(t(k))}
                  className="min-h-10 rounded-full bg-line/5 px-3 py-2 text-xs ring-1 ring-line/10"
                >
                  {t(k)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4" aria-live="polite">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ms-auto max-w-[85%] rounded-2xl rounded-ee-sm bg-accent px-4 py-3 text-sm text-accent-foreground">
                {m.text}
              </div>
            ) : (
              <div key={i} className="space-y-2" dir={answerLang === "ar" ? "rtl" : undefined}>
                <div
                  className={`rounded-2xl rounded-ss-sm p-4 text-sm text-pretty ${
                    m.status === "error" ? "bg-demo/10 text-demo" : "bg-surface"
                  }`}
                >
                  <p className="font-medium">{m.answer}</p>
                  {m.explanation && <p className="mt-2 text-muted-foreground">{m.explanation}</p>}
                  {m.whyItMatters && (
                    <p className="mt-2 text-xs">
                      <span className="text-accent">{t("assistant.whyItMatters")} </span>
                      {m.whyItMatters}
                    </p>
                  )}
                  {m.vocabulary && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="text-foreground">{t("assistant.vocabularyLabel")} </span>
                      {m.vocabulary}
                    </p>
                  )}
                </div>
                {m.status !== "error" &&
                  m.sources.map((s, k) => (
                    <div key={k} className="rounded-xl bg-line/5 p-3 text-xs ring-1 ring-line/10" dir="ltr">
                      <p className="text-foreground">{s.title}</p>
                      <p className="mt-1 text-muted-foreground">
                        {s.sourceTitle}
                        {s.lastVerifiedAt && ` · ${t("settings.reviewedBadge")} ${s.lastVerifiedAt}`}{" "}
                        {s.url && (
                          <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-accent underline">
                            {t("assistant.showSource")}
                          </a>
                        )}
                      </p>
                      <p className={`mt-1 ${m.status === "answered" ? "text-verified" : "text-translated"}`}>
                        {m.status === "answered" ? t("assistant.fromAppContent") : t("assistant.notCovered")}
                      </p>
                    </div>
                  ))}
                <div className="flex flex-wrap gap-2 text-xs" dir="ltr">
                  {m.status === "error" ? (
                    <button onClick={() => void send(m.question)} className="min-h-10 rounded-full bg-line/5 px-3 ring-1 ring-line/10">
                      {t("assistant.tryAgain")}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigator.clipboard?.writeText(`${m.answer}\n\n${m.explanation}`)}
                        className="min-h-10 rounded-full bg-line/5 px-3 ring-1 ring-line/10"
                      >
                        {t("assistant.copy")}
                      </button>
                      <button onClick={() => void send(m.question, { lang: "en", simple: true })} className="min-h-10 rounded-full bg-line/5 px-3 ring-1 ring-line/10">
                        {t("assistant.simpleEnglish")}
                      </button>
                      <button onClick={() => void send(m.question, { lang: "fr" })} className="min-h-10 rounded-full bg-line/5 px-3 ring-1 ring-line/10">
                        {t("assistant.enFrancais")}
                      </button>
                      <button
                        aria-pressed={m.feedback === "up"}
                        onClick={() => setFeedback(i, "up")}
                        className={`min-h-10 rounded-full px-3 ring-1 ring-line/10 ${m.feedback === "up" ? "bg-accent/20 text-accent" : "bg-line/5"}`}
                      >
                        {t("assistant.helpful")}
                      </button>
                      <button
                        aria-pressed={m.feedback === "down"}
                        onClick={() => setFeedback(i, "down")}
                        className={`min-h-10 rounded-full px-3 ring-1 ring-line/10 ${m.feedback === "down" ? "bg-demo/20 text-demo" : "bg-line/5"}`}
                      >
                        {t("assistant.notHelpful")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ),
          )}
          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-accent" /> {t("assistant.checkingMaterial")}
            </p>
          )}
          <div ref={bottom} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            maxLength={500}
            rows={1}
            dir="auto"
            aria-label={t("assistant.questionAriaLabel")}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder={t("assistant.inputPlaceholder")}
            className="max-h-32 min-h-12 min-w-0 resize-none rounded-2xl bg-surface px-4 py-3 text-base ring-1 ring-line/10 placeholder:text-muted-foreground"
          />
          <button
            disabled={loading || input.trim().length < 2}
            className="min-h-12 shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
          >
            {t("assistant.send")}
          </button>
        </form>
        <p className="mt-1 text-end text-[10px] text-muted-foreground">{input.length}/500</p>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="mt-2 min-h-10 rounded-full bg-line/5 px-3 text-xs ring-1 ring-line/10"
          >
            {t("assistant.clearChat")}
          </button>
        )}

        <ReportIssue label={t("assistant.reportIncorrect")} />
      </Panel>
    </AppShell>
  );
}
