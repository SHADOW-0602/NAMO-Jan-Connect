"use client";

import ThemeToggle from "./ThemeToggle";

export default function InfoPageShell({ eyebrow, title, intro, children }: { eyebrow: string; title: React.ReactNode; intro: string; children: React.ReactNode }) {
  return (
    <div className="info-shell">
      <header className="info-header">
        <a className="brand" href="/" aria-label="NAMO Jan Connect home"><span className="brand-symbol"><i /><i /><i /></span><span><b>NAMO</b><small>JAN CONNECT</small></span></a>
        <nav aria-label="Information pages"><a href="/how-it-works">How it works</a><a href="/accessibility">Accessibility</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a></nav>
        <div className="info-header-actions"><ThemeToggle /><a className="btn btn-dark" href="/">Open platform <span>↗</span></a></div>
      </header>
      <main className="info-page">
        <section className="info-hero page-enter"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p><div className="info-orbit" aria-hidden="true"><i /><i /><i /></div></section>
        <div className="info-content">{children}</div>
      </main>
      <footer className="info-footer">
        <a className="brand brand-light" href="/" aria-label="NAMO Jan Connect home"><span className="brand-symbol"><i /><i /><i /></span><span><b>NAMO</b><small>JAN CONNECT</small></span></a>
        <div><p>Transparent public service, from first report to final resolution.</p><span>© 2026 NAMO Jan Connect</span></div>
        <nav><a href="/how-it-works">How it works</a><a href="/privacy">Privacy</a><a href="/accessibility">Accessibility</a><a href="/contact">Contact</a></nav>
      </footer>
    </div>
  );
}

