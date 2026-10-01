/**
 * Study content, question bank metadata, languages and shared types for CITIZEN/PREP.
 *
 * Study topics: paraphrased from the official IRCC "Discover Canada" study guide
 * (see src/lib/study-topics.ts). Question bank: 1,500 original practice questions
 * grounded in Discover Canada (see src/lib/questions.generated.ts).
 *
 * IMPORTANT: nothing here is an official IRCC exam question. Each item carries
 * provenance metadata. This is an independent study tool, not affiliated with
 * or endorsed by the Government of Canada or IRCC.
 */

export type LangCode =
  | "en"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "pl"
  | "nl"
  | "pt"
  | "ro"
  | "hu"
  | "cs"
  | "sk"
  | "bg"
  | "hr"
  | "sr"
  | "sl"
  | "bs"
  | "sq"
  | "el"
  | "tr"
  | "ru"
  | "uk"
  | "sv"
  | "no"
  | "da"
  | "fi"
  | "et"
  | "lv"
  | "lt"
  | "ga"
  | "gd"
  | "cy"
  | "ca"
  | "eu"
  | "gl"
  | "mt"
  | "lb"
  | "is"
  | "mk"
  | "ar";

export type TranslationStatus = "reviewed" | "machine" | "unavailable";
export type ContentStatus = "demo" | "verified-source" | "paraphrased";

export type Language = {
  code: LangCode;
  endonym: string;
  englishName: string;
  rtl?: boolean;
  /** Interface translation availability */
  ui: TranslationStatus;
  /** Study content translation availability */
  study: TranslationStatus;
};

export const LANGUAGES: Language[] = [
  { code: "en", endonym: "English", englishName: "English", ui: "reviewed", study: "reviewed" },
  { code: "de", endonym: "Deutsch", englishName: "German", ui: "machine", study: "machine" },
  { code: "fr", endonym: "Français", englishName: "French", ui: "reviewed", study: "reviewed" },
  { code: "es", endonym: "Español", englishName: "Spanish", ui: "machine", study: "machine" },
  { code: "it", endonym: "Italiano", englishName: "Italian", ui: "machine", study: "machine" },
  { code: "pl", endonym: "Polski", englishName: "Polish", ui: "machine", study: "machine" },
  { code: "nl", endonym: "Nederlands", englishName: "Dutch", ui: "machine", study: "machine" },
  { code: "pt", endonym: "Português", englishName: "Portuguese", ui: "machine", study: "machine" },
  { code: "ro", endonym: "Română", englishName: "Romanian", ui: "machine", study: "machine" },
  { code: "hu", endonym: "Magyar", englishName: "Hungarian", ui: "machine", study: "machine" },
  { code: "cs", endonym: "Čeština", englishName: "Czech", ui: "machine", study: "machine" },
  { code: "sk", endonym: "Slovenčina", englishName: "Slovak", ui: "machine", study: "machine" },
  { code: "bg", endonym: "Български", englishName: "Bulgarian", ui: "machine", study: "machine" },
  { code: "hr", endonym: "Hrvatski", englishName: "Croatian", ui: "machine", study: "machine" },
  { code: "sr", endonym: "Српски", englishName: "Serbian", ui: "machine", study: "machine" },
  { code: "sl", endonym: "Slovenščina", englishName: "Slovenian", ui: "machine", study: "machine" },
  { code: "bs", endonym: "Bosanski", englishName: "Bosnian", ui: "machine", study: "machine" },
  { code: "sq", endonym: "Shqip", englishName: "Albanian", ui: "machine", study: "machine" },
  { code: "el", endonym: "Ελληνικά", englishName: "Greek", ui: "machine", study: "machine" },
  { code: "tr", endonym: "Türkçe", englishName: "Turkish", ui: "machine", study: "machine" },
  { code: "ru", endonym: "Русский", englishName: "Russian", ui: "machine", study: "machine" },
  { code: "uk", endonym: "Українська", englishName: "Ukrainian", ui: "machine", study: "machine" },
  { code: "sv", endonym: "Svenska", englishName: "Swedish", ui: "machine", study: "machine" },
  { code: "no", endonym: "Norsk", englishName: "Norwegian", ui: "machine", study: "machine" },
  { code: "da", endonym: "Dansk", englishName: "Danish", ui: "machine", study: "machine" },
  { code: "fi", endonym: "Suomi", englishName: "Finnish", ui: "machine", study: "machine" },
  { code: "et", endonym: "Eesti", englishName: "Estonian", ui: "machine", study: "machine" },
  { code: "lv", endonym: "Latviešu", englishName: "Latvian", ui: "machine", study: "machine" },
  { code: "lt", endonym: "Lietuvių", englishName: "Lithuanian", ui: "machine", study: "machine" },
  { code: "ga", endonym: "Gaeilge", englishName: "Irish", ui: "machine", study: "machine" },
  {
    code: "gd",
    endonym: "Gàidhlig",
    englishName: "Scottish Gaelic",
    ui: "machine",
    study: "machine",
  },
  { code: "cy", endonym: "Cymraeg", englishName: "Welsh", ui: "machine", study: "machine" },
  { code: "ca", endonym: "Català", englishName: "Catalan", ui: "machine", study: "machine" },
  { code: "eu", endonym: "Euskara", englishName: "Basque", ui: "machine", study: "machine" },
  { code: "gl", endonym: "Galego", englishName: "Galician", ui: "machine", study: "machine" },
  { code: "mt", endonym: "Malti", englishName: "Maltese", ui: "machine", study: "machine" },
  {
    code: "lb",
    endonym: "Lëtzebuergesch",
    englishName: "Luxembourgish",
    ui: "machine",
    study: "machine",
  },
  { code: "is", endonym: "Íslenska", englishName: "Icelandic", ui: "machine", study: "machine" },
  { code: "mk", endonym: "Македонски", englishName: "Macedonian", ui: "machine", study: "machine" },
  {
    code: "ar",
    endonym: "العربية",
    englishName: "Arabic",
    rtl: true,
    ui: "machine",
    study: "machine",
  },
];

