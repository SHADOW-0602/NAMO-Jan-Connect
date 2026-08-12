"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LocationPicker from "./LocationPicker";
import ResolvedGallery from "./ResolvedGallery";
import { apiFetch, readJson } from "../api";

type Portal = "public" | "citizen" | "department" | "admin";
type Complaint = {
  id: number; trackingId: string; title: string; description: string; location: string;
  category: string; status: string; priority: string; createdAt: string; updatedAt: string;
  slaDueAt: string; department: string; departmentId: number; citizenName?: string; citizenEmail?: string; citizenPhone?: string;
  history?: { oldStatus: string | null; newStatus: string; remarks: string; changedAt: string; changedBy: string }[];
};
type DepartmentAccess = { departmentId: number; department: string; category: string; portalId: string; staffEmail: string | null; passwordConfigured: number };
type AdminSection = "overview" | "complaints" | "activity" | "analytics";

const categoryMeta: Record<string, { label: string; short: string; tone: string; mark: string }> = {
  civic_infra: { label: "Civic & Infrastructure", short: "Civic", tone: "amber", mark: "CI" },
  health_edu: { label: "Health & Education", short: "Health", tone: "teal", mark: "HE" },
  law_order: { label: "Law & Order", short: "Safety", tone: "coral", mark: "LO" },
  transport: { label: "Transport & Public Services", short: "Transport", tone: "blue", mark: "TP" },
  employment_welfare: { label: "Employment & Welfare", short: "Welfare", tone: "green", mark: "EW" },
};

const fallbackComplaints: Complaint[] = [
  { id: 124, trackingId: "NJC-2026-000124", title: "Broken streetlight near community park", description: "Three consecutive streetlights have stopped working, making the lane unsafe after sunset.", location: "Sector 14, Community Park Road", category: "civic_infra", status: "in_progress", priority: "high", createdAt: new Date(Date.now()-6*864e5).toISOString(), updatedAt: new Date().toISOString(), slaDueAt: new Date(Date.now()+864e5).toISOString(), department: "Civic & Infrastructure", departmentId: 1, citizenName: "Aarav Sharma" },
  { id: 123, trackingId: "NJC-2026-000123", title: "Bus shelter roof damaged", description: "The shelter roof is partially detached and needs urgent repair before the monsoon.", location: "Central Bus Stand, Gate 2", category: "transport", status: "acknowledged", priority: "medium", createdAt: new Date(Date.now()-2*864e5).toISOString(), updatedAt: new Date().toISOString(), slaDueAt: new Date(Date.now()+5*864e5).toISOString(), department: "Transport & Public Services", departmentId: 4, citizenName: "Aarav Sharma" },
  { id: 122, trackingId: "NJC-2026-000122", title: "Water cooler not functional at school", description: "Students do not have access to drinking water during school hours.", location: "Government Senior Secondary School", category: "health_edu", status: "resolved", priority: "high", createdAt: new Date(Date.now()-8*864e5).toISOString(), updatedAt: new Date().toISOString(), slaDueAt: new Date(Date.now()-3*864e5).toISOString(), department: "Health & Education", departmentId: 2, citizenName: "Aarav Sharma" },
  { id: 121, trackingId: "NJC-2026-000121", title: "Pension application pending verification", description: "Application has remained at document verification for over three weeks.", location: "Ward 9 Facilitation Centre", category: "employment_welfare", status: "submitted", priority: "medium", createdAt: new Date(Date.now()-864e5).toISOString(), updatedAt: new Date().toISOString(), slaDueAt: new Date(Date.now()+9*864e5).toISOString(), department: "Employment & Welfare", departmentId: 5, citizenName: "Aarav Sharma" },
];

const statusLabels: Record<string, string> = { submitted: "Submitted", acknowledged: "Acknowledged", in_progress: "In progress", resolved: "Resolved", rejected: "Rejected", reopened: "Reopened" };
const nextStatuses: Record<string, string[]> = { submitted: ["acknowledged", "rejected"], acknowledged: ["in_progress", "rejected"], in_progress: ["resolved", "rejected"], resolved: ["reopened"], rejected: ["reopened"], reopened: ["acknowledged", "in_progress"] };

function demoHeaders(portal: Portal): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const session = JSON.parse(localStorage.getItem("njc_staff_session") || "null") as { access_token?: string } | null;
    if (session?.access_token) return { Authorization: `Bearer ${session.access_token}` };
  } catch {}
  if (window.location.hostname === "localhost") return { "x-demo-role": portal === "department" ? "department_staff" : portal === "admin" ? "admin" : "citizen" };
  return {};
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
function daysUntil(value: string) { return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000); }

function Brand({ light = false }: { light?: boolean }) {
  return <a className={`brand ${light ? "brand-light" : ""}`} href="/" aria-label="NAMO Jan Connect home"><span className="brand-symbol"><i /><i /><i /></span><span><b>NAMO</b><small>JAN CONNECT</small></span></a>;
}

function StatusPill({ status }: { status: string }) { return <span className={`status status-${status}`}><i />{statusLabels[status] ?? status}</span>; }

function CategoryBadge({ category, full = false }: { category: string; full?: boolean }) {
  const meta = categoryMeta[category] ?? categoryMeta.civic_infra;
  return <span className={`category-badge tone-${meta.tone}`}><b>{meta.mark}</b>{full ? meta.label : meta.short}</span>;
}

function StatusTimeline({ complaint }: { complaint: Complaint }) {
  const standard = ["submitted", "acknowledged", "in_progress", "resolved"];
  const current = standard.indexOf(complaint.status);
  return <div className="timeline" aria-label={`Complaint status: ${statusLabels[complaint.status]}`}>
    {standard.map((step, index) => <div className={`timeline-step ${index <= current ? "complete" : ""} ${index === current ? "current" : ""}`} key={step}><span>{index < current ? "✓" : index + 1}</span><small>{statusLabels[step]}</small></div>)}
  </div>;
}

