/**
 * Regression tests for CITIZEN/PREP locked invariants:
 * - exactly 1,500 questions with exact topic/difficulty totals
 * - canonical 40-language system (no excluded codes, Arabic-only RTL)
 * - translation key/placeholder parity
 * - rich study topics with computed reading minutes
 */
import { describe, expect, it } from "vitest";
import { LANGUAGES, TOPICS, pick, questionById, questionsForTopic } from "./content";
import { QUESTIONS } from "./questions.generated";
import { STRINGS, type StringKey } from "./strings.generated";

const CANONICAL_CODES = [
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
];
const EXCLUDED = ["ur", "hi", "pa", "zh-Hans", "tl"];

const TOPIC_TOTALS: Record<string, number> = {
  history: 220,
  government: 220,
  rights: 180,
  geography: 180,
  symbols: 150,
  economy: 180,
  people: 200,
  citizenship: 170,
};

describe("question bank", () => {
  it("has exactly 1,500 questions", () => {
    expect(QUESTIONS).toHaveLength(1500);
  });

  it("matches exact topic totals", () => {
    const counts: Record<string, number> = {};
    for (const q of QUESTIONS) counts[q.topicId] = (counts[q.topicId] ?? 0) + 1;
    expect(counts).toEqual(TOPIC_TOTALS);
  });

  it("matches 40/35/25 difficulty split per topic (half-up rounding, medium takes remainder)", () => {
    const halfUp = (n: number) => Math.floor(n + 0.5);
    for (const [topicId, total] of Object.entries(TOPIC_TOTALS)) {
      const qs = QUESTIONS.filter((q) => q.topicId === topicId);
      const easy = qs.filter((q) => q.difficulty === "easy").length;
      const medium = qs.filter((q) => q.difficulty === "medium").length;
      const hard = qs.filter((q) => q.difficulty === "hard").length;
      const expEasy = halfUp(total * 0.4);
      const expHard = halfUp(total * 0.25);
      const expMedium = total - expEasy - expHard;
      expect([easy, medium, hard], topicId).toEqual([expEasy, expMedium, expHard]);
    }
  });

  it("every question has 4 options and a valid answerIndex", () => {
    for (const q of QUESTIONS) {
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex, q.id).toBeLessThan(4);
      expect(q.prompt.en.length, q.id).toBeGreaterThan(0);
      expect(q.explanation.en.length, q.id).toBeGreaterThan(0);
    }
  });

  it("IDs are unique and every question is retrievable", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(1500);
    for (const q of QUESTIONS.slice(0, 20)) {
      expect(questionById(q.id)?.id).toBe(q.id);
    }
  });

  it("questionsForTopic returns the right topic questions", () => {
    for (const [topicId, total] of Object.entries(TOPIC_TOTALS)) {
      expect(questionsForTopic(topicId)).toHaveLength(total);
    }
  });

  it("has no duplicate question stems", () => {
    const stems = QUESTIONS.map((q) => q.prompt.en.trim().toLowerCase());
    expect(new Set(stems).size).toBe(1500);
  });
});

describe("canonical 40-language system", () => {
  it("has exactly the 40 canonical languages in order", () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(CANONICAL_CODES);
  });

  it("contains no excluded language codes", () => {
    const codes = LANGUAGES.map((l) => l.code);
    for (const bad of EXCLUDED) expect(codes).not.toContain(bad);
  });

  it("only Arabic is RTL", () => {
    const rtl = LANGUAGES.filter((l) => l.rtl).map((l) => l.code);
    expect(rtl).toEqual(["ar"]);
  });

  it("marks en/fr reviewed and the rest machine-translated", () => {
    for (const l of LANGUAGES) {
      if (l.code === "en" || l.code === "fr") {
        expect(l.ui).toBe("reviewed");
      } else {
        expect(l.ui).toBe("machine");
      }
    }
  });

  it("every language has a non-empty endonym", () => {
    for (const l of LANGUAGES) expect(l.endonym.length).toBeGreaterThan(0);
  });
});

describe("translation strings", () => {
  const table = STRINGS as Record<string, Record<StringKey, string>>;
  const dictFor = (code: string): Record<StringKey, string> => {
    const d = table[code];
    if (!d) throw new Error(`missing language table: ${code}`);
    return d;
  };
  const keys = Object.keys(dictFor("en")) as StringKey[];

  it("has all 40 languages", () => {
    expect(Object.keys(STRINGS)).toHaveLength(40);
  });

  it("every language has exactly the same keys", () => {
    for (const code of CANONICAL_CODES) {
      expect(Object.keys(dictFor(code)).sort(), code).toEqual([...keys].sort());
    }
  });

  it("placeholders are preserved verbatim in every language (order may vary by grammar)", () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of keys) {
      const expected = ph(dictFor("en")[key]);
      if (expected.length === 0) continue;
      for (const code of CANONICAL_CODES) {
        expect(ph(dictFor(code)[key]), `${code}.${key}`).toEqual(expected);
      }
    }
  });

  it("no string still references excluded languages", () => {
    const blob = JSON.stringify(STRINGS);
    for (const bad of ["Urdu", "Hindi", "Punjabi", "Tagalog"]) {
      expect(blob).not.toContain(bad);
    }
  });
});

describe("study topics", () => {
  it("has 8 topics matching the question bank", () => {
    expect(TOPICS.map((t) => t.id).sort()).toEqual(Object.keys(TOPIC_TOTALS).sort());
  });

  it("has 62 sections with unique IDs", () => {
    const sectionIds = TOPICS.flatMap((t) => t.sections.map((s) => s.id));
    expect(sectionIds).toHaveLength(62);
    expect(new Set(sectionIds).size).toBe(62);
  });

  it("computes a positive reading time per topic", () => {
    for (const t of TOPICS) {
      expect(t.readingMinutes, t.id).toBeGreaterThan(0);
      expect(Number.isInteger(t.readingMinutes), t.id).toBe(true);
    }
  });

  it("every section has body content", () => {
    for (const t of TOPICS) {
      for (const s of t.sections) {
        expect(s.body.length, s.id).toBeGreaterThan(0);
        expect(s.body[0]!.en.length, s.id).toBeGreaterThan(0);
      }
    }
  });

  it("pick() falls back to English for missing translations", () => {
    const loc = { en: "Hello" };
    expect(pick(loc, "de")).toEqual({ text: "Hello", translated: false });
    expect(pick({ en: "Hello", de: "Hallo" }, "de")).toEqual({ text: "Hallo", translated: true });
    expect(pick({ en: "Hello", de: "Hallo" }, "fr")).toEqual({ text: "Hello", translated: false });
  });
});
