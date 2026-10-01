/**
 * Generated question bank for CITIZEN PREP — 1,500 questions.
 * Chunked into src/lib/questions/* because a single file exceeds transport limits.
 * Source: ~/workspace/citizen-prep/questions/*.json (researched from Discover Canada).
 * DO NOT EDIT BY HAND — regenerate from the JSON bank.
 */
import type { Question } from "./content";
import { citizenshipA } from "./questions/citizenship-a";
import { citizenshipB } from "./questions/citizenship-b";
import { economyA } from "./questions/economy-a";
import { economyB } from "./questions/economy-b";
import { geographyA } from "./questions/geography-a";
import { geographyB } from "./questions/geography-b";
import { governmentA } from "./questions/government-a";
import { governmentB } from "./questions/government-b";
import { historyA } from "./questions/history-a";
import { historyB } from "./questions/history-b";
import { peopleA } from "./questions/people-a";
import { peopleB } from "./questions/people-b";
import { rightsA } from "./questions/rights-a";
import { rightsB } from "./questions/rights-b";
import { symbolsA } from "./questions/symbols-a";
import { symbolsB } from "./questions/symbols-b";

export const QUESTIONS: Question[] = [
  ...citizenshipA,
  ...citizenshipB,
  ...economyA,
  ...economyB,
  ...geographyA,
  ...geographyB,
  ...governmentA,
  ...governmentB,
  ...historyA,
  ...historyB,
  ...peopleA,
  ...peopleB,
  ...rightsA,
  ...rightsB,
  ...symbolsA,
  ...symbolsB,
];
