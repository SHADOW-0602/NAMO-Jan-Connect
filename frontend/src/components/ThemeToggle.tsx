"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Contrast, Type, Globe } from "lucide-react";

type Theme = "light" | "dark" | "contrast";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("njc-theme") as Theme | null;
    const current = saved || (document.documentElement.dataset.theme as Theme) || "light";
    setTheme(current);
    apply(current);
  }, []);

  function apply(next: Theme) {
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next === "dark" ? "dark" : "light";
  }

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "contrast" : "light";
    apply(next);
    localStorage.setItem("njc-theme", next);
    setTheme(next);
  }

  const icons = { light: <Sun size={13} />, dark: <Moon size={13} />, contrast: <Contrast size={13} /> };
  const labels = { light: "Light", dark: "Dark", contrast: "HC" };

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Current theme: ${theme}. Click to switch.`}
      title={`Switch theme (current: ${theme})`}
      style={{ width: "auto", height: "auto", padding: "5px 9px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", color: "rgba(255,255,255,0.9)", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
    >
      {icons[theme]}
      {labels[theme]}
    </button>
  );
}

export function ThemeToggleInline() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("njc-theme") as Theme | null;
    const current = saved || "light";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "contrast" : "light";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next === "dark" ? "dark" : "light";
    localStorage.setItem("njc-theme", next);
    setTheme(next);
  }

  const icons = { light: <Sun size={12} />, dark: <Moon size={12} />, contrast: <Contrast size={12} /> };

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch theme`}
      style={{ width: "auto", height: "auto", padding: "5px 10px", display: "flex", alignItems: "center", gap: "5px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--muted)", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
    >
      {icons[theme]}
    </button>
  );
}
