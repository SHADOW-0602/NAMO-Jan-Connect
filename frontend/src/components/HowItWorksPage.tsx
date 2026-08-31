import PublicLayout from "./PublicLayout";
import { IconPin, IconTicket, IconSignal, IconClock, IconRefresh, IconCamera, IconArrowRight } from "./Icons";

const steps = [
  {
    number: "01",
    Icon: IconPin,
    title: "Pin your concern",
    body: "Describe the issue in plain language and drop a map pin at the exact location. A few lines and a photo — that's all we need.",
  },
  {
    number: "02",
    Icon: IconTicket,
    title: "Receive a tracking ID",
    body: "Instantly get a public tracking reference (e.g. NJC-2026-001234). No account required. Share it or bookmark it — it belongs to you.",
  },
  {
    number: "03",
    Icon: IconSignal,
    title: "Routed to the right desk",
    body: "Our system reads the category and location and routes it directly to the responsible department within seconds — no manual gatekeeping.",
  },
  {
    number: "04",
    Icon: IconClock,
    title: "SLA clock starts",
    body: "A service-level deadline is set based on the issue type. Departments know when a complaint risks breaching its resolution window.",
  },
  {
    number: "05",
    Icon: IconRefresh,
    title: "Status updates follow",
    body: "Every status change — acknowledged, in progress, resolved — is logged with a timestamp and visible on the public tracking page.",
  },
  {
    number: "06",
    Icon: IconCamera,
    title: "Resolution evidence published",
    body: "When staff close a complaint with photo proof, the anonymised result is added to the public Solved Gallery. No fabricated success stories.",
  },
];

const slaData = [
  { label: "Emergency — Water/Power", days: 1, pct: 15 },
  { label: "Road damage", days: 5, pct: 42 },
  { label: "Sanitation / waste", days: 3, pct: 28 },
  { label: "Street lighting", days: 7, pct: 58 },
  { label: "Health & schools", days: 10, pct: 75 },
  { label: "General civic", days: 14, pct: 100 },
];

export default function HowItWorksPage() {
  return (
    <PublicLayout activePath="/how-it-works">
      <div className="info-shell">
      {/* Hero */}
      <section className="info-hero" style={{ minHeight: "480px" }}>
        <div className="info-orbit"><i /><i /><i /></div>
        <p className="eyebrow">ONE CLEAR JOURNEY</p>
        <h1>
          From <em>concern</em><br />to <em>closure</em>
        </h1>
        <p>A complaint is routed instantly and remains traceable through every department action — visible to the citizen at every step.</p>
        <div style={{ marginTop: "36px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href="/" className="btn btn-primary">File a complaint</a>
          <a href="/gallery" className="btn btn-outline">See resolved cases</a>
        </div>
      </section>

      {/* 6-step process */}
      <section className="info-section" style={{ paddingBottom: "80px" }}>
        <div className="info-section-heading reveal-on-view">
          <p className="eyebrow">THE PROCESS</p>
          <h2>Six steps,<br />zero ambiguity</h2>
          <p>Every complaint follows the same pipeline — no shortcuts, no black holes.</p>
        </div>
        <div className="process-list reveal-on-view">
          {steps.map((s) => (
            <article key={s.number}>
              <span>{s.number}</span>
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(234, 88, 12, 0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <s.Icon size={18} color="var(--accent-2)" />
                  </span>
                  {s.title}
                </h3>
                <p>{s.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Status lifecycle band */}
      <div className="info-band reveal-on-view">
        <div>
          <p className="eyebrow" style={{ color: "#f48461" }}>STATUS LIFECYCLE</p>
          <h2 style={{ color: "white", fontSize: "clamp(34px,3.5vw,52px)" }}>Every change is logged</h2>
          <p style={{ color: "#aeb9b3", fontSize: "13px", lineHeight: 1.7, marginTop: "16px" }}>
            Staff cannot skip stages. Each status transition requires a remark and is timestamped — creating a tamper-resistant audit trail any citizen can read.
          </p>
        </div>
        <div className="status-explainer">
          {[
            ["Submitted", "Your complaint is received and assigned a tracking ID immediately."],
            ["Acknowledged", "The responsible department has accepted the case into their queue."],
            ["In Progress", "Active work has begun. A work order or dispatch has been logged."],
            ["Resolved", "The issue is closed with verifiable proof of completion."],
          ].map(([title, desc]) => (
            <article key={title}>
              <b>{title}</b>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </div>

      {/* SLA section */}
      <section className="info-section" style={{ background: "var(--cream)" }}>
        <div className="two-column reveal-on-view">
          <div>
            <p className="eyebrow">SERVICE-LEVEL AGREEMENTS</p>
            <h2>Deadlines are<br />public and binding</h2>
            <p>Each category carries a defined SLA. When a complaint approaches its window, the system flags it for escalation — automatically, with no manual chase required.</p>
          </div>
          <div style={{ display: "grid", gap: "14px" }}>
            {slaData.map((row) => (
              <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "10px", fontWeight: 700 }}>
                    <span>{row.label}</span>
                    <span style={{ color: "var(--accent-2)" }}>{row.days}d SLA</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${row.pct}%`, background: "var(--accent-2)", borderRadius: "6px", transition: "width 1s ease" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="info-cta reveal-on-view">
        <p className="eyebrow">START NOW</p>
        <h2>Your voice deserves a record</h2>
        <p>No login. No forms. Just describe the problem, pin the location, and let the system do its job.</p>
        <a href="/" className="btn btn-primary btn-large">File a complaint →</a>
      </section>
      </div>
    </PublicLayout>
  );
}
