import { FormEvent, useEffect, useState } from "react";
import NamoApp from "./components/NamoApp";
import HowItWorksPage from "./components/HowItWorksPage";
import AboutPage from "./components/AboutPage";
import GalleryPage from "./components/GalleryPage";
import PrivacyPage from "./components/PrivacyPage";
import AccessibilityPage from "./components/AccessibilityPage";
import ContactPage from "./components/ContactPage";
import TermsPage from "./components/TermsPage";
import CharterPage from "./components/CharterPage";
import RtiPage from "./components/RtiPage";
import HyperlinkPage from "./components/HyperlinkPage";
import AccessibilityBar from "./components/AccessibilityBar";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { apiFetch, readJson } from "./api";
import { 
  Building2, 
  ShieldAlert, 
  Activity, 
  FileText, 
  ArrowLeft, 
  Heart, 
  Users2 
} from "lucide-react";

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
  const [error, setError] = useState(""); 
  const [busy, setBusy] = useState(false);
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [departments, setDepartments] = useState<{ id: number; name: string; category: string }[]>([]);
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDeptId, setRegDeptId] = useState("");

  useEffect(() => { if (session) localStorage.setItem("njc_staff_session", JSON.stringify(session)); }, [session]);

  useEffect(() => {
    if (portal === "department") {
      apiFetch("/api/departments")
        .then(res => res.ok ? readJson<{ departments: any[] }>(res) : Promise.reject())
        .then(data => {
          setDepartments(data.departments || []);
          if (data.departments && data.departments.length > 0) {
            setRegDeptId(String(data.departments[0].id));
          }
        })
        .catch(() => {});
    }
  }, [portal]);

  async function login(event: FormEvent<HTMLFormElement>) { 
    event.preventDefault(); 
    setBusy(true); 
    setError(""); 
    setRegSuccess("");
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
      localStorage.setItem("njc_staff_session", JSON.stringify(result));
      setSession(result); 
    } catch (caught) { 
      setError(caught instanceof Error ? caught.message : "Sign-in failed"); 
    } finally { 
      setBusy(false); 
    } 
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setRegError("");
    setRegSuccess("");
    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword, departmentId: Number(regDeptId) })
      });
      const result = await readJson<{ ok: boolean; message?: string; detail?: string }>(response);
      if (!response.ok) {
        throw new Error(result.detail || result.message || "Registration failed");
      }
      setRegSuccess("Credentials configured successfully! You can now sign in using these details.");
      setActiveTab("signin");
      setRegEmail("");
      setRegPassword("");
    } catch (caught) {
      setRegError(caught instanceof Error ? caught.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }
  const isSessionInvalid = !session ? true : (
    (portal === "admin" && session.role !== "admin") ||
    (portal === "department" && 
     !["department_staff", "admin"].includes(session.role)) ||
    (portal === "department" && 
     session.role !== "admin" && 
     departmentCategory && 
     session.department_category !== departmentCategory)
  );

  useEffect(() => {
    if (session && isSessionInvalid) {
      localStorage.removeItem("njc_staff_session");
      setSession(null);
    }
  }, [session, isSessionInvalid]);

  if (session && !isSessionInvalid) return <>{children}<button className="staff-logout" onClick={() => { localStorage.removeItem("njc_staff_session"); setSession(null); }}>Sign out</button></>;
  
  const title = portal === "admin" ? t("login.admin_signin") : `${departmentLabel} Portal`;
  const help = portal === "admin" ? t("login.admin_help") : (activeTab === "signin" ? t("login.dept_help") : "Configure new portal access credentials for your department.");
  const emailLabel = portal === "admin" ? t("login.admin_email") : t("login.email");

  return (
    <div className="portal-login-viewport">
      <div className="tricolor-stripe" aria-hidden="true"><span /><span /><span /></div>
      <AccessibilityBar />
      
      <main className="access-denied">
        <div className="staff-login-card">
          
          {/* Emblem Header */}
          <div className="login-emblem-header">
            <img src="/emblem.png" alt="Government of India Emblem" className="login-emblem-img" />
            <b className="gov-label-en">{t("a11y.gov_label")}</b>
            <span className="gov-label-hi">{t("a11y.gov_hindi")}</span>
          </div>

          <p className="secure-badge">
            {t("login.secure_portal")}
          </p>

          <h1 className="login-title">{title}</h1>
          <p className="login-desc">{help}</p>

          {portal === "department" && (
            <div className="login-tabs">
              <button
                type="button"
                className={`login-tab-btn ${activeTab === "signin" ? "active" : ""}`}
                onClick={() => { setActiveTab("signin"); setError(""); setRegError(""); }}
              >
                {language === "hi" ? "साइन इन" : "Sign In"}
              </button>
              <button
                type="button"
                className={`login-tab-btn ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => { setActiveTab("signup"); setError(""); setRegError(""); }}
              >
                {language === "hi" ? "साइन अप" : "Sign Up"}
              </button>
            </div>
          )}

          {activeTab === "signin" ? (
            <form className="login-form-fields" onSubmit={login}>
              {regSuccess && <p className="form-success-banner">{regSuccess}</p>}
              
              <label className="form-field-label">
                <span className="form-label-row">
                  <span>{emailLabel}</span>
                  <span className="hindi-hint">ईमेल पता</span>
                </span>
                <input 
                  name="identifier" 
                  type="email" 
                  required 
                  autoComplete="username" 
                  placeholder={portal === "admin" ? "admin@namo.gov.in" : "officer@namo.gov.in"}
                />
              </label>

              <label className="form-field-label">
                <span className="form-label-row">
                  <span>{t("login.password")}</span>
                  <span className="hindi-hint">पासवर्ड</span>
                </span>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  autoComplete="current-password" 
                  placeholder="••••••••••••"
                />
              </label>

              {error && <p className="form-error-banner">{error}</p>}

              <button className="btn btn-primary login-submit-btn" disabled={busy}>
                {busy ? t("login.signing_in") : t("login.signin")}
              </button>
            </form>
          ) : (
            <form className="login-form-fields" onSubmit={handleRegister}>
              <label className="form-field-label">
                <span className="form-label-row">
                  <span>Select Department</span>
                  <span className="hindi-hint">विभाग चुनें</span>
                </span>
                <select 
                  value={regDeptId}
                  onChange={(e) => setRegDeptId(e.target.value)}
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </label>

              <label className="form-field-label">
                <span className="form-label-row">
                  <span>Staff Email</span>
                  <span className="hindi-hint">ईमेल पता</span>
                </span>
                <input 
                  type="email" 
                  required 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="officer@namo.gov.in"
                />
              </label>

              <label className="form-field-label">
                <span className="form-label-row">
                  <span>Password</span>
                  <span className="hindi-hint">पासवर्ड (न्यूनतम 8 वर्ण)</span>
                </span>
                <input 
                  type="password" 
                  required 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  minLength={8}
                />
              </label>

              {regError && <p className="form-error-banner">{regError}</p>}

              <button className="btn btn-primary login-submit-btn" disabled={busy}>
                {busy ? "Registering..." : "Configure Portal Access"}
              </button>
            </form>
          )}
          
          <a href="/" className="return-home-link">
            {t("login.return")}
          </a>
        </div>
      </main>
    </div>
  );
}

function InfoPage({ data }: { data: (typeof info)[string] }) { return <div className="info-shell"><header className="info-header"><a className="brand" href="/"><span><b>NAMO</b><small>JAN CONNECT</small></span></a></header><main><section className="info-hero"><p className="eyebrow">{data.eyebrow}</p><h1>{data.title}</h1><p>{data.intro}</p></section><section className="info-section principle-grid">{data.points.map((point, index) => <article key={point}><span>0{index + 1}</span><h3>{point}</h3><p>Designed to keep the service process clear, accessible, and accountable.</p></article>)}</section></main></div>; }

function DashboardHub() {
  return (
    <main className="dashboard-hub">
      <div className="dashboard-hub-inner">
        <p className="eyebrow">PORTAL ACCESS DIRECTORY</p>
        <h1 className="launcher-title">NAMO Jan Connect Hub</h1>
        <p className="launcher-subtitle">Access municipal dashboards, citizen services tracking, and admin controls.</p>
        
        <div className="launcher-grid">
          <a href="/citizen" className="flex-col-card">
            <div className="card-icon-container bg-blue">
              <Users2 size={20} />
            </div>
            <div className="card-content">
              <b>Citizen Dashboard</b>
              <small>View filed complaints, resolution statuses, and live tracking timelines.</small>
            </div>
          </a>

          <a href="/civic-infra" className="flex-col-card">
            <div className="card-icon-container bg-amber">
              <Building2 size={20} />
            </div>
            <div className="card-content">
              <b>Civic &amp; Infrastructure</b>
              <small>Resolve civic issues, manage water, streetlights, and roads.</small>
            </div>
          </a>

          <a href="/health-education" className="flex-col-card">
            <div className="card-icon-container bg-teal">
              <Heart size={20} />
            </div>
            <div className="card-content">
              <b>Health &amp; Education</b>
              <small>Manage clinic, hospital, and school-related issues.</small>
            </div>
          </a>

          <a href="/law-order" className="flex-col-card">
            <div className="card-icon-container bg-coral">
              <ShieldAlert size={20} />
            </div>
            <div className="card-content">
              <b>Law &amp; Order</b>
              <small>Review public safety, local policing, and order complaints.</small>
            </div>
          </a>

          <a href="/transport" className="flex-col-card">
            <div className="card-icon-container bg-sky">
              <Building2 size={20} />
            </div>
            <div className="card-content">
              <b>Transport &amp; Public Services</b>
              <small>Manage transport permits, PWD roads, and transit issues.</small>
            </div>
          </a>

          <a href="/employment-welfare" className="flex-col-card">
            <div className="card-icon-container bg-green">
              <FileText size={20} />
            </div>
            <div className="card-content">
              <b>Employment &amp; Welfare</b>
              <small>Review social pensions, jobs, and social support concerns.</small>
            </div>
          </a>

          <a href="/admin" className="portal-link-admin flex-col-card">
            <div className="card-icon-container bg-navy-accent">
              <Activity size={20} />
            </div>
            <div className="card-content">
              <b>Administrator Dashboard</b>
              <small>Full oversight, department routing, and live SLA analytics.</small>
            </div>
          </a>
        </div>
        
        <a href="/" className="launcher-back-link">
          <ArrowLeft size={14} /> Return to public site
        </a>
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
  if (path === "/privacy") return <PrivacyPage />;
  if (path === "/accessibility") return <AccessibilityPage />;
  if (path === "/contact") return <ContactPage />;
  if (path === "/terms") return <TermsPage />;
  if (path === "/charter") return <CharterPage />;
  if (path === "/rti") return <RtiPage />;
  if (path === "/hyperlink") return <HyperlinkPage />;
  const dept = departmentPaths[path];
  if (dept) return <StaffLogin portal="department" departmentCategory={dept.category} departmentLabel={dept.label}><NamoApp initialPortal="department" /></StaffLogin>;
  if (info[path]) return <InfoPage data={info[path]} />;
  return <NamoApp />;
}
