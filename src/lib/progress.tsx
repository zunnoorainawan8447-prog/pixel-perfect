import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Attempt = {
  questionId: string;
  correct: boolean;
  at: number;
};

export type ExamResult = {
  id: string;
  at: number;
  total: number;
  correct: number;
  questionIds: string[];
  wrongIds: string[];
  timed: boolean;
};

export type ExamInProgress = {
  questionIds: string[];
  answers: Record<string, number>;
  index: number;
  endsAt: number | null;
  timed: boolean;
} | null;

type State = {
  attempts: Attempt[];
  completedSections: string[];
  bookmarkedQuestions: string[];
  bookmarkedSections: string[];
  exams: ExamResult[];
  activeExam: ExamInProgress;
  dailyGoal: number;
  lastStudiedTopicId: string | null;
};

const DEFAULTS: State = {
  attempts: [],
  completedSections: [],
  bookmarkedQuestions: [],
  bookmarkedSections: [],
  exams: [],
  activeExam: null,
  dailyGoal: 10,
  lastStudiedTopicId: null,
};

const KEY = "cp.progress.v1";

type Ctx = State & {
  hydrated: boolean;
  recordAttempt: (questionId: string, correct: boolean) => void;
  toggleSectionComplete: (sectionId: string) => void;
  toggleQuestionBookmark: (questionId: string) => void;
  toggleSectionBookmark: (sectionId: string) => void;
  saveExam: (result: ExamResult) => void;
  setActiveExam: (exam: ExamInProgress) => void;
  clearProgress: () => void;
  recordStudyVisit: (topicId: string) => void;
  answeredToday: number;
  accuracy: number;
  wrongQuestionIds: string[];
};

const ProgressContext = createContext<Ctx | null>(null);

function isToday(ts: number) {
  const d = new Date(ts);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<Ctx>(() => {
    const attempts = state.attempts;
    const correct = attempts.filter((a) => a.correct).length;
    const latestByQuestion = new Map<string, Attempt>();
    for (const a of attempts) latestByQuestion.set(a.questionId, a);

    return {
      ...state,
      hydrated,
      answeredToday: attempts.filter((a) => isToday(a.at)).length,
      accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
      wrongQuestionIds: [...latestByQuestion.values()].filter((a) => !a.correct).map((a) => a.questionId),
      recordAttempt: (questionId, isCorrect) =>
        setState((s) => ({ ...s, attempts: [...s.attempts, { questionId, correct: isCorrect, at: Date.now() }] })),
      toggleSectionComplete: (id) =>
        setState((s) => ({ ...s, completedSections: toggle(s.completedSections, id) })),
      toggleQuestionBookmark: (id) =>
        setState((s) => ({ ...s, bookmarkedQuestions: toggle(s.bookmarkedQuestions, id) })),
      toggleSectionBookmark: (id) =>
        setState((s) => ({ ...s, bookmarkedSections: toggle(s.bookmarkedSections, id) })),
      saveExam: (result) => setState((s) => ({ ...s, exams: [result, ...s.exams].slice(0, 20), activeExam: null })),
      setActiveExam: (exam) => setState((s) => ({ ...s, activeExam: exam })),
      clearProgress: () => setState({ ...DEFAULTS }),
      recordStudyVisit: (topicId) =>
        setState((s) => (s.lastStudiedTopicId === topicId ? s : { ...s, lastStudiedTopicId: topicId })),
    };
  }, [state, hydrated]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
