import { useEffect, useState } from "react";
import PublicLayout from "./PublicLayout";
import { IconSearch, IconShield, IconBolt, IconBarChart } from "./Icons";
import { apiFetch, readJson } from "../api";

const values = [
  {
    Icon: IconSearch,
    title: "Full transparency",
    body: "Every status update, remark, and timestamp is publicly readable. We don't bury resolution data behind login walls.",
  },
  {
    Icon: IconShield,
    title: "Privacy first",
    body: "Citizen contact details are never published. Only anonymised complaint metadata is exposed in tracking and gallery views.",
  },
  {
    Icon: IconBolt,
    title: "Speed by design",
    body: "Routing is automatic and instant. There is no inbox for a coordinator to empty — departments receive complaints the moment they're filed.",
  },
  {
    Icon: IconBarChart,
    title: "Accountability at scale",
    body: "SLA dashboards and public gallery data make performance visible across every department, every quarter.",
  },
];

const departments = [
  { label: "Civic & Infrastructure", tag: "Roads, water, streetlights, drainage", color: "#e4ae3f" },
  { label: "Health & Education", tag: "Clinics, hospitals, schools", color: "#3a9b82" },
  { label: "Law & Order", tag: "Public safety, policing", color: "#e3684c" },
  { label: "Transport & Public Services", tag: "Permits, transit, PWD roads", color: "#4c84bc" },
  { label: "Employment & Welfare", tag: "Social support, pensions, jobs", color: "#6aa361" },
];

export default function AboutPage() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, active: 0 });
  useEffect(() => {
    apiFetch("/api/complaints?scope=stats")
      .then((response) => response.ok ? readJson<{ summary: { total: number; resolved: number; active: number } }>(response) : Promise.reject())
      .then((data) => setStats({ total: Number(data.summary.total), resolved: Number(data.summary.resolved), active: Number(data.summary.active) }))
      .catch(() => setStats({ total: 0, resolved: 0, active: 0 }));
  }, []);
  return (
    <PublicLayout activePath="/about">
      <div className="info-shell">
        {/* Hero */}
        <section className="info-hero" style={{ minHeight: "460px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">PUBLIC SERVICE, MADE VISIBLE</p>
          <h1>
            Built for <em>citizens</em>,<br />accountable to <em>everyone</em>
          </h1>
          <p>NAMO Jan Connect gives public concerns a clear and accountable service trail — from the moment they're filed to the moment they're closed.</p>
        </section>

        {/* Mission two-column */}
        <section className="info-section about-intro reveal-on-view">
          <div className="two-column">
            <div>
              <p className="eyebrow">OUR MISSION</p>
              <h2>Public problems deserve public solutions</h2>
              <p>
                For too long, civic complaints disappeared into unreachable email inboxes or unanswered phone queues. NAMO Jan Connect changes that — every issue gets a tracking ID, every department gets a deadline, and every resolved case gets published with photo evidence.
              </p>
              <p style={{ marginTop: "16px" }}>
                We don't ask citizens to chase their complaints. We give the system the accountability infrastructure to chase itself.
              </p>
            </div>
            <div>
              <div className="info-band" style={{ margin: 0, gridTemplateColumns: "1fr", padding: "42px", borderRadius: "4px" }}>
                <div>
                  <p className="eyebrow" style={{ color: "#f48461" }}>BY THE NUMBERS</p>
                </div>
                <div className="values-list" style={{ marginTop: "24px" }}>
                  {[
                    [stats.total.toLocaleString("en-IN"), "Complaints filed"],
                    [stats.resolved.toLocaleString("en-IN"), "Complaints resolved"],
                    [stats.active.toLocaleString("en-IN"), "Active complaints"],
                    ["5", "Department portals active"],
                  ].map(([stat, label]) => (
                    <article key={label} style={{ padding: "20px 22px" }}>
                      <b style={{ fontSize: "28px", letterSpacing: "-.03em" }}>{stat}</b>
                      <p style={{ fontSize: "9px" }}>{label}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="info-section" style={{ background: "var(--cream)" }}>
          <div className="info-section-heading reveal-on-view">
            <p className="eyebrow">WHAT WE STAND FOR</p>
            <h2>Core values that<br />shape everything</h2>
          </div>
          <div className="principle-grid reveal-on-view">
            {values.map((v, i) => (
              <article key={v.title}>
                <span style={{ color: "var(--orange)", fontFamily: "var(--font-display, Georgia)", fontSize: "24px" }}>0{i + 1}</span>
                {/* SVG icon in a tinted circle */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: "rgba(241,90,50,.1)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  margin: "18px 0 16px",
                }}>
                  <v.Icon size={22} color="var(--orange)" />
                </div>
                <h3 style={{ margin: "0 0 10px" }}>{v.title}</h3>
                <p>{v.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Departments dark band */}
        <div className="info-band reveal-on-view">
          <div>
            <p className="eyebrow" style={{ color: "#f48461" }}>DEPARTMENTS SERVED</p>
            <h2 style={{ color: "white", fontSize: "clamp(34px,3.5vw,52px)" }}>Five portals, one platform</h2>
            <p style={{ color: "#aeb9b3", fontSize: "13px", lineHeight: 1.7, marginTop: "16px" }}>
              Each department has its own isolated portal with scoped staff access. Staff can only see and manage complaints assigned to their category.
            </p>
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {departments.map((d) => (
              <div key={d.label} style={{ display: "flex", gap: "14px", alignItems: "center", padding: "14px 18px", background: "#17251f", borderRadius: "5px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                <div>
                  <b style={{ fontSize: "12px", display: "block" }}>{d.label}</b>
                  <span style={{ color: "#a5b2ac", fontSize: "9px" }}>{d.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <section className="info-cta reveal-on-view">
          <p className="eyebrow">GET INVOLVED</p>
          <h2>Civic change<br />starts with one report</h2>
          <p>No account. No red tape. Just describe the issue and let the system handle the rest.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/" className="btn btn-primary btn-large">File a complaint</a>
            <a href="/contact" className="btn btn-outline btn-large">Contact us</a>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
