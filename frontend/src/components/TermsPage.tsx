import PublicLayout from "./PublicLayout";
import { FileText, FileSpreadsheet, ShieldAlert, BadgeCheck } from "lucide-react";

export default function TermsPage() {
  const points = [
    {
      Icon: FileText,
      title: "Fair & Legal Usage",
      desc: "Citizens are encouraged to report genuine municipal grievances. Providing false, misleading, or intentionally malicious statements may result in the blocking of access to the platform."
    },
    {
      Icon: FileSpreadsheet,
      title: "Grievance Processing Rights",
      desc: "By lodging a complaint, you grant NAMO Jan Connect and its connected municipal departments the permission to view and process your submission to resolve the reported concern."
    },
    {
      Icon: ShieldAlert,
      title: "Security & Access",
      desc: "Any attempt to inject malicious scripts, scrape database content, or compromise server security will be tracked and reported under Section 66 of the Information Technology Act, 2000."
    },
    {
      Icon: BadgeCheck,
      title: "Acceptable Content Standards",
      desc: "Do not upload images containing graphic content, personal identity theft documents (passwords, bank details), or comments that violate local laws or privacy protocols."
    }
  ];

  return (
    <PublicLayout activePath="/terms">
      <div className="info-shell">
        <section className="info-hero" style={{ minHeight: "360px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">LEGAL DISCLOSURE</p>
          <h1>Terms <em>of Use</em></h1>
          <p>Read the conditions of access, lodging, tracking, and compliance standards governing NAMO Jan Connect.</p>
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
            <p className="eyebrow" style={{ color: "#f48461" }}>LEGAL JURISDICTION</p>
            <h2 style={{ color: "white", fontSize: "clamp(28px,3.5vw,46px)" }}>Terms &amp; Arbitration</h2>
            <p style={{ color: "#aeb9b3", fontSize: "13px", lineHeight: 1.7, marginTop: "16px" }}>
              These terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with the portal shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
