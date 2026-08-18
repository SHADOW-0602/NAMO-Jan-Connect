import { FormEvent, useEffect, useState } from "react";
import NamoApp from "./components/NamoApp";
import HowItWorksPage from "./components/HowItWorksPage";
import AboutPage from "./components/AboutPage";
import GalleryPage from "./components/GalleryPage";
import AccessibilityBar from "./components/AccessibilityBar";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { apiFetch, readJson } from "./api";

type Portal = "admin" | "department";
type Session = { access_token: string; role: string; name: string; department_category?: string | null };

const info: Record<string, { eyebrow: string; title: string; intro: string; points: string[] }> = {
  "/how-it-works": { eyebrow: "ONE CLEAR JOURNEY", title: "How it works", intro: "A complaint is routed instantly and remains traceable through every department action.", points: ["Describe the concern and pin its exact location", "Receive a public tracking ID", "Follow acknowledgement, progress, and resolution"] },
  "/about": { eyebrow: "PUBLIC SERVICE, MADE VISIBLE", title: "About us", intro: "NAMO Jan Connect gives public concerns a clear and accountable service trail.", points: ["Citizen-first reporting", "Department ownership", "Transparent outcomes"] },
  "/gallery": { eyebrow: "PROOF, NOT PROMISES", title: "Solved gallery", intro: "Verified resolution evidence is published without exposing citizen contact information.", points: ["Resolution photographs", "Department and location", "Linked public tracking records"] },
  "/privacy": { eyebrow: "PRIVACY BY DESIGN", title: "Privacy", intro: "Contact details are used only to process and update complaints.", points: ["No public email or phone display", "Role-scoped staff access", "Auditable status history"] },
  "/accessibility": { eyebrow: "ACCESS FOR EVERYONE", title: "Accessibility", intro: "The interface supports keyboard navigation, readable contrast, responsive layouts, and reduced motion.", points: ["Keyboard-friendly controls", "Light and dark themes", "Reduced-motion support"] },
  "/contact": { eyebrow: "WE ARE HERE TO HELP", title: "Contact", intro: "For support, include your tracking ID so the team can find the complaint quickly.", points: ["Complaint tracking support", "Privacy requests", "Accessibility feedback"] },
};

const departmentPaths: Record<string, { category: string; label: string }> = {
  "/civic-infra": { category: "civic_infra", label: "Civic & Infrastructure" },
  "/civil-department": { category: "civic_infra", label: "Civic & Infrastructure" },
  "/health-education": { category: "health_edu", label: "Health & Education" },
  "/law-order": { category: "law_order", label: "Law & Order" },
  "/transport": { category: "transport", label: "Transport & Public Services" },
  "/employment-welfare": { category: "employment_welfare", label: "Employment & Welfare" },
};

function StaffLogin(props: { portal: Portal; departmentCategory?: string; departmentLabel?: string; children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <StaffLoginInner {...props} />
    </LanguageProvider>
  );
}

