import { useLanguage } from "../context/LanguageContext";

export default function TickerBanner() {
  const { t } = useLanguage();

  const noticeKeys = ["ticker.1", "ticker.2", "ticker.3", "ticker.4", "ticker.5", "ticker.6"];
  const notices = noticeKeys.map((key) => t(key));
  const all = [...notices, ...notices]; // duplicate for seamless loop

  return (
    <div className="ticker-bar" role="marquee" aria-label="Public advisories and announcements" aria-live="off">
      <span className="ticker-label" aria-hidden="true">📢 {t("ticker.label")}</span>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div className="ticker-track" aria-hidden="true">
          {all.map((notice, i) => (
            <span key={i}>{notice}</span>
          ))}
        </div>
      </div>
      {/* Screen-reader-only full list */}
      <ul style={{ position: "absolute", left: "-9999px" }}>
        {notices.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  );
}
