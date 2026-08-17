"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Contrast, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type Theme = "light" | "dark" | "contrast";
type FontSize = "sm" | "md" | "lg";

export default function AccessibilityBar() {
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const savedTheme = (localStorage.getItem("njc-theme") as Theme) || "light";
    const savedFont = (localStorage.getItem("njc-font") as FontSize) || "md";
    setTheme(savedTheme);
    setFontSize(savedFont);
    applyTheme(savedTheme);
    document.documentElement.dataset.fontsize = savedFont;
  }, []);

  function applyTheme(th: Theme) {
    document.documentElement.dataset.theme = th;
    document.documentElement.style.colorScheme = th === "dark" ? "dark" : "light";
  }

  function changeTheme(th: Theme) {
    setTheme(th);
    applyTheme(th);
    localStorage.setItem("njc-theme", th);
  }

  function changeFontSize(f: FontSize) {
    setFontSize(f);
    document.documentElement.dataset.fontsize = f;
    localStorage.setItem("njc-font", f);
  }

  function toggleLanguage() {
    setLanguage(language === "en" ? "hi" : "en");
  }

  return (
    <div className="accessibility-bar" role="banner" aria-label="Accessibility and language controls">
      {/* Gov Identity */}
      <div className="a11y-gov-label">
        <span className="emblem" aria-hidden="true">🦁</span>
        <span>
          {t("a11y.gov_label")}{" "}
          <span style={{ fontFamily: "var(--font-devanagari)", fontSize: "10px", letterSpacing: "0.04em" }}>
            | {t("a11y.gov_hindi")}
          </span>
        </span>
      </div>

      {/* Controls */}
      <div className="a11y-controls" role="toolbar" aria-label="Accessibility settings">
        {/* Theme */}
        <button className={`a11y-btn ${theme === "light" ? "active" : ""}`} onClick={() => changeTheme("light")} aria-pressed={theme === "light"} aria-label="Light mode" title="Light mode">
          <Sun size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
          {t("a11y.light")}
        </button>
        <button className={`a11y-btn ${theme === "dark" ? "active" : ""}`} onClick={() => changeTheme("dark")} aria-pressed={theme === "dark"} aria-label="Dark mode" title="Dark mode">
          <Moon size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
          {t("a11y.dark")}
        </button>
        <button className={`a11y-btn ${theme === "contrast" ? "active" : ""}`} onClick={() => changeTheme("contrast")} aria-pressed={theme === "contrast"} aria-label="High contrast mode" title="High contrast (GIGW)">
          <Contrast size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
          {t("a11y.contrast")}
        </button>

        <span className="a11y-divider" aria-hidden="true" />

        {/* Font size */}
        <div className="font-size-controls" role="group" aria-label="Text size">
          <button className={`a11y-btn ${fontSize === "sm" ? "active" : ""}`} onClick={() => changeFontSize("sm")} aria-pressed={fontSize === "sm"} aria-label="Small text" title="Small text" style={{ fontSize: "10px" }}>A-</button>
          <button className={`a11y-btn ${fontSize === "md" ? "active" : ""}`} onClick={() => changeFontSize("md")} aria-pressed={fontSize === "md"} aria-label="Normal text" title="Normal text">A</button>
          <button className={`a11y-btn ${fontSize === "lg" ? "active" : ""}`} onClick={() => changeFontSize("lg")} aria-pressed={fontSize === "lg"} aria-label="Large text" title="Large text" style={{ fontSize: "13px" }}>A+</button>
        </div>

        <span className="a11y-divider" aria-hidden="true" />

        {/* Language toggle */}
        <button
          className={`a11y-btn ${language === "en" ? "active" : ""}`}
          onClick={toggleLanguage}
          aria-label={t("a11y.lang_label_switch")}
          title={t("a11y.lang_label_switch")}
          style={{ fontFamily: language === "hi" ? "var(--font-sans)" : "var(--font-devanagari)" }}
        >
          <Globe size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
          {t("a11y.lang_switch")}
        </button>
      </div>
    </div>
  );
}
