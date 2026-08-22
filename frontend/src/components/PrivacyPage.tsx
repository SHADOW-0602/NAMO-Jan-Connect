import PublicLayout from "./PublicLayout";
import { Shield, EyeOff, Lock, UserCheck } from "lucide-react";

export default function PrivacyPage() {
  const points = [
    {
      Icon: Shield,
      title: "Data Protection & Encryption",
      desc: "All personal identifiers (email, phone number, citizen name) are stored securely with industry-standard encryption. Database access is strictly regulated and logged."
    },
    {
      Icon: EyeOff,
      title: "Anonymized Public Records",
      desc: "To maintain transparency, resolved complaints are displayed in our Public Gallery. However, all citizen names, contact details, and precise house/apartment numbers are stripped from public listings."
    },
    {
      Icon: Lock,
      title: "Role-Scoped Access Control",
      desc: "Department staff can only view contact information for complaints assigned to their department. General platform auditing is limited to administrators, ensuring that no employee can view unneeded personal data."
    },
    {
      Icon: UserCheck,
      title: "Citizen Consent & Rectification",
      desc: "Your email and phone are used solely for routing notifications and updating you on the status of your grievance. You may request data removal or query modifications via support at any time."
    }
  ];

  return (
    <PublicLayout activePath="/privacy">
      <div className="info-shell">
        <section className="info-hero" style={{ minHeight: "360px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">PRIVACY BY DESIGN</p>
          <h1>Privacy <em>Policy</em></h1>
          <p>We believe in absolute transparency of outcomes alongside absolute protection of citizen identities.</p>
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
            <p className="eyebrow" style={{ color: "#f48461" }}>DATA HOSTING & COMPLIANCE</p>
            <h2 style={{ color: "white", fontSize: "clamp(28px,3.5vw,46px)" }}>NIC Cloud Infrastructure</h2>
            <p style={{ color: "#aeb9b3", fontSize: "13px", lineHeight: 1.7, marginTop: "16px" }}>
              NAMO Jan Connect is hosted at the National Informatics Centre (NIC) National Data Center. It fully complies with the Digital Personal Data Protection (DPDP) Act, 2023, and guidelines on secure data handling for public systems in India.
            </p>
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {[
              "Hosted in NIC Certified Data Centre",
              "Annual security audit conducted by CERT-In empaneled auditors",
              "SSL/TLS secure transport for all API traffic",
              "Compliance with GIGW 3.0 guidelines"
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "center", padding: "14px 18px", background: "#17251f", borderRadius: "5px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-3)", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 600 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