function Modal({ title, eyebrow, onClose, children, wide = false }: { title: string; eyebrow?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><div className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}><button className="modal-close" onClick={onClose} aria-label="Close">×</button>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{children}</div></div>;
}

export default function NamoApp({ initialPortal = "public" }: { initialPortal?: Portal }) {
  const [portal, setPortal] = useState<Portal>(initialPortal);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [complaints, setComplaints] = useState(fallbackComplaints);
  const [stats, setStats] = useState({ total: 18462, resolved: 14680, active: 3782, avgDays: 4.2 });
  const [departmentAccess, setDepartmentAccess] = useState<DepartmentAccess[]>([]);

  useEffect(() => {
    apiFetch("/api/complaints?scope=stats").then((response) => response.ok ? readJson<any>(response) : Promise.reject()).then((data) => setStats({ total: Number(data.summary.total), resolved: Number(data.summary.resolved), active: Number(data.summary.active), avgDays: Number(data.summary.avgDays ?? 0) })).catch(() => {});
  }, []);

  useEffect(() => { if (initialPortal !== "public") void loadPortal(initialPortal); }, [initialPortal]);

  async function loadPortal(next: Portal) {
    setPortal(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" });
    if (next === "public") return;
    const scope = next === "citizen" ? "mine" : next;
    try {
      const response = await apiFetch(`/api/complaints?scope=${scope}`, { headers: demoHeaders(next) });
      const data = await readJson<any>(response);
      if (response.ok) { setComplaints(data.complaints ?? []); if (data.departmentAccess) setDepartmentAccess(data.departmentAccess); }
    } catch {}
  }

  return <div className={`app portal-${portal}`}>
    {portal === "public" ? <PublicHeader onTrack={() => setTrackOpen(true)} /> : <PortalHeader portal={portal} setPortal={loadPortal} />}
    {portal === "public" && <PublicHome stats={stats} onFile={() => setFileOpen(true)} onTrack={() => setTrackOpen(true)} />}
    {portal === "citizen" && <CitizenPortal complaints={complaints} onFile={() => setFileOpen(true)} onSelect={setSelected} />}
    {portal === "department" && <DepartmentPortal complaints={complaints} onSelect={setSelected} onChanged={() => loadPortal("department")} />}
    {portal === "admin" && <AdminPortal complaints={complaints} onSelect={setSelected} stats={stats} departmentAccess={departmentAccess} />}
    {fileOpen && <ComplaintForm onClose={() => setFileOpen(false)} onCreated={(trackingId) => { setFileOpen(false); setTrackOpen(true); sessionStorage.setItem("newTrackingId", trackingId); }} />}
    {trackOpen && <TrackModal onClose={() => setTrackOpen(false)} onSelect={(complaint) => { setTrackOpen(false); setSelected(complaint); }} />}
    {selected && <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function PublicHeader({ onTrack }: { onTrack: () => void }) {
  return <header className="public-header"><Brand /><nav aria-label="Primary navigation"><a href="/how-it-works">How it works</a><a href="/about">About us</a><a href="/gallery">Solved gallery</a><button onClick={onTrack}>Track</button></nav><div className="header-actions"><ThemeToggle /></div></header>;
}

function PublicHome({ stats, onFile, onTrack }: { stats: { total: number; resolved: number; active: number; avgDays: number }; onFile: () => void; onTrack: () => void }) {
  return <main>
    <section className="hero"><div className="hero-copy"><p className="eyebrow"><span>PUBLIC SERVICE, MADE VISIBLE</span></p><h1>Every concern.<br /><em>Clearly tracked.</em></h1><p className="hero-lede">Raise a complaint in minutes, follow every action taken, and know exactly who is accountable — from submission to resolution.</p><div className="hero-actions"><button className="btn btn-primary btn-large" onClick={onFile}>File a complaint <span>↗</span></button><button className="btn btn-line btn-large" onClick={onTrack}>Track existing <span>→</span></button></div><div className="trust-note"><span className="avatar-stack"><i>A</i><i>M</i><i>R</i></span><p><b>Trusted by citizens across India</b><small>No hidden steps. No lost complaints.</small></p></div></div><div className="hero-visual" aria-label="Example complaint tracking card"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="sample-card"><div className="sample-top"><CategoryBadge category="civic_infra" /><StatusPill status="in_progress" /></div><p className="mono">NJC-2026-000124</p><h3>Broken streetlight near community park</h3><p className="sample-location">⌖ Sector 14, Community Park Road</p><StatusTimeline complaint={fallbackComplaints[0]} /><div className="sample-update"><span>MN</span><p><b>Field inspection completed</b><small>Updated today by Civic Department</small></p><i>✓</i></div></div><div className="floating-note note-routed"><span>✓</span><p><b>Auto-routed</b><small>Civic Department</small></p></div><div className="floating-note note-sla"><b>01</b><p><strong>day</strong><small>remaining in SLA</small></p></div></div></section>
    <section className="proof-strip" id="transparency"><div><b>{stats.total.toLocaleString("en-IN")}</b><span>Complaints filed</span></div><div><b>{stats.resolved.toLocaleString("en-IN")}</b><span>Resolved publicly</span></div><div><b>{stats.avgDays || 4.2}</b><span>Average days to resolve</span></div><div><b>100%</b><span>Actions timestamped</span></div></section>
    <section className="how" id="how"><div className="section-intro"><p className="eyebrow">ONE CLEAR JOURNEY</p><h2>From concern to closure,<br /><em>nothing disappears.</em></h2><p>Every complaint follows the same transparent path. You see what the department sees.</p></div><div className="steps"><article><span className="step-number">01</span><div className="step-icon">✎</div><h3>Tell us what happened</h3><p>Choose a category, describe the concern, and add photos or a precise location.</p></article><article><span className="step-number">02</span><div className="step-icon">◎</div><h3>We route it instantly</h3><p>Your complaint appears in the correct department&apos;s queue with a clear SLA.</p></article><article><span className="step-number">03</span><div className="step-icon">✓</div><h3>Follow every action</h3><p>Get updates at each stage, see staff remarks, and rate the final resolution.</p></article></div></section>
    <section className="categories"><div className="category-copy"><p className="eyebrow">FIVE ROUTES. ONE PLATFORM.</p><h2>The right concern reaches<br /><em>the right team.</em></h2></div><div className="category-grid">{Object.entries(categoryMeta).map(([key, meta]) => <article key={key} className={`category-card tone-${meta.tone}`}><span>{meta.mark}</span><h3>{meta.label}</h3><p>{key === "civic_infra" ? "Roads, water, sanitation & streetlights" : key === "health_edu" ? "Clinics, hospitals, schools & learning" : key === "law_order" ? "Public safety, policing & local order" : key === "transport" ? "Buses, roads, permits & public works" : "Jobs, pensions & social support"}</p><button onClick={onFile} aria-label={`File under ${meta.label}`}>→</button></article>)}</div></section>
    <section className="home-gallery reveal-on-view"><div className="gallery-home-heading"><div><p className="eyebrow">PROOF, NOT PROMISES</p><h2>Citizens reported it.<br /><em>Departments solved it.</em></h2></div><div><p>Published photo evidence from resolved complaints, connected to real tracking records.</p><a className="text-link" href="/gallery">Explore the resolved gallery →</a></div></div><ResolvedGallery compact /></section>
    <section className="transparency"><div className="transparency-card"><div><p className="eyebrow">PUBLIC TRANSPARENCY</p><h2>Accountability you can <em>measure.</em></h2><p>Live, anonymized outcomes show how every department is performing — no login required.</p><button className="btn btn-light" onClick={() => window.location.href = "/dashboard"}>Explore live dashboard <span>→</span></button></div><div className="mini-chart"><div className="chart-head"><p><small>Resolution rate</small><b>79.5%</b></p><span>Last 30 days</span></div><div className="bars">{[48, 67, 55, 78, 62, 84, 72, 91, 80, 88, 94, 86].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="chart-foot"><span>01 Jul</span><span>Today</span></div></div></div></section>
    <section className="final-cta"><p className="eyebrow">YOUR VOICE STARTS HERE</p><h2>A better neighbourhood begins<br />with one <em>clear report.</em></h2><button className="btn btn-primary btn-large" onClick={onFile}>File your complaint <span>↗</span></button></section>
    <Footer />
  </main>;
}

function getStaffSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("njc_staff_session") || "null") as {
      access_token: string;
      role: string;
      name: string;
      department_category?: string | null;
    } | null;
  } catch {
    return null;
  }
}

function PortalHeader({ portal, setPortal }: { portal: Portal; setPortal: (portal: Portal) => void }) {
  const session = getStaffSession();
  let title = "Administration";
  if (portal === "citizen") {
    title = "Citizen workspace";
  } else if (portal === "department") {
    const category = session?.department_category || Object.keys(categoryMeta).find(key => {
      const path = window.location.pathname.replace(/\/$/, "");
      return path === `/${key.replace("_", "-")}` || (key === "civic_infra" && path === "/civil-department");
    });
    title = category && categoryMeta[category] ? `${categoryMeta[category].short} Department` : "Department Portal";
  }
  return <header className="portal-header"><Brand /><div className="portal-title"><span />{title}</div><div className="portal-user"><ThemeToggle /><button onClick={() => { localStorage.removeItem("njc_staff_session"); window.location.href = "/"; }}>Public site</button><span>{portal === "citizen" ? "AS" : portal === "department" ? (session?.name ? session.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "DO") : "NA"}</span><p><b>{portal === "citizen" ? "Aarav Sharma" : session?.name || (portal === "department" ? "Department officer" : "NJC Admin")}</b><small>{portal === "citizen" ? "Citizen" : portal === "department" ? "Department officer" : "System administrator"}</small></p></div></header>;
}

function Sidebar({ portal, active = "overview", onAdminNavigate }: { portal: Portal; active?: AdminSection; onAdminNavigate?: (section: AdminSection) => void }) {
  if (portal === "admin") {
    const items: { key: AdminSection; icon: string; label: string }[] = [
      { key: "overview", icon: "OV", label: "Overview" }, { key: "complaints", icon: "CQ", label: "Complaints" },
      { key: "activity", icon: "AC", label: "Activity" },
      { key: "analytics", icon: "AN", label: "Analytics" },
    ];
    return <aside className="sidebar admin-sidebar"><nav aria-label="Administrator sections">{items.map((item) => <button key={item.key} type="button" className={active === item.key ? "active" : ""} onClick={() => onAdminNavigate?.(item.key)}><span>{item.icon}</span>{item.label}</button>)}</nav></aside>;
  }
  return <aside className="sidebar"><nav><button className="active"><span>OV</span>Overview</button><button><span>CQ</span>{portal === "citizen" ? "My complaints" : "Complaint queue"}</button>{portal !== "citizen" && <button><span>TW</span>Team workload</button>}<button><span>AC</span>Activity</button><button><span>ST</span>Settings</button></nav><div className="sidebar-help"><span>?</span><b>Need assistance?</b><p>Read the portal guide or contact support.</p><a href="mailto:support@namojanconnect.in">Get help →</a></div></aside>;
}

function CitizenPortal({ complaints, onFile, onSelect }: { complaints: Complaint[]; onFile: () => void; onSelect: (complaint: Complaint) => void }) {
  const active = complaints.filter((item) => !["resolved", "rejected"].includes(item.status)).length;
  return <div className="portal-shell"><Sidebar portal="citizen" /><main className="workspace"><div className="workspace-heading"><div><p className="eyebrow">TUESDAY, 11 AUGUST</p><h1>Good morning, Aarav.</h1><p>Here&apos;s what&apos;s happening with your concerns.</p></div><button className="btn btn-primary" onClick={onFile}>＋ New complaint</button></div><div className="metric-row"><Metric label="Total complaints" value={complaints.length} note="All time" /><Metric label="Active" value={active} note="Being worked on" tone="blue" /><Metric label="Resolved" value={complaints.filter((item) => item.status === "resolved").length} note="Completed" tone="green" /><Metric label="Avg. response" value="1.8d" note="First acknowledgement" /></div><section className="workspace-section"><div className="table-heading"><div><h2>Your complaints</h2><p>Every update, in one place.</p></div><button>View all →</button></div><div className="citizen-list">{complaints.map((complaint) => <button className="complaint-row" key={complaint.trackingId} onClick={() => onSelect(complaint)}><CategoryBadge category={complaint.category} /><div className="complaint-main"><p className="mono">{complaint.trackingId}</p><h3>{complaint.title}</h3><small>⌖ {complaint.location}</small></div><StatusPill status={complaint.status} /><div className="complaint-date"><b>{formatDate(complaint.updatedAt)}</b><small>Last updated</small></div><span className="row-arrow">→</span></button>)}</div></section></main></div>;
}

function Metric({ label, value, note, tone = "ink" }: { label: string; value: string | number; note: string; tone?: string }) { return <article className={`metric metric-${tone}`}><span>{label}</span><b>{value}</b><small>{note}</small></article>; }

function DepartmentPortal({ complaints, onSelect, onChanged }: { complaints: Complaint[]; onSelect: (complaint: Complaint) => void; onChanged: () => void }) {
  const [filter, setFilter] = useState("all"); const [updating, setUpdating] = useState<Complaint | null>(null);
  const visible = complaints.filter((item) => filter === "all" || item.status === filter);
  const session = getStaffSession();
  const category = session?.department_category || Object.keys(categoryMeta).find(key => {
    const path = window.location.pathname.replace(/\/$/, "");
    return path === `/${key.replace("_", "-")}` || (key === "civic_infra" && path === "/civil-department");
  });
  const label = category && categoryMeta[category] ? categoryMeta[category].label.toUpperCase() : "DEPARTMENT PORTAL";

  return <div className="portal-shell"><Sidebar portal="department" /><main className="workspace"><div className="workspace-heading"><div><p className="eyebrow">{label}</p><h1>Complaint queue</h1><p>Review, act, and keep citizens informed.</p></div><div className="queue-date">SLA health <b>82%</b></div></div><div className="metric-row"><Metric label="Assigned" value={complaints.length} note="Current queue" /><Metric label="Needs attention" value={complaints.filter((item) => daysUntil(item.slaDueAt) <= 1 && item.status !== "resolved").length} note="SLA near or overdue" tone="coral" /><Metric label="In progress" value={complaints.filter((item) => item.status === "in_progress").length} note="Field work active" tone="blue" /><Metric label="Resolved this week" value={complaints.filter((item) => item.status === "resolved").length} note="On track" tone="green" /></div><section className="workspace-section"><div className="table-heading table-heading-filters"><div><h2>Assigned complaints</h2><p>Sorted by urgency and SLA.</p></div><div className="filters">{["all", "submitted", "acknowledged", "in_progress", "resolved"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item === "all" ? "All" : statusLabels[item]}</button>)}</div></div><div className="data-table"><div className="table-row table-labels"><span>Complaint</span><span>Citizen</span><span>Status</span><span>SLA</span><span>Action</span></div>{visible.map((complaint) => <div className="table-row" key={complaint.id}><button className="table-complaint" onClick={() => onSelect(complaint)}><CategoryBadge category={complaint.category} /><span><b>{complaint.title}</b><small>{complaint.trackingId}</small></span></button><span>{complaint.citizenName ?? "Citizen"}</span><StatusPill status={complaint.status} /><span className={daysUntil(complaint.slaDueAt) <= 1 && complaint.status !== "resolved" ? "sla-danger" : ""}>{complaint.status === "resolved" ? "Completed" : daysUntil(complaint.slaDueAt) < 0 ? `${Math.abs(daysUntil(complaint.slaDueAt))}d overdue` : `${daysUntil(complaint.slaDueAt)}d left`}</span><button className="btn btn-small" onClick={() => setUpdating(complaint)}>Update</button></div>)}</div></section>{updating && <UpdateModal complaint={updating} onClose={() => setUpdating(null)} onChanged={() => { setUpdating(null); onChanged(); }} />}</main></div>;
}

