import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLanguage, type LangCode } from "./content";

export type TextSize = "normal" | "large" | "xlarge";

type Settings = {
  uiLang: LangCode;
  studyLang: LangCode;
  textSize: TextSize;
  onboarded: boolean;
};

const DEFAULTS: Settings = {
  uiLang: "en",
  studyLang: "en",
  textSize: "normal",
  onboarded: false,
};

const KEY = "cp.settings.v1";

type Ctx = Settings & {
  set: (patch: Partial<Settings>) => void;
  t: (key: keyof typeof STRINGS.en) => string;
  rtl: boolean;
  hydrated: boolean;
};

const SettingsContext = createContext<Ctx | null>(null);

const SIZE_MAP: Record<TextSize, string> = {
  normal: "100%",
  large: "112%",
  xlarge: "125%",
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(settings));
    document.documentElement.style.setProperty("--app-font-size", SIZE_MAP[settings.textSize]);
    document.documentElement.lang = settings.uiLang;
    document.documentElement.dir = getLanguage(settings.uiLang).rtl ? "rtl" : "ltr";
  }, [settings, hydrated]);

  const value = useMemo<Ctx>(() => {
    const dict = STRINGS[settings.uiLang as keyof typeof STRINGS] ?? STRINGS.en;
    return {
      ...settings,
      hydrated,
      rtl: !!getLanguage(settings.uiLang).rtl,
      set: (patch) => setSettings((s) => ({ ...s, ...patch })),
      t: (key) => (dict as Record<string, string>)[key] ?? STRINGS.en[key],
    };
  }, [settings, hydrated]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}

/**
 * Interface strings. Only languages with a reviewed/machine UI translation are
 * listed here; everything else falls back to English (see LANGUAGES in content.ts).
 */
export const STRINGS = {
  en: {
    home: "Home",
    topics: "Topics",
    practice: "Practice",
    exam: "Exam",
    assistant: "Assistant",
    more: "More",
    continueLearning: "Continue learning",
    continue: "Continue",
    dailyGoal: "Daily goal",
    bookmarks: "Bookmarks",
    savedForReview: "saved for review",
    questionsToday: "questions today",
    practiceQuestion: "Practice question",
    checkAnswer: "Check answer",
    nextQuestion: "Next question",
    correct: "Correct",
    incorrect: "Not quite",
    mockExam: "Mock exam",
    startExam: "Start exam",
    studyAssistant: "Study assistant",
    demoResponse: "Demo response",
    verified: "Verified",
    machineTranslated: "Machine-translated",
    notOfficial: "Independent study tool · not official",
    disclaimer:
      "CITIZEN/PREP is an independent study aid. Not affiliated with or endorsed by the Government of Canada or IRCC. It cannot guarantee a passing result.",
    progress: "Progress",
    settings: "Settings",
    reportIssue: "Report an issue",
    source: "Source",
    reviewed: "Reviewed",
    markComplete: "Mark as completed",
    completed: "Completed",
    bookmark: "Bookmark",
    bookmarked: "Bookmarked",
    askAi: "Ask the assistant about this section",
    minRead: "min read",
    wrongAnswers: "Review mistakes",
    retry: "Retry",
    send: "Send",
    clearChat: "Clear chat",
  },
  fr: {
    home: "Accueil",
    topics: "Sujets",
    practice: "Pratique",
    exam: "Examen",
    assistant: "Assistant",
    more: "Plus",
    continueLearning: "Poursuivre l'apprentissage",
    continue: "Continuer",
    dailyGoal: "Objectif du jour",
    bookmarks: "Favoris",
    savedForReview: "enregistrés à revoir",
    questionsToday: "questions aujourd'hui",
    practiceQuestion: "Question de pratique",
    checkAnswer: "Vérifier la réponse",
    nextQuestion: "Question suivante",
    correct: "Bonne réponse",
    incorrect: "Pas tout à fait",
    mockExam: "Examen blanc",
    startExam: "Commencer l'examen",
    studyAssistant: "Assistant d'étude",
    demoResponse: "Réponse de démonstration",
    verified: "Vérifié",
    machineTranslated: "Traduction automatique",
    notOfficial: "Outil d'étude indépendant · non officiel",
    disclaimer:
      "CITIZEN/PREP est un outil d'étude indépendant. Sans affiliation ni approbation du gouvernement du Canada ou d'IRCC. Aucune réussite n'est garantie.",
    progress: "Progrès",
    settings: "Paramètres",
    reportIssue: "Signaler un problème",
    source: "Source",
    reviewed: "Révisé",
    markComplete: "Marquer comme terminé",
    completed: "Terminé",
    bookmark: "Ajouter aux favoris",
    bookmarked: "Dans les favoris",
    askAi: "Poser une question sur cette section",
    minRead: "min de lecture",
    wrongAnswers: "Revoir les erreurs",
    retry: "Réessayer",
    send: "Envoyer",
    clearChat: "Effacer la conversation",
  },
  es: {
    home: "Inicio",
    topics: "Temas",
    practice: "Práctica",
    exam: "Examen",
    assistant: "Asistente",
    more: "Más",
    continueLearning: "Continuar aprendiendo",
    continue: "Continuar",
    dailyGoal: "Meta diaria",
    bookmarks: "Guardados",
    savedForReview: "guardados para repasar",
    questionsToday: "preguntas hoy",
    practiceQuestion: "Pregunta de práctica",
    checkAnswer: "Comprobar respuesta",
    nextQuestion: "Siguiente pregunta",
    correct: "Correcto",
    incorrect: "Casi",
    mockExam: "Examen simulado",
    startExam: "Comenzar examen",
    studyAssistant: "Asistente de estudio",
    demoResponse: "Respuesta de demostración",
    verified: "Verificado",
    machineTranslated: "Traducción automática",
    notOfficial: "Herramienta de estudio independiente · no oficial",
    disclaimer:
      "CITIZEN/PREP es una ayuda de estudio independiente. Sin afiliación ni respaldo del Gobierno de Canadá ni de IRCC. No garantiza aprobar el examen.",
    progress: "Progreso",
    settings: "Ajustes",
    reportIssue: "Informar de un problema",
    source: "Fuente",
    reviewed: "Revisado",
    markComplete: "Marcar como completado",
    completed: "Completado",
    bookmark: "Guardar",
    bookmarked: "Guardado",
    askAi: "Preguntar al asistente sobre esta sección",
    minRead: "min de lectura",
    wrongAnswers: "Repasar errores",
    retry: "Reintentar",
    send: "Enviar",
    clearChat: "Borrar conversación",
  },
} as const;
