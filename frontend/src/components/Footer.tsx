import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="gov-footer" role="contentinfo">
      <div className="gov-footer-main">
        <div className="gov-footer-brand">
          <strong>NAMO Jan Connect</strong>
          <p>{t("footer.brand_desc")}</p>
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
      </div>
    </footer>
  );
}