function StaffLoginInner({ portal, departmentCategory, departmentLabel, children }: { portal: Portal; departmentCategory?: string; departmentLabel?: string; children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => { try { return JSON.parse(localStorage.getItem("njc_staff_session") || "null"); } catch { return null; } });
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => { if (session) localStorage.setItem("njc_staff_session", JSON.stringify(session)); }, [session]);
  
  async function login(event: FormEvent<HTMLFormElement>) { 
    event.preventDefault(); 
    setBusy(true); 
    setError(""); 
    const data = new FormData(event.currentTarget); 
    try { 
      const response = await apiFetch("/api/auth/login", { 
        method: "POST", 
        headers: { "content-type": "application/json" }, 
        body: JSON.stringify({ identifier: data.get("identifier"), password: data.get("password") }) 
      }); 
      const result = await readJson<Session & { detail?: string }>(response); 
      if (!response.ok) throw new Error(result.detail || "Sign-in failed"); 
      if (portal === "admin" && result.role !== "admin") throw new Error("Administrator credentials required"); 
      if (portal === "department") { 
        if (!["department_staff", "admin"].includes(result.role)) throw new Error("Department credentials required"); 
        if (result.role !== "admin" && departmentCategory && result.department_category !== departmentCategory) { 
          throw new Error(`This account does not have access to the ${departmentLabel || "requested"} portal.`); 
        } 
      } 
      setSession(result); 
    } catch (caught) { 
      setError(caught instanceof Error ? caught.message : "Sign-in failed"); 
    } finally { 
      setBusy(false); 
    } 
  }

  if (session) return <>{children}<button className="staff-logout" onClick={() => { localStorage.removeItem("njc_staff_session"); setSession(null); }}>Sign out</button></>;
  
  const title = portal === "admin" ? t("login.admin_signin") : `${departmentLabel} ${language === "hi" ? "लॉगिन" : "Sign In"}`;
  const help = portal === "admin" ? t("login.admin_help") : t("login.dept_help");
  const emailLabel = portal === "admin" ? t("login.admin_email") : t("login.email");

  return (
    <div className="portal-login-viewport" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="tricolor-stripe" aria-hidden="true"><span /><span /><span /></div>
      <AccessibilityBar />
      
      <main className="access-denied" style={{ flex: 1, display: "grid", placeItems: "center", padding: "40px 24px" }}>
        <form className="staff-login" onSubmit={login} style={{ width: "min(100%, 460px)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", padding: "36px 30px", background: "var(--surface)", display: "flex", flexDirection: "column" }}>
          
          {/* Emblem Header */}
          <div className="login-emblem-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "22px", borderBottom: "1px solid var(--border)", paddingBottom: "18px", textAlign: "center" }}>
            <img src="/emblem.png" alt="Government of India Emblem" style={{ width: "52px", height: "52px", objectFit: "contain", marginBottom: "8px" }} />
            <b style={{ fontSize: "11px", letterSpacing: "0.08em", color: "var(--ink)", textTransform: "uppercase", display: "block" }}>{t("a11y.gov_label")}</b>
            <span style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--font-devanagari)", display: "block", marginTop: "2px" }}>{t("a11y.gov_hindi")}</span>
          </div>

          <p className="eyebrow" style={{ alignSelf: "center", background: "rgba(15,46,90,0.08)", color: "var(--accent)", padding: "4px 10px", borderRadius: "12px", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
            {t("login.secure_portal")}
          </p>

          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", color: "var(--ink)", textAlign: "center", fontFamily: "var(--font-serif)" }}>{title}</h1>
          <p style={{ fontSize: "12px", color: "var(--muted)", textAlign: "center", margin: "0 0 24px", lineHeight: 1.6 }}>{help}</p>

          {/* Form Fields */}
          <label style={{ display: "grid", gap: "6px", fontSize: "11px", fontWeight: 850, color: "var(--ink)", marginBottom: "16px" }}>
            <span style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{emailLabel}</span>
              <span style={{ color: "var(--muted)", fontSize: "10px", fontWeight: 550, fontFamily: "var(--font-devanagari)" }}>ईमेल पता</span>
            </span>
            <input 
              name="identifier" 
              type="email" 
              required 
              autoComplete="username" 
              placeholder={portal === "admin" ? "admin@namo.gov.in" : "officer@namo.gov.in"}
              style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--surface)", color: "var(--ink)", outline: "none" }}
            />
          </label>

          <label style={{ display: "grid", gap: "6px", fontSize: "11px", fontWeight: 850, color: "var(--ink)", marginBottom: "20px" }}>
            <span style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{t("login.password")}</span>
              <span style={{ color: "var(--muted)", fontSize: "10px", fontWeight: 550, fontFamily: "var(--font-devanagari)" }}>पासवर्ड</span>
            </span>
            <input 
              name="password" 
              type="password" 
              required 
              autoComplete="current-password" 
              placeholder="••••••••••••"
              style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--surface)", color: "var(--ink)", outline: "none" }}
            />
          </label>

          {error && <p className="form-error" style={{ color: "var(--coral)", fontSize: "11px", fontWeight: 600, margin: "0 0 16px", textAlign: "center" }}>{error}</p>}

          <button className="btn btn-primary" disabled={busy} style={{ width: "100%", padding: "12px", fontSize: "13px", fontWeight: 700 }}>
            {busy ? t("login.signing_in") : t("login.signin")}
          </button>
          
          <a href="/" style={{ alignSelf: "center", marginTop: "18px", fontSize: "12px", color: "var(--accent-2)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {t("login.return")}
          </a>
        </form>
      </main>
    </div>
  );
}

