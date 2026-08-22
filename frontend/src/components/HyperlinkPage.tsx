import PublicLayout from "./PublicLayout";
import { Link, ShieldAlert, Award, ExternalLink } from "lucide-react";

export default function HyperlinkPage() {
  const points = [
    {
      Icon: Link,
      title: "Linking to NAMO Jan Connect",
      desc: "Prior permission is not required to link directly to the homepage or public tracking portals. However, links must open in a new window or tab to preserve portal routing."
    },
    {
      Icon: ShieldAlert,
      title: "Content Redirection Policy",
      desc: "We do not permit our pages to be loaded into frames or custom IFrames on external sites. The portal layout must load fully into the client browser."
    },
    {
      Icon: Award,
      title: "Approved Outbound Links",
      desc: "We link exclusively to other official government portals (.gov.in or .nic.in). NAMO Jan Connect is not responsible for the contents or accessibility of external links."
    },
    {
      Icon: ExternalLink,
      title: "Link Integrity Audits",
      desc: "Our automated checks scan outgoing links weekly to ensure zero broken paths. Reports on dead hyperlinks can be sent directly to our support desk."
    }
  ];

  return (
    <PublicLayout activePath="/hyperlink">
      <div className="info-shell">
        <section className="info-hero" style={{ minHeight: "360px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">ROUTING &amp; LINKING</p>
          <h1>Hyperlink <em>Policy</em></h1>
          <p>Rules and permissions regarding outbound redirection, inbound linking, frame nesting, and domain integrity.</p>
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
            <p className="eyebrow" style={{ color: "#f48461" }}>LINK MAINTENANCE</p>
            <h2 style={{ color: "white", fontSize: "clamp(28px,3.5vw,46px)" }}>Domain &amp; Frame Safety</h2>
            <p style={{ color: "#aeb9b3", fontSize: "13px", lineHeight: 1.7, marginTop: "16px" }}>
              Our systems deploy standard security headers (`X-Frame-Options: DENY`) to safeguard citizens against clickjacking and spoofing attacks. Links that violate these conditions are blocked automatically.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
