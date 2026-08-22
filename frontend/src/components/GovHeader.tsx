"use client";

import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { ThemeToggleInline } from "./ThemeToggle";
import { useLanguage } from "../context/LanguageContext";

interface GovHeaderProps {
  onTrack?: () => void;
  onFile?: () => void;
  activePath?: string;
}

function NationalEmblem() {
  return (
    <img src="/emblem.png" alt="Government of India Emblem" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
  );
}

export default function GovHeader({ onTrack, onFile, activePath = "/" }: GovHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { href: "/how-it-works", key: "nav.how_it_works" },
    { href: "/about", key: "nav.about" },
    { href: "/gallery", key: "nav.gallery" },
  ];

  return (
    <header className="gov-header" role="banner">
      <div className="gov-header-inner">
        {/* Brand */}
        <a href="/" className="gov-brand" aria-label="NAMO Jan Connect – Home">
          <div className="gov-emblem" style={{ color: "var(--accent)", width: 52, height: 52 }}>
            <NationalEmblem />
          </div>
          <div className="gov-portal-name">
            <strong>NAMO Jan Connect</strong>
            <span>राष्ट्रीय शिकायत निवारण पोर्टल</span>
          </div>
        </a>

        <div className="gov-header-divider" aria-hidden="true" />

        {/* Digital India badge */}
        <div className="gov-digital-india" aria-label="Digital India initiative">
          <div className="di-logo">DI</div>
          <span>Digital<br />India</span>
        </div>

        {/* Desktop nav */}
        <nav className="gov-header-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={`gov-nav-link ${activePath === link.href ? "active" : ""}`} aria-current={activePath === link.href ? "page" : undefined}>
              {t(link.key)}
            </a>
          ))}
          {onTrack && (
            <button type="button" className="gov-nav-link" onClick={onTrack} aria-label="Track a complaint">
              {t("nav.track")}
            </button>
          )}
          <a href="/dashboard" className="gov-nav-link">{t("nav.officer_login")}</a>
          {onFile && (
            <button type="button" className="gov-nav-officer" onClick={onFile} aria-label="Lodge a new complaint">
              {t("nav.lodge")}
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="gov-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "1px solid var(--border)", borderRadius: "4px", padding: "8px", cursor: "pointer", color: "var(--muted)", display: "none" }}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "12px 16px", display: "grid", gap: "4px" }} aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, color: "var(--ink)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }} onClick={() => setMenuOpen(false)}>
              {t(link.key)}
              <ChevronRight size={14} />
            </a>
          ))}
          {onTrack && (
            <button type="button" onClick={() => { onTrack(); setMenuOpen(false); }} style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, background: "none", border: "none", textAlign: "left", cursor: "pointer", color: "var(--ink)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {t("nav.track")}
              <ChevronRight size={14} />
            </button>
          )}
          <a href="/dashboard" style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, color: "var(--ink)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }} onClick={() => setMenuOpen(false)}>
            {t("nav.officer_login")}
            <ChevronRight size={14} />
          </a>
          {onFile && (
            <button type="button" className="btn btn-primary" onClick={() => { onFile(); setMenuOpen(false); }} style={{ marginTop: "8px", width: "100%" }}>
              {t("nav.lodge")}
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