function InfoPage({ data }: { data: (typeof info)[string] }) { return <div className="info-shell"><header className="info-header"><a className="brand" href="/"><span><b>NAMO</b><small>JAN CONNECT</small></span></a></header><main><section className="info-hero"><p className="eyebrow">{data.eyebrow}</p><h1>{data.title}</h1><p>{data.intro}</p></section><section className="info-section principle-grid">{data.points.map((point, index) => <article key={point}><span>0{index + 1}</span><h3>{point}</h3><p>Designed to keep the service process clear, accessible, and accountable.</p></article>)}</section></main></div>; }

function DashboardHub() {
  return (
    <main className="dashboard-hub">
      <div className="dashboard-hub-inner">
        <p className="eyebrow">STAFF PORTALS</p>
        <h1>Select Portal</h1>
        <a href="/citizen" className="portal-link">
          <b>Citizen Dashboard</b>
          <small>View filed complaints, resolution statuses, and live tracking timelines.</small>
        </a>
        <a href="/civic-infra" className="portal-link">
          <b>Civic &amp; Infrastructure Portal</b>
          <small>Resolve civic issues, manage water, streetlights, and roads.</small>
        </a>
        <a href="/health-education" className="portal-link">
          <b>Health &amp; Education Portal</b>
          <small>Manage clinic, hospital, and school-related issues.</small>
        </a>
        <a href="/law-order" className="portal-link">
          <b>Law &amp; Order Portal</b>
          <small>Review public safety, local policing, and order complaints.</small>
        </a>
        <a href="/transport" className="portal-link">
          <b>Transport &amp; Public Services Portal</b>
          <small>Manage transport permits, PWD roads, and transit issues.</small>
        </a>
        <a href="/employment-welfare" className="portal-link">
          <b>Employment &amp; Welfare Portal</b>
          <small>Review social pensions, jobs, and social support concerns.</small>
        </a>
        <a href="/admin" className="portal-link portal-link-admin">
          <b>Administrator Dashboard</b>
          <small>Full oversight, department routing, and live SLA analytics.</small>
        </a>
        <a href="/" style={{ display: "block", marginTop: "20px", textAlign: "center", fontSize: "12px", color: "var(--accent-2)", fontWeight: 700 }}>← Return to public site</a>
      </div>
    </main>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  // Apply saved theme before first paint (synchronous, no flash)
  let t = localStorage.getItem("njc-theme") || "light";
  if (t === "contrast") t = "light";
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t === "dark" ? "dark" : "light";
  const f = localStorage.getItem("njc-font") || "md";
  document.documentElement.dataset.fontsize = f;
  if (path === "/admin") return <StaffLogin portal="admin"><NamoApp initialPortal="admin" /></StaffLogin>;
  if (path === "/citizen") return <NamoApp initialPortal="citizen" />;
  if (path === "/dashboard") return <DashboardHub />;
  if (path === "/how-it-works") return <HowItWorksPage />;
  if (path === "/about") return <AboutPage />;
  if (path === "/gallery") return <GalleryPage />;
  const dept = departmentPaths[path];
  if (dept) return <StaffLogin portal="department" departmentCategory={dept.category} departmentLabel={dept.label}><NamoApp initialPortal="department" /></StaffLogin>;
  if (info[path]) return <InfoPage data={info[path]} />;
  return <NamoApp />;
}
