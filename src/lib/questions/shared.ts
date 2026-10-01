/**
 * Shared source helper for the chunked question bank.
 * Part of questions.generated.ts — do not edit by hand.
 */

const guideUrl =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/study-guide.html";

export function src(chapter: string) {
  return {
    sourceTitle: `Discover Canada \u2014 ${chapter} (paraphrased)`,
    sourceUrl: guideUrl,
    lastVerifiedAt: "2026-10-01",
    originalLanguage: "en" as const,
    contentStatus: "paraphrased" as const,
  };
}
