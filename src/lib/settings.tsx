import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLanguage, type LangCode } from "./content";
import { STRINGS, type StringKey } from "./strings.generated";

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
  /** Translate a UI string key in the current UI language, with {placeholder} interpolation. Falls back to English per-key. */
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
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

  function interpolate(template: string, vars?: Record<string, string | number>): string {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  }

  const value = useMemo<Ctx>(() => {
    const table = STRINGS as unknown as Record<string, Partial<Record<StringKey, string>>>;
    const dict = table[settings.uiLang] ?? table["en"] ?? {};
    const enDict = table["en"] ?? {};
    return {
      ...settings,
      hydrated,
      rtl: !!getLanguage(settings.uiLang).rtl,
      set: (patch) => setSettings((s) => ({ ...s, ...patch })),
      t: (key, vars) => interpolate(dict[key] ?? enDict[key] ?? key, vars),
    };
  }, [settings, hydrated]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
