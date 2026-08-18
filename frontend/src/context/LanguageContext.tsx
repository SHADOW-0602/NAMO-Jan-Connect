import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "hi";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

// ─── Translation strings ────────────────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Login Page
    "login.secure_portal": "SECURE STAFF PORTAL",
    "login.admin_signin": "Administrator Sign In",
    "login.dept_signin": "Portal Sign In",
    "login.admin_help": "Use the single administrator email.",
    "login.dept_help": "Use the staff email and unique password assigned to this department portal.",
    "login.email": "Staff Email Address",
    "login.admin_email": "Administrator Email Address",
    "login.password": "Password",
    "login.signin": "Sign In",
    "login.signing_in": "Signing In...",
    "login.return": "← Return to public site",

    // Accessibility bar
    "a11y.light": "Light",
    "a11y.dark": "Dark",
    "a11y.contrast": "HC",
    "a11y.lang_switch": "हिं",
    "a11y.lang_label_switch": "Switch to Hindi",
    "a11y.gov_label": "GOVERNMENT OF INDIA",
    "a11y.gov_hindi": "भारत सरकार",

    // Gov Header nav
    "nav.how_it_works": "How It Works",
    "nav.about": "About",
    "nav.gallery": "Solved Gallery",
    "nav.track": "Track",
    "nav.officer_login": "Officer Login",
    "nav.lodge": "+ Lodge Grievance",

    // Ticker notices
    "ticker.label": "NOTICE",
    "ticker.1": "This portal is now live — file, track, and receive updates on your grievances in real time.",
    "ticker.2": "Grievances can now be filed in 12 Indian languages. More languages being added.",
    "ticker.3": "Average redressal time reduced to 14 days this quarter.",
    "ticker.4": "New: Evidence photographs from resolved cases are published in the Solved Gallery.",
    "ticker.5": "SLA breach alerts now sent to department heads automatically.",
    "ticker.6": "RTI portal integration is now available for all registered grievances.",

    // Hero
    "hero.eyebrow": "PUBLIC SERVICE, MADE VISIBLE",
    "hero.h1_line1": "Every concern.",
    "hero.h1_em": "Clearly tracked.",
    "hero.lede": "Raise a complaint in minutes, follow every action taken, and know exactly who is accountable — from submission to resolution.",
    "hero.cta_file": "File a complaint",
    "hero.cta_track": "Track existing",
    "hero.trust_note_title": "Live records only",
    "hero.trust_note_body": "Counts and outcomes come directly from the complaint database.",
    "hero.workflow_title": "Every submitted report follows a visible service trail.",
    "hero.workflow_label": "TRANSPARENT WORKFLOW",
    "hero.step_submitted": "Submitted",
    "hero.step_acknowledged": "Acknowledged",
    "hero.step_inprogress": "In progress",
    "hero.step_resolved": "Resolved",
    "hero.update_title": "Updates come from department actions",
    "hero.update_body": "Public statistics come from live records.",
    "hero.routing_title": "Automatic routing",
    "hero.routing_body": "Based on the selected department",

    // Stats strip
    "stats.filed": "Complaints filed",
    "stats.resolved": "Resolved publicly",
    "stats.active": "Currently active",
    "stats.avg_days": "Average days to resolve",

    // How section
    "how.eyebrow": "ONE CLEAR JOURNEY",
    "how.h2_line1": "From concern to closure,",
    "how.h2_em": "nothing disappears.",
    "how.intro": "Every complaint follows the same transparent path. You see what the department sees.",
    "how.step1_title": "Tell us what happened",
    "how.step1_body": "Choose a category, describe the concern, and add photos or a precise location.",
    "how.step2_title": "We route it instantly",
    "how.step2_body": "Your complaint appears in the correct department's queue with a clear SLA.",
    "how.step3_title": "Follow every action",
    "how.step3_body": "Get updates at each stage, see staff remarks, and rate the final resolution.",

    // Categories
    "cat.eyebrow": "FIVE ROUTES. ONE PLATFORM.",
    "cat.h2_line1": "The right concern reaches",
    "cat.h2_em": "the right team.",
    "cat.civic_infra": "Roads, water, sanitation & streetlights",
    "cat.health_edu": "Clinics, hospitals, schools & learning",
    "cat.law_order": "Public safety, policing & local order",
    "cat.transport": "Buses, roads, permits & public works",
    "cat.employment_welfare": "Jobs, pensions & social support",

    // Gallery
    "gallery.eyebrow": "PROOF, NOT PROMISES",
    "gallery.h2_line1": "Citizens reported it.",
    "gallery.h2_em": "Departments solved it.",
    "gallery.body": "Published photo evidence from resolved complaints, connected to real tracking records.",
    "gallery.link": "Explore the resolved gallery →",

    // Transparency
    "trans.eyebrow": "PUBLIC TRANSPARENCY",
    "trans.h2_line1": "Accountability you can",
    "trans.h2_em": "measure.",
    "trans.body": "Live, anonymized outcomes show how every department is performing — no login required.",
    "trans.cta": "Explore live dashboard →",
    "trans.rate_label": "Lifetime resolution rate",
    "trans.live": "Live database",
    "trans.resolved_count": "resolved",
    "trans.filed_count": "filed",

    // Final CTA
    "cta.eyebrow": "YOUR VOICE STARTS HERE",
    "cta.h2_line1": "A better neighbourhood begins",
    "cta.h2_line2": "with one",
    "cta.h2_em": "clear report.",
    "cta.btn": "File your complaint",

    // Footer
    "footer.brand_desc": "Transparent public service — from first report to final resolution. Every concern. Clearly tracked. Publicly accountable.",
    "footer.citizen_services": "Citizen Services",
    "footer.lodge": "Lodge Grievance",
    "footer.track_status": "Track Status",
    "footer.solved_gallery": "Solved Gallery",
    "footer.how_it_works": "How It Works",
    "footer.information": "Information",
    "footer.about": "About Portal",
    "footer.privacy": "Privacy Policy",
    "footer.accessibility": "Accessibility",
    "footer.contact": "Contact Us",
    "footer.legal": "Legal",
    "footer.terms": "Terms of Use",
    "footer.charter": "Citizen Charter",
    "footer.rti": "RTI Information",
    "footer.hyperlink": "Hyperlink Policy",
    "footer.bottom": "Website Content Managed by Department of Administrative Reforms & Public Grievances, Government of India. | Hosted by National Informatics Centre (NIC). | Last Updated: 15 August 2026 | © 2026 Government of India",
  },

  hi: {
    // Login Page
    "login.secure_portal": "सुरक्षित कर्मचारी पोर्टल",
    "login.admin_signin": "प्रशासक साइन इन",
    "login.dept_signin": "विभाग पोर्टल साइन इन",
    "login.admin_help": "एकल प्रशासक ईमेल का उपयोग करें।",
    "login.dept_help": "इस विभाग पोर्टल को सौंपे गए स्टाफ ईमेल और अद्वितीय पासवर्ड का उपयोग करें।",
    "login.email": "कर्मचारी ईमेल पता",
    "login.admin_email": "प्रशासक ईमेल पता",
    "login.password": "पासवर्ड",
    "login.signin": "साइन इन करें",
    "login.signing_in": "साइन इन हो रहा है...",
    "login.return": "← सार्वजनिक साइट पर लौटें",

    // Accessibility bar
    "a11y.light": "उजला",
    "a11y.dark": "गहरा",
    "a11y.contrast": "HC",
    "a11y.lang_switch": "EN",
    "a11y.lang_label_switch": "अंग्रेजी में देखें",
    "a11y.gov_label": "भारत सरकार",
    "a11y.gov_hindi": "GOVERNMENT OF INDIA",

    // Gov Header nav
    "nav.how_it_works": "कार्यप्रणाली",
    "nav.about": "हमारे बारे में",
    "nav.gallery": "समाधान गैलरी",
    "nav.track": "ट्रैक करें",
    "nav.officer_login": "अधिकारी लॉगिन",
    "nav.lodge": "+ शिकायत दर्ज करें",

    // Ticker
    "ticker.label": "सूचना",
    "ticker.1": "यह पोर्टल अब लाइव है — अपनी शिकायतें दर्ज करें, ट्रैक करें और रियल-टाइम अपडेट पाएं।",
    "ticker.2": "अब 12 भारतीय भाषाओं में शिकायत दर्ज की जा सकती है।",
    "ticker.3": "इस तिमाही औसत निवारण समय 14 दिन हो गया है।",
    "ticker.4": "नया: हल की गई शिकायतों के साक्ष्य चित्र समाधान गैलरी में प्रकाशित।",
    "ticker.5": "SLA उल्लंघन अलर्ट अब विभाग प्रमुखों को स्वतः भेजे जाते हैं।",
    "ticker.6": "RTI पोर्टल एकीकरण सभी पंजीकृत शिकायतों के लिए उपलब्ध है।",

    // Hero
    "hero.eyebrow": "सार्वजनिक सेवा, दृश्यमान रूप में",
    "hero.h1_line1": "हर चिंता,",
    "hero.h1_em": "स्पष्ट रूप से ट्रैक।",
    "hero.lede": "मिनटों में शिकायत दर्ज करें, हर कार्रवाई का अनुसरण करें, और जानें कि दाखिल करने से समाधान तक कौन जवाबदेह है।",
    "hero.cta_file": "शिकायत दर्ज करें",
    "hero.cta_track": "मौजूदा ट्रैक करें",
    "hero.trust_note_title": "केवल लाइव रिकॉर्ड",
    "hero.trust_note_body": "गणना और परिणाम सीधे शिकायत डेटाबेस से आते हैं।",
    "hero.workflow_title": "हर दर्ज रिपोर्ट एक दृश्य सेवा पथ का अनुसरण करती है।",
    "hero.workflow_label": "पारदर्शी कार्यप्रवाह",
    "hero.step_submitted": "दर्ज",
    "hero.step_acknowledged": "स्वीकृत",
    "hero.step_inprogress": "प्रगति में",
    "hero.step_resolved": "समाधान",
    "hero.update_title": "अपडेट विभाग की कार्रवाई से आते हैं",
    "hero.update_body": "सार्वजनिक आँकड़े लाइव रिकॉर्ड से हैं।",
    "hero.routing_title": "स्वचालित रूटिंग",
    "hero.routing_body": "चुने गए विभाग के आधार पर",

    // Stats strip
    "stats.filed": "शिकायतें दर्ज",
    "stats.resolved": "सार्वजनिक रूप से हल",
    "stats.active": "वर्तमान में सक्रिय",
    "stats.avg_days": "औसत समाधान दिन",

    // How section
    "how.eyebrow": "एक स्पष्ट यात्रा",
    "how.h2_line1": "चिंता से समाधान तक,",
    "how.h2_em": "कुछ भी गायब नहीं होता।",
    "how.intro": "हर शिकायत एक पारदर्शी पथ का अनुसरण करती है। आप वही देखते हैं जो विभाग देखता है।",
    "how.step1_title": "हमें बताएं क्या हुआ",
    "how.step1_body": "एक श्रेणी चुनें, समस्या विवरण दें, और फ़ोटो या सटीक स्थान जोड़ें।",
    "how.step2_title": "हम तुरंत रूट करते हैं",
    "how.step2_body": "आपकी शिकायत स्पष्ट SLA के साथ सही विभाग की कतार में दिखाई देती है।",
    "how.step3_title": "हर कार्रवाई का पालन करें",
    "how.step3_body": "प्रत्येक चरण पर अपडेट पाएं, कर्मचारियों की टिप्पणियाँ देखें, और अंतिम समाधान को रेट करें।",

    // Categories
    "cat.eyebrow": "पाँच मार्ग। एक मंच।",
    "cat.h2_line1": "सही चिंता पहुँचती है",
    "cat.h2_em": "सही टीम तक।",
    "cat.civic_infra": "सड़कें, पानी, सफाई और स्ट्रीटलाइट",
    "cat.health_edu": "क्लीनिक, अस्पताल, स्कूल और शिक्षा",
    "cat.law_order": "सार्वजनिक सुरक्षा, पुलिस और स्थानीय व्यवस्था",
    "cat.transport": "बसें, सड़कें, परमिट और सार्वजनिक कार्य",
    "cat.employment_welfare": "रोजगार, पेंशन और सामाजिक सहायता",

    // Gallery
    "gallery.eyebrow": "वादे नहीं, प्रमाण",
    "gallery.h2_line1": "नागरिकों ने रिपोर्ट किया।",
    "gallery.h2_em": "विभागों ने हल किया।",
    "gallery.body": "हल की गई शिकायतों से प्रकाशित फोटो साक्ष्य, वास्तविक ट्रैकिंग रिकॉर्ड से जुड़े।",
    "gallery.link": "समाधान गैलरी देखें →",

    // Transparency
    "trans.eyebrow": "सार्वजनिक पारदर्शिता",
    "trans.h2_line1": "जवाबदेही जो आप",
    "trans.h2_em": "माप सकते हैं।",
    "trans.body": "लाइव, गुमनाम परिणाम दिखाते हैं कि हर विभाग कैसा प्रदर्शन कर रहा है — बिना लॉगिन के।",
    "trans.cta": "लाइव डैशबोर्ड देखें →",
    "trans.rate_label": "आजीवन समाधान दर",
    "trans.live": "लाइव डेटाबेस",
    "trans.resolved_count": "हल",
    "trans.filed_count": "दर्ज",

    // Final CTA
    "cta.eyebrow": "आपकी आवाज़ यहाँ से शुरू होती है",
    "cta.h2_line1": "एक बेहतर पड़ोस की शुरुआत होती है",
    "cta.h2_line2": "एक",
    "cta.h2_em": "स्पष्ट रिपोर्ट से।",
    "cta.btn": "शिकायत दर्ज करें",

    // Footer
    "footer.brand_desc": "पारदर्शी सार्वजनिक सेवा — पहली रिपोर्ट से अंतिम समाधान तक। हर चिंता। स्पष्ट रूप से ट्रैक। सार्वजनिक रूप से जवाबदेह।",
    "footer.citizen_services": "नागरिक सेवाएं",
    "footer.lodge": "शिकायत दर्ज करें",
    "footer.track_status": "स्थिति ट्रैक करें",
    "footer.solved_gallery": "समाधान गैलरी",
    "footer.how_it_works": "कार्यप्रणाली",
    "footer.information": "जानकारी",
    "footer.about": "पोर्टल के बारे में",
    "footer.privacy": "गोपनीयता नीति",
    "footer.accessibility": "अभिगम्यता",
    "footer.contact": "संपर्क करें",
    "footer.legal": "कानूनी",
    "footer.terms": "उपयोग की शर्तें",
    "footer.charter": "नागरिक चार्टर",
    "footer.rti": "RTI सूचना",
    "footer.hyperlink": "हाइपरलिंक नीति",
    "footer.bottom": "वेबसाइट सामग्री प्रशासनिक सुधार और लोक शिकायत विभाग, भारत सरकार द्वारा प्रबंधित। | राष्ट्रीय सूचना विज्ञान केंद्र (NIC) द्वारा होस्ट। | अंतिम अपडेट: 15 अगस्त 2026 | © 2026 भारत सरकार",
  },
};

// ─── Provider ───────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem("njc-lang") as Language) || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    // Apply lang attribute for CSS font family switching
    document.documentElement.lang = language === "hi" ? "hi" : "en";
  }, [language]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem("njc-lang", lang);
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }

  function t(key: string): string {
    return translations[language][key] ?? translations["en"][key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
