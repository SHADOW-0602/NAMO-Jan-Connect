import PublicLayout from "./PublicLayout";
import { Keyboard, Paintbrush, ZoomIn, Eye } from "lucide-react";

export default function AccessibilityPage() {
  const points = [
    {
      Icon: Keyboard,
      title: "Keyboard Friendliness",
      desc: "Every component is accessible without a mouse. Visually distinguishable focus borders (3px saffron rings) allow keyboard users to trace their cursor position with ease."
    },
    {
      Icon: Paintbrush,
      title: "Contrast Themes",
      desc: "Our theme engine supports a High Contrast Mode in compliance with WCAG 2.1 AA. Interactive elements maintain color contrast ratios exceeding 4.5:1 against their backgrounds."
    },
    {
      Icon: ZoomIn,
      title: "Scalable Typography",
      desc: "Users can scale text dynamically (A-, A, A+ settings in the accessibility toolbar) up to 150% without breaking page layouts or overlaying elements."
    },
    {
      Icon: Eye,
      title: "Reduced Motion & Screen Reader Support",
      desc: "HTML structures follow strict semantic hierarchy. Support for 'prefers-reduced-motion' disables complex transitions for users experiencing vestibular motion disorders."
    }
  ];

  return (
    <PublicLayout activePath="/accessibility">
      <div className="info-shell">
        <section className="info-hero" style={{ minHeight: "360px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">ACCESS FOR EVERYONE</p>
          <h1>Accessibility <em>Statement</em></h1>
          <p>This portal is designed to remain fully usable and accessible to citizens of all abilities, including those with visual, motor, or cognitive impairments.</p>
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
            <p className="eyebrow" style={{ color: "#f48461" }}>COMPLIANCE CERTIFICATION</p>
            <h2 style={{ color: "white", fontSize: "clamp(28px,3.5vw,46px)" }}>GIGW 3.0 Standard</h2>
            <p style={{ color: "#aeb9b3", fontSize: "13px", lineHeight: 1.7, marginTop: "16px" }}>
              NAMO Jan Connect conforms to the Guidelines for Indian Government Websites (GIGW) 3.0. It is fully validated to WCAG 2.1 Level AA criteria. Feedback on any accessibility difficulties can be submitted via the Contact form.
            </p>
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {[
              "ARIA Landmark Roles utilized for semantic layout",
              "Alternative text descriptions for all structural elements",
              "Skip-to-Content link supported for keyboard users",
              "Consistent navigation structure across all portal folders"
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