function AdminPortal({ complaints, onSelect, stats, departmentAccess }: { complaints: Complaint[]; onSelect: (complaint: Complaint) => void; stats: { total: number; resolved: number; active: number; avgDays: number }; departmentAccess: DepartmentAccess[] }) {
  const [section, setSection] = useState<AdminSection>("overview");
  return <div className="portal-shell"><Sidebar portal="admin" active={section} onAdminNavigate={setSection} /><main className="workspace admin-workspace">
    {section === "overview" && <AdminOverview complaints={complaints} stats={stats} departmentAccess={departmentAccess} onSelect={onSelect} onNavigate={setSection} />}
    {section === "complaints" && <AdminComplaintQueue complaints={complaints} onSelect={onSelect} />}
    {section === "activity" && <AdminActivity complaints={complaints} onSelect={onSelect} />}
    {section === "analytics" && <AdminAnalytics complaints={complaints} stats={stats} />}
  </main></div>;
}

function AdminPageHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="workspace-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div></div>;
}

function departmentPerformance(complaints: Complaint[]) {
  return Object.entries(categoryMeta).map(([category, meta]) => {
    const items = complaints.filter((item) => item.category === category);
    const solved = items.filter((item) => item.status === "resolved").length;
    return { category, name: meta.label, solved, pending: items.length - solved, total: items.length };
  });
}

