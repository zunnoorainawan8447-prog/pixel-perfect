import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { answerQuestion } from "@/lib/assistant.server";

const Body = z.object({
  question: z.string().trim().min(2).max(500),
  lang: z.enum([
    "en",
    "de",
    "fr",
    "es",
    "it",
    "pl",
    "nl",
    "pt",
    "ro",
    "hu",
    "cs",
    "sk",
    "bg",
    "hr",
    "sr",
    "sl",
    "bs",
    "sq",
    "el",
    "tr",
    "ru",
    "uk",
    "sv",
    "no",
    "da",
    "fi",
    "et",
    "lv",
    "lt",
    "ga",
    "gd",
    "cy",
    "ca",
    "eu",
    "gl",
    "mt",
    "lb",
    "is",
    "mk",
    "ar",
  ]),
  simple: z.boolean().optional(),
});

// Best-effort per-instance rate limit: 8 requests / minute, 60 / day per client.
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 86_400_000);
  const lastMinute = list.filter((t) => now - t < 60_000).length;
  if (lastMinute >= 8 || list.length >= 60) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for") ??
          "anon";
        if (limited(ip))
          return json(
            { error: "You're asking quickly — please wait a minute and try again." },
            429,
          );

        let parsed;
        try {
          parsed = Body.safeParse(await request.json());
        } catch {
          return json({ error: "Invalid request." }, 400);
        }
        if (!parsed.success)
          return json({ error: "Please ask a question between 2 and 500 characters." }, 400);

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return json({ error: "The assistant isn't configured yet." }, 503);

        try {
          const result = await answerQuestion(
            parsed.data.question,
            parsed.data.lang,
            !!parsed.data.simple,
            key,
          );
          return json(result);
        } catch (e) {
          const status = (e as { status?: number }).status;
          console.error("assistant error", status, e);
          if (status === 429)
            return json({ error: "The assistant is busy. Please try again shortly." }, 429);
          if (status === 402 || status === 403)
            return json({ error: "The assistant is temporarily unavailable." }, 503);
          return json({ error: "Something went wrong. Please try again." }, 502);
        }
      },
    },
  },
});
