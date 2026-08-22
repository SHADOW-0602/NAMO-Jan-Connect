import AccessibilityBar from "./AccessibilityBar";
import GovHeader from "./GovHeader";
import TickerBanner from "./TickerBanner";
import Footer from "./Footer";
import { LanguageProvider } from "../context/LanguageContext";

interface PublicLayoutProps {
  children: React.ReactNode;
  /** Active pathname for nav highlighting */
  activePath?: string;
}

/**
 * Shared government-style layout wrapper used by every public-facing page.
 * Renders: LanguageProvider > tricolor stripe > AccessibilityBar > GovHeader > TickerBanner > {children} > Footer
 */
export default function PublicLayout({ children, activePath = "/" }: PublicLayoutProps) {
  return (
    <LanguageProvider>
      <div className="app portal-public">
        <div className="tricolor-stripe" aria-hidden="true"><span /><span /><span /></div>
        <AccessibilityBar />
        <GovHeader activePath={activePath} />
        <TickerBanner />
        {children}
        <Footer />
      </div>
    </LanguageProvider>
  );
}
