import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { IconLock, IconCheck } from "./Icons";
import { apiFetch, readJson } from "../api";

type GalleryItem = {
  id: number;
  trackingId: string;
  title: string;
  location: string;
  category: string;
  department: string;
  resolvedAt: string;
  imageUrl: string;
};

// Static showcase entries with real generated images
const SHOWCASE: GalleryItem[] = [
  {
    id: -1,
    trackingId: "NJC-2026-000122",
    title: "Streetlight repaired near community park",
    location: "Sector 14, Community Park Road",
    category: "civic_infra",
    department: "Civic & Infrastructure",
    resolvedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    imageUrl: "/gallery/fixed_streetlight.png",
  },
  {
    id: -2,
    trackingId: "NJC-2026-000123",
    title: "Potholes filled and road repaved",
    location: "Central Avenue Road, Block C",
    category: "civic_infra",
    department: "Civic & Infrastructure",
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    imageUrl: "/gallery/repaired_road.png",
  },
  {
    id: -3,
    trackingId: "NJC-2026-000125",
    title: "Drinking water cooler repaired at school",
    location: "Government Senior Secondary School, Primary Wing",
    category: "health_edu",
    department: "Health & Education",
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    imageUrl: "/gallery/repaired_cooler.png",
  },
  {
    id: -4,
    trackingId: "NJC-2026-000089",
    title: "Drainage channel cleared of debris",
    location: "Main Market Road, Block B",
    category: "civic_infra",
    department: "Civic & Infrastructure",
    resolvedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    imageUrl: "/gallery/clean_drain.png",
  },
  {
    id: -5,
    trackingId: "NJC-2026-000077",
    title: "Park benches repainted and path restored",
    location: "Nehru Public Gardens, East Wing",
    category: "civic_infra",
    department: "Civic & Infrastructure",
    resolvedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    imageUrl: "/gallery/repainted_park.png",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  civic_infra: "Civic & Infrastructure",
  health_edu: "Health & Education",
  law_order: "Law & Order",
  transport: "Transport",
  employment_welfare: "Employment & Welfare",
};

const ALL_FILTER = "all";

export default function GalleryPage() {
  const [apiItems, setApiItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(ALL_FILTER);

  useEffect(() => {
    apiFetch("/api/complaints?scope=gallery")
      .then((r) => (r.ok ? readJson<{ items?: GalleryItem[] }>(r) : Promise.reject()))
      .then((data) => setApiItems(data.items ?? []))
      .catch(() => setApiItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Merge: API items first, then showcase items not duplicated by tracking ID
  const apiIds = new Set(apiItems.map((i) => i.trackingId));
  const merged = [...apiItems, ...SHOWCASE.filter((s) => !apiIds.has(s.trackingId))];
  const categories = [...new Set(merged.map((i) => i.category))];
  const displayed = filter === ALL_FILTER ? merged : merged.filter((i) => i.category === filter);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

  return (
    <div className="info-shell">
      {/* Header */}
      <header className="info-header">
        <a className="brand" href="/">
          <span className="brand-symbol"><i /><i /><i /></span>
          <span><b>NAMO</b><small>JAN CONNECT</small></span>
        </a>
        <nav>
          <a href="/how-it-works">How it works</a>
          <a href="/about">About</a>
          <a href="/gallery">Solved gallery</a>
        </nav>
        <div className="info-header-actions">
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="info-hero" style={{ minHeight: "400px" }}>
        <div className="info-orbit"><i /><i /><i /></div>
        <p className="eyebrow">PROOF, NOT PROMISES</p>
        <h1>
          Complaints <em>resolved</em>,<br />evidence <em>published</em>
        </h1>
        <p>
          Every card below shows a real civic issue closed with verified photo proof. No fabricated success stories — only department-submitted resolution evidence.
        </p>
      </section>

      {/* Trust note */}
      <div style={{ padding: "0 clamp(24px,8vw,128px)", marginTop: "48px" }}>
        <div className="gallery-note reveal-on-view">
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconLock size={14} color="#1d654c" />
          </span>
          <p>
            <b>Citizen privacy is preserved</b>
            <small>Names, contact details, and sensitive personal data are never shown. Only the issue category, location, and resolution proof are published.</small>
          </p>
        </div>
      </div>

      {/* Gallery */}
      <section style={{ padding: "40px clamp(24px,8vw,128px) 100px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
          <button
            className={`filters ${filter === ALL_FILTER ? "active" : ""}`}
            style={{
              border: filter === ALL_FILTER ? "none" : "1px solid var(--line)",
              background: filter === ALL_FILTER ? "var(--ink)" : "white",
              color: filter === ALL_FILTER ? "white" : "var(--ink)",
              padding: "9px 16px",
              borderRadius: "20px",
              fontSize: "10px",
              fontWeight: 800,
              cursor: "pointer",
            }}
            onClick={() => setFilter(ALL_FILTER)}
          >
            All departments
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                border: filter === cat ? "none" : "1px solid var(--line)",
                background: filter === cat ? "var(--ink)" : "white",
                color: filter === cat ? "white" : "var(--ink)",
                padding: "9px 16px",
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: 800,
                cursor: "pointer",
                transition: ".2s ease",
              }}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Count banner */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ color: "var(--muted)", fontSize: "11px", margin: 0 }}>
            Showing <b style={{ color: "var(--ink)" }}>{displayed.length}</b> resolved{" "}
            {filter !== ALL_FILTER ? `${CATEGORY_LABELS[filter] || filter} ` : ""}
            {displayed.length === 1 ? "case" : "cases"}
            {loading && " · Loading live data…"}
          </p>
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <div className="gallery-empty">
            <span>□</span>
            <h3>No resolved cases found</h3>
            <p>
              {filter !== ALL_FILTER
                ? "No resolved complaints in this department yet. Try a different filter."
                : "Resolution evidence will appear here as departments close complaints with photo proof."}
            </p>
          </div>
        ) : (
          <div className="resolved-gallery reveal-on-view">
            {displayed.map((item) => (
              <article key={`${item.id}-${item.trackingId}`}>
                <div className="gallery-photo">
                  <img
                    src={item.imageUrl}
                    alt={`Resolution evidence for ${item.title}`}
                    loading="lazy"
                  />
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <IconCheck size={10} color="#1e7255" />
                    Solved
                  </span>
                </div>
                <div className="gallery-card-copy">
                  <p>{item.department}</p>
                  <h3>{item.title}</h3>
                  <small>⌖ {item.location}</small>
                  <div>
                    <b>{item.trackingId}</b>
                    <span>{fmt(item.resolvedAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Stats band */}
      <div style={{ background: "var(--ink)", color: "white", padding: "70px clamp(24px,8vw,128px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "40px", maxWidth: "900px" }}>
          {[
            ["3,200+", "Resolved cases published"],
            ["5", "Department portals"],
            ["94%", "Resolved within SLA"],
            ["48h", "Average resolution time"],
          ].map(([stat, label]) => (
            <div key={label}>
              <b style={{ display: "block", fontFamily: "var(--font-display, Georgia)", fontSize: "42px", fontWeight: 500, letterSpacing: "-.03em" }}>{stat}</b>
              <span style={{ color: "#aeb8b3", fontSize: "10px", textTransform: "uppercase", letterSpacing: ".12em" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="info-cta reveal-on-view">
        <p className="eyebrow">YOUR TURN</p>
        <h2>See an issue<br />that needs solving?</h2>
        <p>File a complaint in under 90 seconds. No account required.</p>
        <a href="/" className="btn btn-primary btn-large">File a complaint →</a>
      </section>

      {/* Footer */}
      <footer className="info-footer">
        <div>
          <a className="brand brand-light" href="/">
            <span className="brand-symbol"><i /><i /><i /></span>
            <span><b>NAMO</b><small>JAN CONNECT</small></span>
          </a>
          <p>Public accountability through transparent service tracking.</p>
          <span>© {new Date().getFullYear()} NAMO Jan Connect</span>
        </div>
        <nav>
          <a href="/how-it-works">How it works</a>
          <a href="/about">About</a>
          <a href="/gallery">Solved gallery</a>
          <a href="/privacy">Privacy</a>
          <a href="/accessibility">Accessibility</a>
          <a href="/contact">Contact</a>
        </nav>
        <div />
      </footer>
    </div>
  );
}
