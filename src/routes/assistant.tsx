import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, AppShell, Eyebrow, Panel, ReportIssue, StatusPill } from "@/components/ui-kit";
import { QUESTIONS, TOPICS, OFFICIAL_LINKS } from "@/lib/content";
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
          "Ask questions about the study material and get plain-language answers with the source shown. Demo responses in this prototype.",
      },
      { property: "og:title", content: "Study assistant — CITIZEN/PREP" },
      { property: "og:description", content: "Plain-language answers grounded in this app's approved study content." },
    ],
  }),
  component: AssistantPage,
});

type Message = {
  role: "user" | "assistant";
  text: string;
  sourceTitle?: string | undefined;
  sourceUrl?: string | undefined;
  grounded: boolean;
};

const STARTERS = [
  "What are the three parts of Parliament?",
  "Explain the Charter simply",
  "Who represents the King in Canada?",
  "What does the knowledge test cover?",
];

/**
 * Local, offline demo answering. It only answers from the app's own content —
 * never invents facts, and says so when it has no grounded passage.
 *
 * Replace this with a server function that calls a model with retrieval over
 * the same content collection; the API key must stay server-side.
 */
function demoAnswer(input: string): Message {
  const text = input.toLowerCase();
  const words = text.split(/[^a-z]+/).filter((w) => w.length > 3);

  let best: { score: number; answer: string; title: string; url?: string | undefined } | null = null;

  for (const topic of TOPICS) {
    for (const section of topic.sections) {
      const hay = `${section.title.en} ${section.body.map((b) => b.en).join(" ")}`.toLowerCase();
      const score = words.filter((w) => hay.includes(w)).length;
      if (score > 0 && (!best || score > best.score)) {
        best = {
          score,
          answer: section.body.map((b) => b.en).join(" "),
          title: `${topic.title.en} — ${section.title.en}`,
          url: topic.source.sourceUrl,
        };
      }
    }
  }

  for (const q of QUESTIONS) {
    const hay = `${q.prompt.en} ${q.explanation.en}`.toLowerCase();
    const score = words.filter((w) => hay.includes(w)).length + 1;
    if (score > 1 && (!best || score > best.score)) {
      best = {
        score,
        answer: `${q.options[q.answerIndex]!.en}. ${q.explanation.en}`,
        title: q.source.sourceTitle,
        url: q.source.sourceUrl,
      };
    }
  }

  if (!best) {
    return {
      role: "assistant",
      grounded: false,
      text: "I don't have approved study material covering that, so I won't guess. Try rephrasing, or check the official Government of Canada citizenship pages. I can't give legal or immigration advice — for a personal case, contact IRCC or a qualified professional.",
      sourceTitle: "Government of Canada — citizenship test",
      sourceUrl: OFFICIAL_LINKS.test,
    };
  }

  return {
    role: "assistant",
    grounded: true,
    text: `Short answer: ${best.answer}\n\nWhy this matters: questions on this appear in the knowledge test, so it helps to remember the key terms.`,
    sourceTitle: best.title,
    sourceUrl: best.url,
  };
}

function AssistantPage() {
  const { q } = Route.useSearch();
  const { t } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  function send(value: string) {
    const text = value.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text, grounded: true }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [...m, demoAnswer(text)]);
      setLoading(false);
    }, 600);
  }

  useEffect(() => {
    if (q && !sentInitial.current) {
      sentInitial.current = true;
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <AppShell>
      <AppHeader title="ASSISTANT" subtitle={t("studyAssistant")} />

      <Panel className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Eyebrow>{t("studyAssistant")}</Eyebrow>
          <StatusPill status="demo" />
        </div>
        <p className="text-xs text-muted-foreground text-pretty">
          Demo mode: answers come from this app's own sample content, offline. No AI service is connected yet, and no
          answer is guaranteed accurate. Always confirm details on the official IRCC pages.
        </p>
      </Panel>

      <Panel delay={80} className="mb-4">
        {messages.length === 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full bg-line/5 px-3 py-1.5 text-xs ring-1 ring-line/10"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ms-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-3 text-sm text-accent-foreground">
                {m.text}
              </div>
            ) : (
              <div key={i} className="space-y-2">
                <div className="max-w-[92%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-surface p-4 text-sm text-pretty">
                  {m.text}
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-line/5 p-3 ring-1 ring-line/10">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-line/5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground ring-1 ring-line/10">
                    Src
                  </span>
                  <p className="min-w-0 text-xs text-muted-foreground">
                    {m.sourceTitle}{" "}
                    {m.sourceUrl && (
                      <a href={m.sourceUrl} target="_blank" rel="noreferrer noopener" className="text-accent underline">
                        open
                      </a>
                    )}{" "}
                    · <span className={m.grounded ? "text-verified" : "text-translated"}>
                      {m.grounded ? "From app content" : "Not covered in app content"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => navigator.clipboard?.writeText(m.text)}
                    className="rounded-full bg-line/5 px-3 py-1.5 ring-1 ring-line/10"
                  >
                    Copy answer
                  </button>
                  <button className="rounded-full bg-line/5 px-3 py-1.5 ring-1 ring-line/10">👍 Helpful</button>
                  <button className="rounded-full bg-line/5 px-3 py-1.5 ring-1 ring-line/10">👎 Not helpful</button>
                </div>
              </div>
            ),
          )}
          {loading && <p className="text-sm text-muted-foreground">Looking through the study material…</p>}
          <div ref={bottom} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the study material…"
            className="min-w-0 rounded-full bg-surface px-4 py-3 text-sm ring-1 ring-line/10 placeholder:text-muted-foreground"
          />
          <button className="shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground">
            {t("send")}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMessages([])}
            className="rounded-full bg-line/5 px-3 py-1.5 text-xs ring-1 ring-line/10"
          >
            {t("clearChat")}
          </button>
        </div>

        <ReportIssue label="Report an incorrect answer" />
      </Panel>
    </AppShell>
  );
}
