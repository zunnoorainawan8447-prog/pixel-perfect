import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel, ReportIssue } from "@/components/ui-kit";
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

const STARTERS = [
  "What are the three parts of Parliament?",
  "Explain the Charter simply",
  "Who represents the King in Canada?",
  "What does the knowledge test cover?",
];

const ANSWER_LANGS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "اردو" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh-Hans", label: "简体中文" },
  { code: "tl", label: "Tagalog" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
];
const RTL = new Set(["ur", "ar"]);

async function ask(question: string, lang: string, simple: boolean): Promise<Message> {
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
      answer: e instanceof Error && e.message ? e.message : "Couldn't reach the assistant. Check your connection.",
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
    const reply = await ask(text, opts?.lang ?? answerLang, !!opts?.simple);
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
      <AppHeader title="ASSISTANT" subtitle={t("studyAssistant")} />

      <Panel className="mb-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Eyebrow>AI study assistant</Eyebrow>
          <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
            Source-grounded
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-pretty">
          Answers are written by AI using only this app's study material, with sources shown. AI can still make
          mistakes — check important details on the official Government of Canada pages. Not legal or immigration
          advice.
        </p>
        <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          Answer language
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="min-h-10 flex-1 rounded-lg bg-surface px-3 text-sm text-foreground ring-1 ring-line/10"
          >
            <option value="app">My app language</option>
            {ANSWER_LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </Panel>

      <Panel delay={80} className="mb-4">
        {messages.length === 0 && (
          <div className="mb-3">
            <p className="mb-2 text-xs text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="min-h-10 rounded-full bg-line/5 px-3 py-2 text-xs ring-1 ring-line/10"
                >
                  {s}
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
              <div key={i} className="space-y-2" dir={RTL.has(answerLang) ? "rtl" : undefined}>
                <div
                  className={`rounded-2xl rounded-ss-sm p-4 text-sm text-pretty ${
                    m.status === "error" ? "bg-demo/10 text-demo" : "bg-surface"
                  }`}
                >
                  <p className="font-medium">{m.answer}</p>
                  {m.explanation && <p className="mt-2 text-muted-foreground">{m.explanation}</p>}
                  {m.whyItMatters && (
                    <p className="mt-2 text-xs">
                      <span className="text-accent">Why it matters for the test: </span>
                      {m.whyItMatters}
                    </p>
                  )}
                  {m.vocabulary && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="text-foreground">Vocabulary: </span>
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
                        {s.lastVerifiedAt && ` · reviewed ${s.lastVerifiedAt}`}{" "}
                        {s.url && (
                          <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-accent underline">
                            Show source
                          </a>
                        )}
                      </p>
                      <p className={`mt-1 ${m.status === "answered" ? "text-verified" : "text-translated"}`}>
                        {m.status === "answered" ? "From approved app content" : "Not covered — see official page"}
                      </p>
                    </div>
                  ))}
                <div className="flex flex-wrap gap-2 text-xs" dir="ltr">
                  {m.status === "error" ? (
                    <button onClick={() => void send(m.question)} className="min-h-10 rounded-full bg-line/5 px-3 ring-1 ring-line/10">
                      Try again
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigator.clipboard?.writeText(`${m.answer}\n\n${m.explanation}`)}
                        className="min-h-10 rounded-full bg-line/5 px-3 ring-1 ring-line/10"
                      >
                        Copy
                      </button>
                      <button onClick={() => void send(m.question, { lang: "en", simple: true })} className="min-h-10 rounded-full bg-line/5 px-3 ring-1 ring-line/10">
                        Simple English
                      </button>
                      <button onClick={() => void send(m.question, { lang: "fr" })} className="min-h-10 rounded-full bg-line/5 px-3 ring-1 ring-line/10">
                        En français
                      </button>
                      <button
                        aria-pressed={m.feedback === "up"}
                        onClick={() => setFeedback(i, "up")}
                        className={`min-h-10 rounded-full px-3 ring-1 ring-line/10 ${m.feedback === "up" ? "bg-accent/20 text-accent" : "bg-line/5"}`}
                      >
                        Helpful
                      </button>
                      <button
                        aria-pressed={m.feedback === "down"}
                        onClick={() => setFeedback(i, "down")}
                        className={`min-h-10 rounded-full px-3 ring-1 ring-line/10 ${m.feedback === "down" ? "bg-demo/20 text-demo" : "bg-line/5"}`}
                      >
                        Not helpful
                      </button>
                    </>
                  )}
                </div>
              </div>
            ),
          )}
          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-accent" /> Checking the study material…
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
            aria-label="Your question"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Ask about the study material…"
            className="max-h-32 min-h-12 min-w-0 resize-none rounded-2xl bg-surface px-4 py-3 text-base ring-1 ring-line/10 placeholder:text-muted-foreground"
          />
          <button
            disabled={loading || input.trim().length < 2}
            className="min-h-12 shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
          >
            {t("send")}
          </button>
        </form>
        <p className="mt-1 text-end text-[10px] text-muted-foreground">{input.length}/500</p>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="mt-2 min-h-10 rounded-full bg-line/5 px-3 text-xs ring-1 ring-line/10"
          >
            {t("clearChat")}
          </button>
        )}

        <ReportIssue label="Report an incorrect answer" />
      </Panel>
    </AppShell>
  );
}