function DepartmentPerformanceChart({ complaints }: { complaints: Complaint[] }) {
  const rows = departmentPerformance(complaints); const max = Math.max(...rows.map((row) => row.total), 1);
  return <section className="workspace-section performance-card"><div className="table-heading"><div><h2>Department resolution performance</h2><p>Solved and pending complaints by responsible department.</p></div><div className="chart-legend"><span><i className="legend-solved" />Solved</span><span><i className="legend-pending" />Pending</span></div></div><div className="department-performance">{rows.map((row) => <div className="performance-row" key={row.category}><div><CategoryBadge category={row.category} /><span>{row.name}</span></div><div className="stack-track" aria-label={`${row.name}: ${row.solved} solved, ${row.pending} pending`}><i className="stack-solved" style={{ width: `${row.solved / max * 100}%` }} /><i className="stack-pending" style={{ width: `${row.pending / max * 100}%` }} /></div><b>{row.solved}</b><strong>{row.pending}</strong></div>)}</div></section>;
}

function EmptyAdminState({ text }: { text: string }) { return <div className="admin-empty"><span>0</span><h3>Nothing to show yet</h3><p>{text}</p></div>; }
function AdminTableHeader() { return <div className="table-row table-labels"><span>Complaint / citizen</span><span>Department</span><span>Status</span><span>Filed</span><span></span></div>; }
function AdminComplaintRow({ complaint, onSelect }: { complaint: Complaint; onSelect: (complaint: Complaint) => void }) { return <div className="table-row"><button className="table-complaint" onClick={() => onSelect(complaint)}><CategoryBadge category={complaint.category} /><span><b>{complaint.title}</b><small>{complaint.citizenName ?? "Citizen"} · {complaint.trackingId}</small></span></button><span>{complaint.department}</span><StatusPill status={complaint.status} /><span>{formatDate(complaint.createdAt)}</span><button className="row-action" onClick={() => onSelect(complaint)}>View</button></div>; }

