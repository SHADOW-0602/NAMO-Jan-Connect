import { useEffect, useState } from "react";
import PublicLayout from "./PublicLayout";
import Modal from "./Modal";
import { IconLock, IconCheck, IconCamera, IconPin, IconTicket, IconClock } from "./Icons";
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
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    apiFetch("/api/complaints?scope=gallery")
      .then((r) => (r.ok ? readJson<{ items?: GalleryItem[] }>(r) : Promise.reject()))
      .then((data) => setApiItems(data.items ?? []))
      .catch(() => setApiItems([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(apiItems.map((item) => item.category))];
  const displayed = filter === ALL_FILTER ? apiItems : apiItems.filter((item) => item.category === filter);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

  return (
    <PublicLayout activePath="/gallery">
      <div className="info-shell">
        {/* Hero */}
        <section className="info-hero" style={{ minHeight: "400px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">PROOF, NOT PROMISES</p>
          <h1>
            Complaints <em>resolved</em>,<br />evidence <em>published</em>
          </h1>
          <p>
            Every card below comes directly from a resolved complaint with department-submitted photo proof.
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
                border: filter === ALL_FILTER ? "none" : "1px solid var(--border)",
                background: filter === ALL_FILTER ? "var(--ink)" : "var(--surface-2)",
                color: filter === ALL_FILTER ? "var(--bg)" : "var(--ink)",
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
                  border: filter === cat ? "none" : "1px solid var(--border)",
                  background: filter === cat ? "var(--ink)" : "var(--surface-2)",
                  color: filter === cat ? "var(--bg)" : "var(--ink)",
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
              <span><IconCamera size={48} /></span>
              <h3>No resolved cases found</h3>
              <p>
                {filter !== ALL_FILTER
                  ? "No resolved complaints in this department yet. Try a different filter."
                  : "Resolution evidence will appear here as departments or administrators close complaints with photo proof."}
              </p>
            </div>
          ) : (
            <div className="resolved-gallery reveal-on-view">
              {displayed.map((item) => (
                <article
                  key={`${item.id}-${item.trackingId}`}
                  onClick={() => setSelectedItem(item)}
                  style={{ cursor: "pointer" }}
                  title="Click to view verified evidence"
                >
                  <div className="gallery-photo">
                    <img
                      src={item.imageUrl}
                      alt={`Resolution evidence for ${item.title}`}
                      loading="lazy"
                    />
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <IconCheck size={10} color="#1e7255" />
                      Verified Solved
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
        <div className="gallery-stats-band">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", maxWidth: "800px" }}>
            {[
              [String(apiItems.length), "Resolved cases published with photo proof"],
              [String(categories.length), "Public departments with verified redressed cases"],
            ].map(([stat, label]) => (
              <div key={label}>
                <b style={{ display: "block", fontFamily: "var(--font-display, Georgia)", fontSize: "44px", fontWeight: 600, letterSpacing: "-.03em" }}>{stat}</b>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".1em", lineHeight: 1.4, display: "block", marginTop: "4px" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full-view Evidence Modal */}
        {selectedItem && (
          <Modal
            title={selectedItem.title}
            eyebrow={`SOLVED EVIDENCE · ${selectedItem.trackingId}`}
            onClose={() => setSelectedItem(null)}
            wide
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
              <div
                style={{
                  width: "100%",
                  maxHeight: "520px",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  style={{ width: "100%", maxHeight: "520px", objectFit: "contain" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", background: "var(--surface-2)", padding: "16px 20px", borderRadius: "var(--radius)" }}>
                <div>
                  <small style={{ display: "block", fontSize: "10px", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em" }}>Responsible Department</small>
                  <b style={{ fontSize: "14px", color: "var(--ink)" }}>{selectedItem.department}</b>
                </div>
                <div>
                  <small style={{ display: "block", fontSize: "10px", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em" }}>Incident Location</small>
                  <b style={{ fontSize: "14px", color: "var(--ink)" }}>⌖ {selectedItem.location}</b>
                </div>
                <div>
                  <small style={{ display: "block", fontSize: "10px", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em" }}>Resolution Date</small>
                  <b style={{ fontSize: "14px", color: "var(--ink)" }}>{fmt(selectedItem.resolvedAt)}</b>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", paddingTop: "8px" }}>
                <a
                  href={`/citizen?tracking=${encodeURIComponent(selectedItem.trackingId)}`}
                  className="btn btn-line btn-small"
                  style={{ textDecoration: "none" }}
                >
                  View full tracking trail →
                </a>
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PublicLayout>
  );
}
