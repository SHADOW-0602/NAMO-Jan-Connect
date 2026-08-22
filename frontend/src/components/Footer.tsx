import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="gov-footer" role="contentinfo">
      <div className="gov-footer-main">
        <div className="gov-footer-brand">
          <strong>NAMO Jan Connect</strong>
          <p>{t("footer.brand_desc")}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", color: "#475569" }}>🔒 NIC Hosted &nbsp;|&nbsp; ♿ GIGW 3.0 &nbsp;|&nbsp; WCAG 2.1 AA</span>
          </div>
        </div>
        <div className="gov-footer-col">
          <h4>{t("footer.citizen_services")}</h4>
          <ul>
            <li><a href="/">{t("footer.lodge")}</a></li>
            <li><a href="/gallery">{t("footer.track_status")}</a></li>
            <li><a href="/gallery">{t("footer.solved_gallery")}</a></li>
            <li><a href="/how-it-works">{t("footer.how_it_works")}</a></li>
          </ul>
        </div>
        <div className="gov-footer-col">
          <h4>{t("footer.information")}</h4>
          <ul>
            <li><a href="/about">{t("footer.about")}</a></li>
            <li><a href="/privacy">{t("footer.privacy")}</a></li>
            <li><a href="/accessibility">{t("footer.accessibility")}</a></li>
            <li><a href="/contact">{t("footer.contact")}</a></li>
          </ul>
        </div>
        <div className="gov-footer-col">
          <h4>{t("footer.legal")}</h4>
          <ul>
            <li><a href="/terms">{t("footer.terms")}</a></li>
            <li><a href="/charter">{t("footer.charter")}</a></li>
            <li><a href="/rti">{t("footer.rti")}</a></li>
            <li><a href="/hyperlink">{t("footer.hyperlink")}</a></li>
          </ul>
        </div>
      </div>
      <div className="gov-footer-bottom">{t("footer.bottom")}</div>
    </footer>
  );
}
