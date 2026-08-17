import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type GovTheme = "light" | "dark" | "contrast";
export type FontSize = "sm" | "md" | "lg";
export type Language = "en" | "hi";

interface GovThemeContextValue {
  theme: GovTheme;
  fontSize: FontSize;
  language: Language;
  setTheme: (t: GovTheme) => void;
  setFontSize: (f: FontSize) => void;
  setLanguage: (l: Language) => void;
}

const GovThemeContext = createContext<GovThemeContextValue>({
  theme: "light",
  fontSize: "md",
  language: "en",
  setTheme: () => {},
  setFontSize: () => {},
  setLanguage: () => {},
});

const FONT_SIZE_MAP: Record<FontSize, string> = { sm: "14px", md: "16px", lg: "18px" };

export function GovThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<GovTheme>(
    () => (localStorage.getItem("gov_theme") as GovTheme) || "light"
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(
    () => (localStorage.getItem("gov_font") as FontSize) || "md"
  );
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem("gov_lang") as Language) || "en"
  );

  const setTheme = (t: GovTheme) => { setThemeState(t); localStorage.setItem("gov_theme", t); };
  const setFontSize = (f: FontSize) => { setFontSizeState(f); localStorage.setItem("gov_font", f); };
  const setLanguage = (l: Language) => { setLanguageState(l); localStorage.setItem("gov_lang", l); };

  useEffect(() => {
    const root = document.getElementById("gov-portal-root");
    if (!root) return;
    root.setAttribute("data-gov-theme", theme);
    root.style.fontSize = FONT_SIZE_MAP[fontSize];
  }, [theme, fontSize]);

  return (
    <GovThemeContext.Provider value={{ theme, fontSize, language, setTheme, setFontSize, setLanguage }}>
      {children}
    </GovThemeContext.Provider>
  );
}

export function useGovTheme() { return useContext(GovThemeContext); }