function AdminOverview({ complaints, stats, departmentAccess, onSelect, onNavigate }: { complaints: Complaint[]; stats: { total: number; resolved: number; active: number; avgDays: number }; departmentAccess: DepartmentAccess[]; onSelect: (complaint: Complaint) => void; onNavigate: (section: AdminSection) => void }) {
  const overdue = complaints.filter((item) => daysUntil(item.slaDueAt) < 0 && !["resolved", "rejected"].includes(item.status)).length;
  return <><AdminPageHeading eyebrow="PLATFORM OVERSIGHT" title="Administrator control centre" copy="A live view of complaints, department ownership, progress, and service outcomes." /><div className="metric-row"><Metric label="All complaints" value={stats.total.toLocaleString("en-IN")} note="Platform lifetime" /><Metric label="Active workload" value={stats.active.toLocaleString("en-IN")} note="Still being handled" tone="blue" /><Metric label="SLA overdue" value={overdue} note="Requires intervention" tone="coral" /><Metric label="Resolution rate" value={`${stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} note={`${departmentAccess.length || 5} departments`} tone="green" /></div><DepartmentPerformanceChart complaints={complaints} /><section className="workspace-section"><div className="table-heading"><div><h2>Recent complaints</h2><p>Latest activity across the platform.</p></div><button type="button" onClick={() => onNavigate("complaints")}>View complaint queue →</button></div>{complaints.length ? <div className="data-table"><AdminTableHeader />{complaints.slice(0, 6).map((complaint) => <AdminComplaintRow complaint={complaint} onSelect={onSelect} key={complaint.id} />)}</div> : <EmptyAdminState text="New citizen complaints will appear here as soon as they are filed." />}</section></>;
}

function AdminComplaintQueue({ complaints, onSelect }: { complaints: Complaint[]; onSelect: (complaint: Complaint) => void }) {
  const [status, setStatus] = useState("all"); const [query, setQuery] = useState("");
  const visible = complaints.filter((item) => (status === "all" || item.status === status) && `${item.title} ${item.trackingId} ${item.citizenName ?? ""} ${item.department}`.toLowerCase().includes(query.toLowerCase()));
  return <><AdminPageHeading eyebrow="CASE MANAGEMENT" title="All complaints" copy="Search every citizen report and filter the queue by its current status." /><section className="workspace-section"><div className="admin-toolbar"><label>Search complaints<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tracking ID, citizen, title or department" /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><span>{visible.length} result{visible.length === 1 ? "" : "s"}</span></div>{visible.length ? <div className="data-table"><AdminTableHeader />{visible.map((complaint) => <AdminComplaintRow complaint={complaint} onSelect={onSelect} key={complaint.id} />)}</div> : <EmptyAdminState text="No complaints match the selected filters." />}</section></>;
}

function AdminActivity({ complaints, onSelect }: { complaints: Complaint[]; onSelect: (complaint: Complaint) => void }) {
  const [status, setStatus] = useState("all"); const items = [...complaints].filter((item) => status === "all" || item.status === status).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return <><AdminPageHeading eyebrow="AUDIT TRAIL" title="Platform activity" copy="Follow recent complaint updates and department actions in chronological order." /><section className="workspace-section"><div className="table-heading"><div><h2>Latest updates</h2><p>Every item links back to its complaint record.</p></div><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter activity by status"><option value="all">All activity</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>{items.length ? <div className="activity-feed">{items.map((item) => <button type="button" onClick={() => onSelect(item)} key={item.id}><CategoryBadge category={item.category} /><div><b>{item.title}</b><p>{item.department} marked this complaint as <strong>{statusLabels[item.status]}</strong>.</p><small>{formatDate(item.updatedAt)} · {item.trackingId}</small></div><StatusPill status={item.status} /><span>→</span></button>)}</div> : <EmptyAdminState text="No activity matches this status yet." />}</section></>;
}

function AdminAnalytics({ complaints, stats }: { complaints: Complaint[]; stats: { total: number; resolved: number; active: number; avgDays: number } }) {
  const total = Math.max(stats.total, complaints.length); const solved = stats.resolved || complaints.filter((item) => item.status === "resolved").length; const pending = Math.max(total - solved, 0); const rate = total ? Math.round(solved / total * 100) : 0;
  const statuses = Object.entries(statusLabels).map(([key, label]) => ({ key, label, count: complaints.filter((item) => item.status === key).length })); const maxStatus = Math.max(...statuses.map((item) => item.count), 1);
  return <><AdminPageHeading eyebrow="SERVICE ANALYTICS" title="Resolution analytics" copy="Compare solved work, pending workload, department performance, and complaint status." /><div className="analytics-summary"><section className="workspace-section resolution-ring-card"><div className="resolution-ring" style={{ background: `conic-gradient(var(--green) 0 ${rate}%, #e8ebe8 ${rate}% 100%)` }}><div><b>{rate}%</b><span>resolved</span></div></div><div><h2>Overall resolution</h2><p><strong>{solved.toLocaleString("en-IN")}</strong> solved</p><p><strong>{pending.toLocaleString("en-IN")}</strong> pending</p><small>{total.toLocaleString("en-IN")} total complaints</small></div></section><section className="workspace-section status-chart"><div className="table-heading"><div><h2>Status distribution</h2><p>Current live complaint stages.</p></div></div><div>{statuses.map((item) => <p key={item.key}><span>{item.label}</span><i><b style={{ width: `${item.count / maxStatus * 100}%` }} /></i><strong>{item.count}</strong></p>)}</div></section></div><DepartmentPerformanceChart complaints={complaints} /></>;
}

function AdminPortalLegacy({ complaints, onSelect, stats }: { complaints: Complaint[]; onSelect: (complaint: Complaint) => void; stats: { total: number; resolved: number; active: number; avgDays: number } }) {
  const byCategory = Object.keys(categoryMeta).map((key) => ({ key, count: complaints.filter((item) => item.category === key).length })); const max = Math.max(...byCategory.map((item) => item.count), 1);
  return <div className="portal-shell"><Sidebar portal="admin" /><main className="workspace"><div className="workspace-heading"><div><p className="eyebrow">PLATFORM OVERSIGHT</p><h1>Good morning, Administrator.</h1><p>A clear view of service delivery across every department.</p></div><button className="btn btn-line">Export report ↓</button></div><div className="metric-row"><Metric label="All complaints" value={stats.total.toLocaleString("en-IN")} note="Platform lifetime" /><Metric label="Active workload" value={stats.active.toLocaleString("en-IN")} note="Across 5 departments" tone="blue" /><Metric label="SLA breaches" value={complaints.filter((item) => daysUntil(item.slaDueAt) < 0 && !["resolved", "rejected"].includes(item.status)).length} note="Needs intervention" tone="coral" /><Metric label="Resolution rate" value={`${stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} note="All departments" tone="green" /></div><div className="admin-grid"><section className="workspace-section analytics-card"><div className="table-heading"><div><h2>Volume by category</h2><p>Current complaint mix</p></div><select aria-label="Analytics range"><option>Last 30 days</option></select></div><div className="horizontal-bars">{byCategory.map((item) => <div key={item.key}><span>{categoryMeta[item.key].short}</span><i><b className={`tone-bg-${categoryMeta[item.key].tone}`} style={{ width: `${Math.max(10, item.count / max * 100)}%` }} /></i><strong>{item.count}</strong></div>)}</div></section><section className="workspace-section health-card"><div className="table-heading"><div><h2>Department health</h2><p>SLA performance this month</p></div></div>{Object.entries(categoryMeta).map(([key, meta], index) => <div className="health-row" key={key}><CategoryBadge category={key} /><span>{meta.label}</span><b>{[91, 86, 78, 83, 89][index]}%</b><i><em style={{ width: `${[91, 86, 78, 83, 89][index]}%` }} /></i></div>)}</section></div><section className="workspace-section"><div className="table-heading"><div><h2>Recent platform activity</h2><p>Latest complaints across departments.</p></div><button>Review audit log →</button></div><div className="data-table"><div className="table-row table-labels"><span>Complaint</span><span>Department</span><span>Status</span><span>Filed</span><span></span></div>{complaints.slice(0, 5).map((complaint) => <div className="table-row" key={complaint.id}><button className="table-complaint" onClick={() => onSelect(complaint)}><CategoryBadge category={complaint.category} /><span><b>{complaint.title}</b><small>{complaint.trackingId}</small></span></button><span>{complaint.department}</span><StatusPill status={complaint.status} /><span>{formatDate(complaint.createdAt)}</span><button className="row-action" onClick={() => onSelect(complaint)}>→</button></div>)}</div></section></main></div>;
}

function ComplaintForm({ onClose, onCreated }: { onClose: () => void; onCreated: (trackingId: string) => void }) {
  const [step, setStep] = useState(1); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [files, setFiles] = useState<File[]>([]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (step < 2) { setStep(2); return; } setBusy(true); setError(""); try { const form = new FormData(event.currentTarget); files.forEach((file) => form.append("evidence", file)); const response = await apiFetch("/api/complaints", { method: "POST", body: form }); const data = await readJson<any>(response); if (!response.ok) throw new Error(data.error); onCreated(data.trackingId); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not submit complaint"); } finally { setBusy(false); } }
  return <Modal title="File a complaint" eyebrow="NO ACCOUNT OR LOGIN REQUIRED" onClose={onClose} wide><p className="no-login-note">Your contact details let the department send updates. They are never displayed in the public gallery.</p><div className="form-progress"><span className="active"><i>1</i>Contact & concern</span><em /><span className={step >= 2 ? "active" : ""}><i>2</i>Evidence & review</span></div><form className="complaint-form" onSubmit={submit}><div className={step === 1 ? "form-step" : "form-step hidden"}><div className="contact-fields"><label>Your name<input name="citizenName" minLength={2} maxLength={100} required placeholder="Full name" /></label><label>Phone number<input name="citizenPhone" type="tel" inputMode="tel" pattern="\+?[0-9]{10,15}" required placeholder="+91 9876543210" /></label><label>Email address<input name="citizenEmail" type="email" required placeholder="you@example.com" /></label></div><label>What is this about?<select name="category" required defaultValue=""><option value="" disabled>Select a category</option>{Object.entries(categoryMeta).map(([key, meta]) => <option value={key} key={key}>{meta.label}</option>)}</select></label><label>Give it a short title<input name="title" minLength={6} maxLength={120} required placeholder="e.g. Streetlight not working near the park" /></label><label>Describe what happened<textarea name="description" minLength={20} maxLength={2000} required placeholder="Share details that help the department act..." rows={5} /></label><LocationPicker /></div><div className={step === 2 ? "form-step" : "form-step hidden"}><div className="upload-zone"><span>+</span><h3>Add photo evidence</h3><p>Up to 4 images, 5 MB each. JPG, PNG or WEBP.</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0,4))} aria-label="Upload evidence photos" />{files.length > 0 && <b>{files.length} photo{files.length > 1 ? "s" : ""} selected</b>}</div><div className="consent"><span>OK</span><p><b>Your privacy matters</b><small>Personal details are used only to process your complaint. Public statistics are anonymized.</small></p></div></div>{error && <p className="form-error">{error}</p>}<div className="form-actions">{step === 2 && <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>}<button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Submitting..." : step === 1 ? "Continue" : "Submit complaint"}</button></div></form></Modal>;
}

function ComplaintFormLegacy({ onClose, onCreated }: { onClose: () => void; onCreated: (trackingId: string) => void }) {
  const [step, setStep] = useState(1); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const formRef = useRef<HTMLFormElement>(null); const [files, setFiles] = useState<File[]>([]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (step < 2) { setStep(2); return; } setBusy(true); setError(""); try { const form = new FormData(event.currentTarget); files.forEach((file) => form.append("evidence", file)); const response = await apiFetch("/api/complaints", { method: "POST", headers: demoHeaders("citizen"), body: form }); const data = await readJson<any>(response); if (!response.ok) throw new Error(data.error); onCreated(data.trackingId); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not submit complaint"); } finally { setBusy(false); } }
  return <Modal title="File a complaint" eyebrow="CLEAR DETAILS, FASTER ACTION" onClose={onClose} wide><div className="form-progress"><span className="active"><i>1</i>Concern</span><em /><span className={step >= 2 ? "active" : ""}><i>2</i>Evidence & review</span></div><form ref={formRef} className="complaint-form" onSubmit={submit}><div className={step === 1 ? "form-step" : "form-step hidden"}><label>What is this about?<select name="category" required defaultValue=""><option value="" disabled>Select a category</option>{Object.entries(categoryMeta).map(([key, meta]) => <option value={key} key={key}>{meta.label}</option>)}</select></label><label>Give it a short title<input name="title" minLength={6} maxLength={120} required placeholder="e.g. Streetlight not working near the park" /></label><label>Describe what happened<textarea name="description" minLength={20} maxLength={2000} required placeholder="Share the details that will help the department act..." rows={5} /></label><LocationPicker /></div><div className={step === 2 ? "form-step" : "form-step hidden"}><div className="upload-zone"><span>＋</span><h3>Add photo evidence</h3><p>Up to 4 images, 5 MB each. JPG, PNG or WEBP.</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0,4))} aria-label="Upload evidence photos" />{files.length > 0 && <b>{files.length} photo{files.length > 1 ? "s" : ""} selected</b>}</div><div className="consent"><span>✓</span><p><b>Your privacy matters</b><small>Personal details are used only to process your complaint. Public statistics are anonymized.</small></p></div></div>{error && <p className="form-error">{error}</p>}<div className="form-actions">{step === 2 && <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>}<button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Submitting..." : step === 1 ? "Continue →" : "Submit complaint ↗"}</button></div></form></Modal>;
}

function TrackModal({ onClose, onSelect }: { onClose: () => void; onSelect: (complaint: Complaint) => void }) {
  const [tracking, setTracking] = useState(""); const [result, setResult] = useState<Complaint | null>(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { const fresh = sessionStorage.getItem("newTrackingId"); if (fresh) { setTracking(fresh); sessionStorage.removeItem("newTrackingId"); } }, []);
  async function search(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const response = await apiFetch(`/api/complaints?scope=track&tracking=${encodeURIComponent(tracking)}`); const data = await readJson<any>(response); if (!response.ok) throw new Error(data.error); setResult(data); } catch (caught) { const fallback = fallbackComplaints.find((item) => item.trackingId === tracking.toUpperCase()); if (fallback) setResult(fallback); else setError(caught instanceof Error ? caught.message : "Tracking ID not found"); } finally { setBusy(false); } }
  return <Modal title="Track a complaint" eyebrow="PUBLIC TRACKING" onClose={onClose}><p className="modal-lede">Enter the tracking ID from your confirmation email.</p><form className="track-form" onSubmit={search}><input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="NJC-2026-000124" aria-label="Complaint tracking ID" required /><button className="btn btn-primary" disabled={busy}>{busy ? "Finding..." : "Track →"}</button></form><button className="example-id" onClick={() => setTracking("NJC-2026-000124")}>Try example: NJC-2026-000124</button>{error && <p className="form-error">{error}</p>}{result && <button className="track-result" onClick={() => onSelect(result)}><div><CategoryBadge category={result.category} /><StatusPill status={result.status} /></div><p className="mono">{result.trackingId}</p><h3>{result.title}</h3><StatusTimeline complaint={result} /><span>Open full timeline →</span></button>}</Modal>;
}

function ComplaintDetail({ complaint, onClose }: { complaint: Complaint; onClose: () => void }) {
  const history = complaint.history ?? [{ oldStatus: null, newStatus: "submitted", remarks: "Complaint received and routed automatically.", changedAt: complaint.createdAt, changedBy: complaint.citizenName ?? "Citizen" }, ...(complaint.status !== "submitted" ? [{ oldStatus: "submitted", newStatus: complaint.status, remarks: complaint.status === "resolved" ? "Work completed and resolution verified." : "The department has reviewed this complaint.", changedAt: complaint.updatedAt, changedBy: "Department officer" }] : [])];
  return <Modal title={complaint.title} eyebrow={complaint.trackingId} onClose={onClose} wide><div className="detail-top"><CategoryBadge category={complaint.category} full /><StatusPill status={complaint.status} /></div><p className="detail-location">Location: {complaint.location}</p><StatusTimeline complaint={complaint} /><div className="detail-grid"><div><h3>Complaint details</h3><p>{complaint.description}</p><dl><div><dt>Citizen</dt><dd>{complaint.citizenName ?? "Citizen"}</dd></div>{complaint.citizenEmail && <div><dt>Email</dt><dd><a href={`mailto:${complaint.citizenEmail}`}>{complaint.citizenEmail}</a></dd></div>}{complaint.citizenPhone && <div><dt>Phone</dt><dd><a href={`tel:${complaint.citizenPhone}`}>{complaint.citizenPhone}</a></dd></div>}<div><dt>Assigned department</dt><dd>{complaint.department}</dd></div><div><dt>Filed on</dt><dd>{formatDate(complaint.createdAt)}</dd></div><div><dt>Priority</dt><dd>{complaint.priority}</dd></div><div><dt>SLA target</dt><dd>{formatDate(complaint.slaDueAt)}</dd></div></dl></div><div className="history"><h3>Action history</h3>{history.map((item, index) => <article key={`${item.changedAt}-${index}`}><i>{index + 1}</i><div><b>{statusLabels[item.newStatus]}</b><p>{item.remarks}</p><small>{formatDate(item.changedAt)} · {item.changedBy}</small></div></article>)}</div></div></Modal>;
}

function ComplaintDetailLegacy({ complaint, onClose }: { complaint: Complaint; onClose: () => void }) {
  const history = complaint.history ?? [{ oldStatus: null, newStatus: "submitted", remarks: "Complaint received and routed automatically.", changedAt: complaint.createdAt, changedBy: complaint.citizenName ?? "Citizen" }, ...(complaint.status !== "submitted" ? [{ oldStatus: "submitted", newStatus: complaint.status, remarks: complaint.status === "resolved" ? "Work completed and resolution verified." : "The department has reviewed this complaint.", changedAt: complaint.updatedAt, changedBy: "Department officer" }] : [])];
  return <Modal title={complaint.title} eyebrow={complaint.trackingId} onClose={onClose} wide><div className="detail-top"><CategoryBadge category={complaint.category} full /><StatusPill status={complaint.status} /></div><p className="detail-location">⌖ {complaint.location}</p><StatusTimeline complaint={complaint} /><div className="detail-grid"><div><h3>Complaint details</h3><p>{complaint.description}</p><dl><div><dt>Assigned department</dt><dd>{complaint.department}</dd></div><div><dt>Filed on</dt><dd>{formatDate(complaint.createdAt)}</dd></div><div><dt>Priority</dt><dd>{complaint.priority}</dd></div><div><dt>SLA target</dt><dd>{formatDate(complaint.slaDueAt)}</dd></div></dl></div><div className="history"><h3>Action history</h3>{history.map((item, index) => <article key={`${item.changedAt}-${index}`}><i>{index === 0 ? "✓" : "•"}</i><div><b>{statusLabels[item.newStatus]}</b><p>{item.remarks}</p><small>{formatDate(item.changedAt)} · {item.changedBy}</small></div></article>)}</div></div></Modal>;
}

function UpdateModal({ complaint, onClose, onChanged }: { complaint: Complaint; onClose: () => void; onChanged: () => void }) {
  const [status, setStatus] = useState(nextStatuses[complaint.status]?.[0] ?? ""); const [remarks, setRemarks] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [photo, setPhoto] = useState<File | null>(null);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const form = new FormData(); form.set("complaintId", String(complaint.id)); form.set("status", status); form.set("remarks", remarks); if (photo) form.set("resolutionPhoto", photo); const response = await apiFetch("/api/complaints", { method: "PATCH", headers: demoHeaders("department"), body: form }); const data = await readJson<any>(response); if (!response.ok) throw new Error(data.error); onChanged(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Update failed"); } finally { setBusy(false); } }
  return <Modal title="Update complaint" eyebrow={complaint.trackingId} onClose={onClose}><p className="modal-lede">This update will appear on the citizen&apos;s timeline and queue an email notification.</p><form className="update-form" onSubmit={submit}><label>New status<select value={status} onChange={(event) => setStatus(event.target.value)}>{(nextStatuses[complaint.status] ?? []).map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></label><label>Public remark<textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} minLength={5} required rows={4} placeholder="Explain what was done or what happens next..." /></label>{status === "resolved" && <label className="resolution-upload">Resolution photo <small>Published in the solved gallery when appropriate</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />{photo && <b>✓ {photo.name}</b>}</label>}{error && <p className="form-error">{error}</p>}<button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Publish update →"}</button></form></Modal>;
}

function Footer() { return <footer><Brand light /><div><p>Transparent public service, from first report to final resolution.</p><span>© 2026 NAMO Jan Connect</span></div><nav><a href="/how-it-works">How it works</a><a href="/about">About us</a><a href="/gallery">Solved gallery</a><a href="/privacy">Privacy</a><a href="/accessibility">Accessibility</a><a href="/contact">Contact</a></nav></footer>; }
