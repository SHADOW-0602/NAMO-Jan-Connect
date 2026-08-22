import PublicLayout from "./PublicLayout";
import { Scale, Users, FileCheck, Landmark } from "lucide-react";

export default function RtiPage() {
  const points = [
    {
      Icon: Scale,
      title: "Section 4 Compliance",
      desc: "NAMO Jan Connect proactively publishes statistical counts, SLAs, and resolved complaint archives in compliance with Section 4(1)(b) of the RTI Act, 2005."
    },
    {
      Icon: Users,
      title: "Public Information Officer",
      desc: "For formal RTI filings under the portal's purview, please direct queries to the Public Information Officer (PIO), National Informatics Centre (NIC), New Delhi."
    },
    {
      Icon: FileCheck,
      title: "Right to Grievance Disclosures",
      desc: "Historical aggregated counts and resolution times by category are downloadable by researchers and citizens seeking to verify department efficacy."
    },
    {
      Icon: Landmark,
      title: "Appellate Authority",
      desc: "If citizens are unsatisfied with proactive disclosures or have queries regarding backend routing logs, appeals may be submitted to the First Appellate Authority."
    }
  ];

  return (
    <PublicLayout activePath="/rti">
      <div className="info-shell">
        <section className="info-hero" style={{ minHeight: "360px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">RIGHT TO INFORMATION</p>
          <h1>RTI <em>Information</em></h1>
          <p>Proactive disclosures and guidelines for citizens seeking information under the Right to Information Act, 2005.</p>
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
            <p className="eyebrow" style={{ color: "#f48461" }}>OFFICIAL CONTACT FOR RTI</p>
            <h2 style={{ color: "white", fontSize: "clamp(28px,3.5vw,46px)" }}>RTI Officer Contact</h2>
            <p style={{ color: "#aeb9b3", fontSize: "13px", lineHeight: 1.7, marginTop: "16px" }}>
              RTI applications can be sent to the PIO at our New Delhi office or lodged digitally via rtionline.gov.in by referencing the National Informatics Centre (NIC) database.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