export function getLanguage(code: LangCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]!;
}

/** A value that may be translated. `en` is always present. */
export type Localized = { en: string; fr?: string; [key: string]: string | undefined };

export function pick(value: Localized, lang: LangCode): { text: string; translated: boolean } {
  const v = value[lang];
  if (v) return { text: v, translated: lang !== "en" };
  return { text: value.en, translated: false };
}

export type SourceMeta = {
  sourceTitle: string;
  sourceUrl?: string;
  lastVerifiedAt: string;
  originalLanguage: LangCode;
  contentStatus: ContentStatus;
};

export type Section = {
  id: string;
  title: Localized;
  body: Localized[];
  vocabulary?: { term: Localized; meaning: Localized }[];
};

export type Topic = {
  id: string;
  title: Localized;
  intro: Localized;
  readingMinutes: number;
  sections: Section[];
  source: SourceMeta;
};

export type Question = {
  id: string;
  topicId: string;
  difficulty: "easy" | "medium" | "hard";
  prompt: Localized;
  options: Localized[];
  answerIndex: number;
  explanation: Localized;
  source: SourceMeta;
};

import { TOPICS as RAW_TOPICS } from "./study-topics";

/** Rich study content (paraphrased from IRCC Discover Canada). readingMinutes is computed from real word counts. */
function countWords(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function topicWordCount(t: {
  title: { en: string };
  intro: { en: string };
  sections: {
    title: { en: string };
    body: { en: string }[];
    vocabulary?: { term: { en: string }; meaning: { en: string } }[];
  }[];
}): number {
  let n = countWords(t.title.en) + countWords(t.intro.en);
  for (const s of t.sections) {
    n += countWords(s.title.en);
    for (const p of s.body) n += countWords(p.en);
    for (const v of s.vocabulary ?? []) n += countWords(v.term.en) + countWords(v.meaning.en);
  }
  return n;
}

export const TOPICS: Topic[] = (RAW_TOPICS as unknown as Topic[]).map((t) => ({
  ...t,
  readingMinutes: Math.max(1, Math.round(topicWordCount(t) / 200)),
}));

import { QUESTIONS } from "./questions.generated";
export { QUESTIONS };

export function questionsForTopic(topicId: string) {
  return QUESTIONS.filter((q) => q.topicId === topicId);
}

export function topicById(id: string) {
  return TOPICS.find((t) => t.id === id);
}

export function questionById(id: string) {
  return QUESTIONS.find((q) => q.id === id);
}

export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export const OFFICIAL_LINKS = {
  test: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/citizenship-test.html",
  guide:
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/study-guide.html",
};
