import PublicLayout from "./PublicLayout";
import { Clock, ShieldCheck, HelpCircle, Activity } from "lucide-react";

export default function CharterPage() {
  const points = [
    {
      Icon: Clock,
      title: "Guaranteed SLA Timelines",
      desc: "Every category of grievance has a defined SLA window ranging from 3 to 15 days. Critical infrastructure and safety complaints are routed with high-priority tags."
    },
    {
      Icon: ShieldCheck,
      title: "Resolution Quality Standards",
      desc: "Grievances are marked resolved only when verified photo evidence or a detailed department resolution note is appended. Citizens can request reopening for inadequate fixes."
    },
    {
      Icon: HelpCircle,
      title: "Automatic Escalation Matrix",
      desc: "If a complaint exceeds its SLA deadline without department activity, the system flags it automatically, escalating the record to the chief supervisor in the admin panel."
    },
    {
      Icon: Activity,
      title: "Platform Service Uptime",
      desc: "NAMO Jan Connect pledges a minimum of 99.9% uptime for citizen submissions and status tracking, ensuring service availability around the clock."
    }
  ];

  return (
    <PublicLayout activePath="/charter">
      <div className="info-shell">
        <section className="info-hero" style={{ minHeight: "360px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">SERVICE GUARANTEE</p>
          <h1>Citizen <em>Charter</em></h1>
          <p>Our commitment to processing public complaints with speed, clarity, accountability, and legal ownership.</p>
        </section>

        <section className="info-section principle-grid reveal-on-view">
          {points.map((pt, i) => (
            <article key={pt.title}>
              <span style={{ color: "var(--accent-2)", fontFamily: "var(--font-display, Georgia)", fontSize: "24px" }}>0{i + 1}</span>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "rgba(241,90,50,.1)", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "18px 0 16px",
              }}>
                <pt.Icon size={22} color="var(--accent-2)" />
              </div>
              <h3 style={{ margin: "0 0 10px" }}>{pt.title}</h3>
              <p>{pt.desc}</p>
            </article>
          ))}
        </section>

        <div className="info-band reveal-on-view">
          <div>
            <p className="eyebrow" style={{ color: "#f48461" }}>SLA ESCALATION WINDOWS</p>
            <h2 style={{ color: "white", fontSize: "clamp(28px,3.5vw,46px)" }}>SLA Commitments</h2>
            <p style={{ color: "#aeb9b3", fontSize: "13px", lineHeight: 1.7, marginTop: "16px" }}>
              Standard categories like Civic Infrastructure and Health/Education have a 7-day SLA window. Transport and welfare concerns are resolved within 10 to 15 business days.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
