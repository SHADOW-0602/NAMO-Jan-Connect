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
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="48" width="40" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="28" cy="32" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="28" cy="32" r="1.5" fill="currentColor" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line key={deg} x1="28" y1="26.5" x2="28" y2="28" stroke="currentColor" strokeWidth="1.2" transform={`rotate(${deg} 28 32)`} />
      ))}
      <path d="M18 30c-1-2-1-4 0-6 1-3 3-4 5-4s4 2 5 4c1 2 1 4 0 6H18z" fill="currentColor" opacity="0.9" />
      <path d="M28 30c0-2 0-4 1-6 1-3 3-4 5-4s4 2 5 4c1 2 1 4 0 6H28z" fill="currentColor" opacity="0.9" />
      <ellipse cx="23" cy="22" rx="3.5" ry="2.5" fill="currentColor" opacity="0.9" />
      <ellipse cx="33" cy="22" rx="3.5" ry="2.5" fill="currentColor" opacity="0.9" />
      <path d="M20 24 Q23 21 26 24" stroke="var(--surface)" strokeWidth="0.6" fill="none" />
      <path d="M30 24 Q33 21 36 24" stroke="var(--surface)" strokeWidth="0.6" fill="none" />
      <path d="M13 40 Q18 36 23 40" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M33 40 Q38 36 43 40" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="14" y="43" width="28" height="3.5" rx="1" fill="currentColor" opacity="0.25" />
      <text x="28" y="46.2" textAnchor="middle" fontSize="2.8" fill="currentColor" fontWeight="600" fontFamily="serif">
        सत्यमेव जयते
      </text>
    </svg>
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
