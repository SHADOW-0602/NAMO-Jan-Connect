import type { Metadata } from "next";
import InfoPageShell from "../InfoPageShell";

export const metadata: Metadata = { title: "How it works | NAMO Jan Connect", description: "See how a complaint moves from citizen report to verified resolution." };

const stages = [
  { number: "01", title: "Describe the concern", copy: "Choose the most relevant category, explain what happened, and add a landmark or exact location. Photos help the department understand the issue before a field visit." },
  { number: "02", title: "Automatic department routing", copy: "The platform matches the complaint category to an internal department and places it directly in that team’s queue. No outside portal or manual forwarding is involved." },
  { number: "03", title: "Acknowledgement and action", copy: "Department staff review the report, acknowledge ownership, and publish remarks as work begins. Every change is timestamped and attributed." },
  { number: "04", title: "Evidence-backed resolution", copy: "The department records the outcome, can add resolution photos, and closes the complaint. Citizens can reopen disputed outcomes and leave feedback." },
];

export default function HowItWorksPage() {
  return <InfoPageShell eyebrow="ONE CLEAR JOURNEY" title={<>From first report to <em>visible resolution.</em></>} intro="A complaint never disappears into a black box. Here is what happens at every stage, who owns the next action, and what you can expect.">
    <section className="info-section process-section reveal-on-view"><div className="info-section-heading"><p className="eyebrow">THE COMPLAINT LIFECYCLE</p><h2>Four steps. One public record.</h2></div><div className="process-list">{stages.map((stage) => <article key={stage.number}><span>{stage.number}</span><div><h3>{stage.title}</h3><p>{stage.copy}</p></div><i aria-hidden="true">→</i></article>)}</div></section>
    <section className="info-band reveal-on-view"><div><p className="eyebrow">STATUS LANGUAGE</p><h2>Everyone sees the same progress.</h2></div><div className="status-explainer"><article><b>Submitted</b><p>Received and routed.</p></article><article><b>Acknowledged</b><p>Department accepted ownership.</p></article><article><b>In progress</b><p>Action is underway.</p></article><article><b>Resolved</b><p>Outcome recorded with evidence.</p></article></div></section>
    <section className="info-section two-column reveal-on-view"><div><p className="eyebrow">SERVICE LEVELS</p><h2>Deadlines stay visible.</h2><p>Each department has a configurable service-level target. Staff see approaching deadlines in their queue, while administrators can identify overdue cases and intervene.</p></div><aside className="sla-card"><span>Typical target</span><b>3–10 days</b><p>Depending on category and urgency</p><i><em style={{ width: "72%" }} /></i><small>72% of target window used</small></aside></section>
    <section className="info-cta reveal-on-view"><h2>Ready to raise a concern?</h2><p>A clear report is the fastest route to a clear response.</p><a className="btn btn-primary btn-large" href="/">File a complaint <span>↗</span></a></section>
  </InfoPageShell>;
}

