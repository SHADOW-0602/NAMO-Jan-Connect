import { FormEvent, useEffect, useState } from "react";
import NamoApp from "./components/NamoApp";
import HowItWorksPage from "./components/HowItWorksPage";
import AboutPage from "./components/AboutPage";
import GalleryPage from "./components/GalleryPage";

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

function api(path: string) { return `${globalThis.__NJC_API_URL__ || ""}${path}`; }

function StaffLogin({ portal, departmentCategory, departmentLabel, children }: { portal: Portal; departmentCategory?: string; departmentLabel?: string; children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => { try { return JSON.parse(localStorage.getItem("njc_staff_session") || "null"); } catch { return null; } });
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (session) localStorage.setItem("njc_staff_session", JSON.stringify(session)); }, [session]);
  async function login(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget); try { const response = await fetch(api("/api/auth/login"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ identifier: data.get("identifier"), password: data.get("password") }) }); const result = await response.json(); if (!response.ok) throw new Error(result.detail || "Sign-in failed"); if (portal === "admin" && result.role !== "admin") throw new Error("Administrator credentials required"); if (portal === "department") { if (!["department_staff", "admin"].includes(result.role)) throw new Error("Department credentials required"); if (result.role !== "admin" && departmentCategory && result.department_category !== departmentCategory) { throw new Error(`This account does not have access to the ${departmentLabel || "requested"} portal.`); } } setSession(result); } catch (caught) { setError(caught instanceof Error ? caught.message : "Sign-in failed"); } finally { setBusy(false); } }
  if (session) return <>{children}<button className="staff-logout" onClick={() => { localStorage.removeItem("njc_staff_session"); setSession(null); }}>Sign out</button></>;
  return <main className="access-denied"><form className="staff-login" onSubmit={login}><p className="eyebrow">SECURE STAFF PORTAL</p><h1>{portal === "admin" ? "Administrator sign in" : `${departmentLabel} sign in`}</h1><p>{portal === "admin" ? "Use the single administrator email." : `Use the staff email and unique password assigned to the ${departmentLabel} portal.`}</p><label>{portal === "admin" ? "Administrator email" : "Department staff email"}<input name="identifier" type="email" required autoComplete="username" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="btn btn-primary" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button><a href="/">Return to public site</a></form></main>;
}

function InfoPage({ data }: { data: (typeof info)[string] }) { return <div className="info-shell"><header className="info-header"><a className="brand" href="/"><span><b>NAMO</b><small>JAN CONNECT</small></span></a></header><main><section className="info-hero"><p className="eyebrow">{data.eyebrow}</p><h1>{data.title}</h1><p>{data.intro}</p></section><section className="info-section principle-grid">{data.points.map((point, index) => <article key={point}><span>0{index + 1}</span><h3>{point}</h3><p>Designed to keep the service process clear, accessible, and accountable.</p></article>)}</section></main></div>; }

function DashboardHub() {
  return (
    <main className="access-denied" style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: "24px" }}>
      <section className="staff-login" style={{ maxWidth: "640px", width: "100%", padding: "40px" }}>
        <p className="eyebrow" style={{ color: "var(--orange)", fontWeight: 900, fontSize: "10px", margin: "0 0 12px" }}>PORTAL DASHBOARDS</p>
        <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: "28px", fontWeight: 550, margin: "0 0 24px" }}>Select Portal Dashboard</h1>
        <div style={{ display: "grid", gap: "12px", width: "100%" }}>
          <a href="/citizen" style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", display: "block", border: "1px solid var(--line)" }}>
            <b style={{ color: "var(--ink)", display: "block", fontSize: "14px" }}>Citizen Dashboard</b>
            <small style={{ color: "var(--muted)", display: "block", marginTop: "4px", fontSize: "10px", fontWeight: 500 }}>View filed complaints, resolution statuses, and live tracking timelines.</small>
          </a>
          <a href="/civic-infra" style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", display: "block", border: "1px solid var(--line)" }}>
            <b style={{ color: "var(--ink)", display: "block", fontSize: "14px" }}>Civic & Infrastructure Portal</b>
            <small style={{ color: "var(--muted)", display: "block", marginTop: "4px", fontSize: "10px", fontWeight: 500 }}>Resolve civic issues, manage water, streetlights, and roads.</small>
          </a>
          <a href="/health-education" style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", display: "block", border: "1px solid var(--line)" }}>
            <b style={{ color: "var(--ink)", display: "block", fontSize: "14px" }}>Health & Education Portal</b>
            <small style={{ color: "var(--muted)", display: "block", marginTop: "4px", fontSize: "10px", fontWeight: 500 }}>Manage clinic, hospital, and school-related issues.</small>
          </a>
          <a href="/law-order" style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", display: "block", border: "1px solid var(--line)" }}>
            <b style={{ color: "var(--ink)", display: "block", fontSize: "14px" }}>Law & Order Portal</b>
            <small style={{ color: "var(--muted)", display: "block", marginTop: "4px", fontSize: "10px", fontWeight: 500 }}>Review public safety, local policing, and order complaints.</small>
          </a>
          <a href="/transport" style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", display: "block", border: "1px solid var(--line)" }}>
            <b style={{ color: "var(--ink)", display: "block", fontSize: "14px" }}>Transport & Public Services Portal</b>
            <small style={{ color: "var(--muted)", display: "block", marginTop: "4px", fontSize: "10px", fontWeight: 500 }}>Manage transport permits, PWD roads, and transit issues.</small>
          </a>
          <a href="/employment-welfare" style={{ background: "var(--cream)", padding: "16px", borderRadius: "8px", display: "block", border: "1px solid var(--line)" }}>
            <b style={{ color: "var(--ink)", display: "block", fontSize: "14px" }}>Employment & Welfare Portal</b>
            <small style={{ color: "var(--muted)", display: "block", marginTop: "4px", fontSize: "10px", fontWeight: 500 }}>Review social pensions, jobs, and social support concerns.</small>
          </a>
          <a href="/admin" style={{ background: "var(--ink)", color: "white", padding: "16px", borderRadius: "8px", display: "block" }}>
            <b style={{ color: "var(--paper)", display: "block", fontSize: "14px" }}>Administrator Dashboard</b>
            <small style={{ color: "#aeb9b3", display: "block", marginTop: "4px", fontSize: "10px", fontWeight: 500 }}>Full oversight, department routing, and live SLA analytics.</small>
          </a>
        </div>
        <a href="/" style={{ display: "block", marginTop: "24px", textAlign: "center", fontSize: "11px", color: "var(--orange)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>Return to public site</a>
      </section>
    </main>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
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
