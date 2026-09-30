/**
 * Lightweight, dependency-free language detection for short learner questions.
 * Script-based for non-Latin languages; stop-word scoring for Latin-script ones.
 * Returns null when confidence is low so the UI can ask the user to choose.
 */
export type DetectedLang =
  | "en" | "fr" | "es" | "de" | "pt" | "tl"
  | "ar" | "ur" | "pa" | "hi" | "zh-Hans" | "zh-Hant";

export type Detection = { lang: DetectedLang | null; confidence: number; mixed: boolean };

const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

// Characters that differ between Simplified and Traditional Chinese (common subset).
const SIMP = "们这个来时说为国对学会发经过还进种样让从动长问题书车门见关开东马鸟语话认识读写买卖钱电脑议员选举权联邦总领导历史";
const TRAD = "們這個來時說為國對學會發經過還進種樣讓從動長問題書車門見關開東馬鳥語話認識讀寫買賣錢電腦議員選舉權聯邦總領導歷史";

const STOPWORDS: Record<"en" | "fr" | "es" | "de" | "pt" | "tl", string[]> = {
  en: ["the", "what", "who", "is", "are", "of", "and", "how", "why", "does", "which", "in", "canada's", "do", "explain", "when"],
  fr: ["le", "la", "les", "est", "qui", "que", "quel", "quelle", "quels", "des", "du", "et", "pourquoi", "comment", "sont", "une", "au", "expliquez"],
  es: ["el", "los", "las", "es", "qué", "quién", "cuál", "cuáles", "del", "y", "por", "cómo", "son", "una", "significa", "explica"],
  de: ["der", "die", "das", "ist", "wer", "was", "welche", "und", "wie", "warum", "sind", "ein", "eine", "von", "erkläre", "kanadas"],
  pt: ["o", "os", "as", "é", "quem", "qual", "quais", "do", "da", "e", "por", "como", "são", "uma", "significa", "explique", "não"],
  tl: ["ang", "ng", "mga", "sino", "ano", "ay", "sa", "at", "bakit", "paano", "kailan", "ba", "po", "ipaliwanag"],
};

export function detectLanguage(text: string): Detection {
  const s = text.trim();
  const letters = count(s, /\p{L}/gu) || 1;

  const han = count(s, /\p{Script=Han}/gu);
  const arabic = count(s, /\p{Script=Arabic}/gu);
  const guru = count(s, /\p{Script=Gurmukhi}/gu);
  const deva = count(s, /\p{Script=Devanagari}/gu);
  const latin = count(s, /\p{Script=Latin}/gu);

  const scripts = [han, arabic, guru, deva, latin].filter((n) => n / letters > 0.15).length;
  const mixed = scripts > 1;

  if (han / letters > 0.3) {
    let simp = 0, trad = 0;
    for (const ch of s) {
      if (SIMP.includes(ch)) simp++;
      if (TRAD.includes(ch)) trad++;
    }
    if (simp === trad) return { lang: null, confidence: 0.4, mixed };
    return { lang: simp > trad ? "zh-Hans" : "zh-Hant", confidence: 0.85, mixed };
  }
  if (arabic / letters > 0.3) {
    // Urdu-specific letters: ٹ ڈ ڑ ں ے ہ ک گ پ چ (last four also Persian) — ے ں ٹ ڈ ڑ are strong signals.
    const urdu = count(s, /[ٹڈڑںےۓہھ]/g);
    return { lang: urdu > 0 ? "ur" : "ar", confidence: urdu > 0 ? 0.9 : 0.8, mixed };
  }
  if (guru / letters > 0.3) return { lang: "pa", confidence: 0.95, mixed };
  if (deva / letters > 0.3) return { lang: "hi", confidence: 0.9, mixed };

  if (latin / letters > 0.5) {
    const words = s.toLowerCase().split(/[^\p{L}']+/u).filter(Boolean);
    const scores = (Object.keys(STOPWORDS) as (keyof typeof STOPWORDS)[]).map((l) => {
      let n = words.filter((w) => STOPWORDS[l].includes(w)).length;
      if (l === "fr" && /[àâçèêëîïôûœ]/.test(s)) n += 1;
      if (l === "es" && /[ñ¿¡]/.test(s)) n += 2;
      if (l === "de" && /[äöüß]/.test(s)) n += 2;
      if (l === "pt" && /[ãõ]|ção/.test(s)) n += 2;
      return { l, n };
    });
    scores.sort((a, b) => b.n - a.n);
    const [top, second] = scores;
    if (!top || top.n === 0) return { lang: null, confidence: 0.2, mixed };
    const margin = top.n - (second?.n ?? 0);
    if (margin === 0) return { lang: null, confidence: 0.4, mixed };
    return { lang: top.l, confidence: Math.min(0.95, 0.5 + margin * 0.15), mixed };
  }
  return { lang: null, confidence: 0, mixed };
}
