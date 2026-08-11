import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";

type Role = "citizen" | "department_staff" | "admin";
type Actor = { id: number; name: string; email: string; role: Role; departmentId: number | null };

const categories: Record<string, { name: string; sla: number }> = {
  civic_infra: { name: "Civic & Infrastructure", sla: 7 },
  health_edu: { name: "Health & Education", sla: 5 },
  law_order: { name: "Law & Order", sla: 3 },
  transport: { name: "Transport & Public Services", sla: 7 },
  employment_welfare: { name: "Employment & Welfare", sla: 10 },
};

const allowedTransitions: Record<string, string[]> = {
  submitted: ["acknowledged", "rejected"],
  acknowledged: ["in_progress", "rejected"],
  in_progress: ["resolved", "rejected"],
  resolved: ["reopened"],
  rejected: ["reopened"],
  reopened: ["acknowledged", "in_progress"],
};

async function ensureDatabase() {
  const db = env.DB;
  if (!db) throw new Error("Database binding is unavailable");
  const statements = [
    `CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL UNIQUE, region TEXT NOT NULL DEFAULT 'National Capital Region', sla_days INTEGER NOT NULL DEFAULT 7)`,
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, external_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, phone TEXT, role TEXT NOT NULL DEFAULT 'citizen', department_id INTEGER REFERENCES departments(id), created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS complaints (id INTEGER PRIMARY KEY AUTOINCREMENT, tracking_id TEXT NOT NULL UNIQUE, citizen_id INTEGER NOT NULL REFERENCES users(id), category TEXT NOT NULL, department_id INTEGER NOT NULL REFERENCES departments(id), title TEXT NOT NULL, description TEXT NOT NULL, location_text TEXT NOT NULL, latitude REAL, longitude REAL, status TEXT NOT NULL DEFAULT 'submitted', priority TEXT NOT NULL DEFAULT 'medium', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, resolved_at TEXT, sla_due_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS complaint_attachments (id INTEGER PRIMARY KEY AUTOINCREMENT, complaint_id INTEGER NOT NULL REFERENCES complaints(id), object_key TEXT NOT NULL, file_url TEXT NOT NULL, file_type TEXT NOT NULL DEFAULT 'image', uploaded_by INTEGER NOT NULL REFERENCES users(id), uploaded_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS status_history (id INTEGER PRIMARY KEY AUTOINCREMENT, complaint_id INTEGER NOT NULL REFERENCES complaints(id), old_status TEXT, new_status TEXT NOT NULL, remarks TEXT NOT NULL, changed_by INTEGER NOT NULL REFERENCES users(id), changed_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS email_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, complaint_id INTEGER NOT NULL REFERENCES complaints(id), recipient TEXT NOT NULL, subject TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued', sent_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, complaint_id INTEGER NOT NULL UNIQUE REFERENCES complaints(id), rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT, submitted_at TEXT NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id)`,
    `CREATE INDEX IF NOT EXISTS idx_complaints_department_status ON complaints(department_id, status)`,
    `CREATE INDEX IF NOT EXISTS idx_complaints_tracking ON complaints(tracking_id)`,
    `CREATE INDEX IF NOT EXISTS idx_history_complaint ON status_history(complaint_id, changed_at)`,
  ];
  await db.batch(statements.map((sql) => db.prepare(sql)));
  for (const [category, detail] of Object.entries(categories)) {
    await db.prepare(`INSERT OR IGNORE INTO departments (name, category, sla_days) VALUES (?, ?, ?)`).bind(detail.name, category, detail.sla).run();
  }
  await seedDemoData();
  return db;
}

async function seedDemoData() {
  const db = env.DB;
  const now = new Date();
  const createdAt = new Date(now.getTime() - 3 * 86400000).toISOString();
  await db.prepare(`INSERT OR IGNORE INTO users (external_id, name, email, role, created_at) VALUES ('demo-citizen', 'Aarav Sharma', 'aarav@example.in', 'citizen', ?)` ).bind(createdAt).run();
  await db.prepare(`INSERT OR IGNORE INTO users (external_id, name, email, role, department_id, created_at) SELECT 'demo-department', 'Meera Nair', 'officer@njc.demo', 'department_staff', id, ? FROM departments WHERE category='civic_infra'`).bind(createdAt).run();
  await db.prepare(`INSERT OR IGNORE INTO users (external_id, name, email, role, created_at) VALUES ('demo-admin', 'NJC Administrator', 'admin@njc.demo', 'admin', ?)` ).bind(createdAt).run();
  const count = await db.prepare(`SELECT COUNT(*) AS count FROM complaints`).first<{ count: number }>();
  if ((count?.count ?? 0) > 0) return;
  const citizen = await db.prepare(`SELECT id FROM users WHERE external_id='demo-citizen'`).first<{ id: number }>();
  const samples = [
    ["NJC-2026-000124", "civic_infra", "Broken streetlight near community park", "Three consecutive streetlights have stopped working, making the lane unsafe after sunset.", "Sector 14, Community Park Road", "in_progress", "high", 6],
    ["NJC-2026-000123", "transport", "Bus shelter roof damaged", "The shelter roof is partially detached and needs urgent repair before the monsoon.", "Central Bus Stand, Gate 2", "acknowledged", "medium", 2],
    ["NJC-2026-000122", "health_edu", "Water cooler not functional at school", "Students do not have access to drinking water during school hours.", "Government Senior Secondary School", "resolved", "high", 8],
    ["NJC-2026-000121", "employment_welfare", "Pension application pending verification", "Application has remained at document verification for over three weeks.", "Ward 9 Facilitation Centre", "submitted", "medium", 1],
  ];
  for (const [tracking, category, title, description, location, status, priority, age] of samples) {
    const department = await db.prepare(`SELECT id, sla_days FROM departments WHERE category=?`).bind(category).first<{ id: number; sla_days: number }>();
    const made = new Date(now.getTime() - Number(age) * 86400000);
    const due = new Date(made.getTime() + (department?.sla_days ?? 7) * 86400000);
    const result = await db.prepare(`INSERT INTO complaints (tracking_id, citizen_id, category, department_id, title, description, location_text, status, priority, created_at, updated_at, resolved_at, sla_due_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(tracking, citizen!.id, category, department!.id, title, description, location, status, priority, made.toISOString(), now.toISOString(), status === "resolved" ? now.toISOString() : null, due.toISOString()).run();
    const complaintId = Number(result.meta.last_row_id);
    await db.prepare(`INSERT INTO status_history (complaint_id, old_status, new_status, remarks, changed_by, changed_at) VALUES (?, NULL, 'submitted', 'Complaint received and routed automatically.', ?, ?)` ).bind(complaintId, citizen!.id, made.toISOString()).run();
    if (status !== "submitted") await db.prepare(`INSERT INTO status_history (complaint_id, old_status, new_status, remarks, changed_by, changed_at) VALUES (?, 'submitted', ?, ?, ?, ?)` ).bind(complaintId, status, status === "resolved" ? "Repair completed and verified by the field team." : "Department team has reviewed the complaint.", citizen!.id, now.toISOString()).run();
  }
}

async function actorFor(request: NextRequest): Promise<Actor | null> {
  const db = env.DB;
  const userId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  const local = new URL(request.url).hostname === "localhost" || new URL(request.url).hostname === "127.0.0.1";
  const demoRole = local ? request.headers.get("x-demo-role") : null;
  const externalId = userId ?? (demoRole === "admin" ? "demo-admin" : demoRole === "department_staff" ? "demo-department" : local ? "demo-citizen" : null);
  if (!externalId) return null;
  if (userId && email) {
    const fullName = request.headers.get("oai-authenticated-user-full-name");
    let name = email;
    try { if (fullName) name = decodeURIComponent(fullName); } catch {}
    await db.prepare(`INSERT INTO users (external_id, name, email, role, created_at) VALUES (?, ?, ?, 'citizen', ?) ON CONFLICT(external_id) DO UPDATE SET name=excluded.name, email=excluded.email`).bind(userId, name, email, new Date().toISOString()).run();
  }
  const row = await db.prepare(`SELECT id, name, email, role, department_id AS departmentId FROM users WHERE external_id=?`).bind(externalId).first<Actor>();
  return row ?? null;
}

function complaintSelect(where = "", order = "ORDER BY c.created_at DESC") {
  return `SELECT c.id, c.tracking_id AS trackingId, c.title, c.description, c.location_text AS location, c.category, c.status, c.priority, c.created_at AS createdAt, c.updated_at AS updatedAt, c.sla_due_at AS slaDueAt, c.resolved_at AS resolvedAt, d.name AS department, d.id AS departmentId, u.name AS citizenName FROM complaints c JOIN departments d ON d.id=c.department_id JOIN users u ON u.id=c.citizen_id ${where} ${order}`;
}

async function withHistory(complaint: Record<string, unknown>) {
  const history = await env.DB.prepare(`SELECT sh.old_status AS oldStatus, sh.new_status AS newStatus, sh.remarks, sh.changed_at AS changedAt, u.name AS changedBy FROM status_history sh JOIN users u ON u.id=sh.changed_by WHERE sh.complaint_id=? ORDER BY sh.changed_at`).bind(complaint.id).all();
  return { ...complaint, history: history.results };
}

export async function GET(request: NextRequest) {
  try {
    const db = await ensureDatabase();
    const scope = request.nextUrl.searchParams.get("scope") ?? "stats";
    if (scope === "track") {
      const tracking = (request.nextUrl.searchParams.get("tracking") ?? "").trim().toUpperCase();
      const complaint = await db.prepare(complaintSelect(`WHERE c.tracking_id=?`, "")).bind(tracking).first<Record<string, unknown>>();
      return complaint ? NextResponse.json(await withHistory(complaint)) : NextResponse.json({ error: "Tracking ID not found" }, { status: 404 });
    }
    if (scope === "stats") {
      const summary = await db.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) AS resolved, SUM(CASE WHEN status NOT IN ('resolved','rejected') THEN 1 ELSE 0 END) AS active, ROUND(AVG(CASE WHEN resolved_at IS NOT NULL THEN julianday(resolved_at)-julianday(created_at) END),1) AS avgDays FROM complaints`).first();
      const departments = await db.prepare(`SELECT d.name, d.category, COUNT(c.id) AS total, SUM(CASE WHEN c.status='resolved' THEN 1 ELSE 0 END) AS resolved FROM departments d LEFT JOIN complaints c ON c.department_id=d.id GROUP BY d.id ORDER BY d.id`).all();
      return NextResponse.json({ summary, departments: departments.results });
    }
    const actor = await actorFor(request);
    if (!actor) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    if (scope === "mine") {
      const rows = await db.prepare(complaintSelect(`WHERE c.citizen_id=?`)).bind(actor.id).all();
      return NextResponse.json({ actor, complaints: rows.results });
    }
    if (scope === "department") {
      if (actor.role !== "department_staff" && actor.role !== "admin") return NextResponse.json({ error: "Department access required" }, { status: 403 });
      const rows = actor.role === "admin" ? await db.prepare(complaintSelect()).all() : await db.prepare(complaintSelect(`WHERE c.department_id=?`)).bind(actor.departmentId).all();
      return NextResponse.json({ actor, complaints: rows.results });
    }
    if (scope === "admin") {
      if (actor.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      const complaints = await db.prepare(complaintSelect()).all();
      const summary = await db.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) AS resolved, SUM(CASE WHEN julianday(sla_due_at) < julianday('now') AND status NOT IN ('resolved','rejected') THEN 1 ELSE 0 END) AS overdue FROM complaints`).first();
      return NextResponse.json({ actor, complaints: complaints.results, summary });
    }
    return NextResponse.json({ error: "Unknown scope" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await ensureDatabase();
    const actor = await actorFor(request);
    if (!actor) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = await request.json() as { action?: string; complaintId?: number; rating?: number; comment?: string };
      if (payload.action !== "feedback" || !payload.complaintId || !payload.rating || payload.rating < 1 || payload.rating > 5) return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
      const owned = await db.prepare(`SELECT id FROM complaints WHERE id=? AND citizen_id=? AND status='resolved'`).bind(payload.complaintId, actor.id).first();
      if (!owned) return NextResponse.json({ error: "Only resolved complaints you filed can be rated" }, { status: 403 });
      await db.prepare(`INSERT INTO feedback (complaint_id, rating, comment, submitted_at) VALUES (?, ?, ?, ?) ON CONFLICT(complaint_id) DO UPDATE SET rating=excluded.rating, comment=excluded.comment, submitted_at=excluded.submitted_at`).bind(payload.complaintId, payload.rating, payload.comment ?? "", new Date().toISOString()).run();
      return NextResponse.json({ ok: true });
    }
    const form = await request.formData();
    const category = String(form.get("category") ?? "");
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    if (!categories[category] || title.length < 6 || description.length < 20 || !location) return NextResponse.json({ error: "Please complete all complaint details" }, { status: 400 });
    const recent = await db.prepare(`SELECT COUNT(*) AS count FROM complaints WHERE citizen_id=? AND created_at >= datetime('now','-1 day')`).bind(actor.id).first<{ count: number }>();
    if ((recent?.count ?? 0) >= 10) return NextResponse.json({ error: "Daily complaint limit reached" }, { status: 429 });
    const department = await db.prepare(`SELECT id, name, sla_days AS sla FROM departments WHERE category=?`).bind(category).first<{ id: number; name: string; sla: number }>();
    const seq = await db.prepare(`SELECT COALESCE(MAX(id),0)+1 AS next FROM complaints`).first<{ next: number }>();
    const trackingId = `NJC-${new Date().getFullYear()}-${String(seq?.next ?? 1).padStart(6, "0")}`;
    const now = new Date();
    const due = new Date(now.getTime() + (department?.sla ?? 7) * 86400000);
    const result = await db.prepare(`INSERT INTO complaints (tracking_id, citizen_id, category, department_id, title, description, location_text, status, priority, created_at, updated_at, sla_due_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', 'medium', ?, ?, ?)`).bind(trackingId, actor.id, category, department!.id, title, description, location, now.toISOString(), now.toISOString(), due.toISOString()).run();
    const complaintId = Number(result.meta.last_row_id);
    await db.prepare(`INSERT INTO status_history (complaint_id, old_status, new_status, remarks, changed_by, changed_at) VALUES (?, NULL, 'submitted', ?, ?, ?)`).bind(complaintId, `Complaint received and routed to ${department!.name}.`, actor.id, now.toISOString()).run();
    await db.prepare(`INSERT INTO email_logs (complaint_id, recipient, subject, status, sent_at) VALUES (?, ?, ?, 'queued', ?)`).bind(complaintId, actor.email, `${trackingId} received by ${department!.name}`, now.toISOString()).run();
    const files = form.getAll("evidence").filter((entry): entry is File => entry instanceof File && entry.size > 0);
    for (const file of files.slice(0, 4)) {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) continue;
      const key = `complaints/${complaintId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      if (env.UPLOADS) await env.UPLOADS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
      await db.prepare(`INSERT INTO complaint_attachments (complaint_id, object_key, file_url, file_type, uploaded_by, uploaded_at) VALUES (?, ?, ?, 'image', ?, ?)`).bind(complaintId, key, `/api/uploads?key=${encodeURIComponent(key)}`, actor.id, now.toISOString()).run();
    }
    return NextResponse.json({ ok: true, trackingId, department: department!.name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = await ensureDatabase();
    const actor = await actorFor(request);
    if (!actor || (actor.role !== "department_staff" && actor.role !== "admin")) return NextResponse.json({ error: "Staff access required" }, { status: 403 });
    const payload = await request.json() as { complaintId?: number; status?: string; remarks?: string; departmentId?: number };
    const complaint = await db.prepare(`SELECT id, status, citizen_id AS citizenId, department_id AS departmentId, tracking_id AS trackingId FROM complaints WHERE id=?`).bind(payload.complaintId).first<{ id: number; status: string; citizenId: number; departmentId: number; trackingId: string }>();
    if (!complaint) return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    if (actor.role === "department_staff" && actor.departmentId !== complaint.departmentId) return NextResponse.json({ error: "Complaint belongs to another department" }, { status: 403 });
    if (payload.departmentId && actor.role === "admin") {
      await db.prepare(`UPDATE complaints SET department_id=?, updated_at=? WHERE id=?`).bind(payload.departmentId, new Date().toISOString(), complaint.id).run();
      return NextResponse.json({ ok: true });
    }
    const remarks = (payload.remarks ?? "").trim();
    if (!payload.status || !allowedTransitions[complaint.status]?.includes(payload.status) || remarks.length < 5) return NextResponse.json({ error: "Select a valid next status and add a meaningful remark" }, { status: 400 });
    const now = new Date().toISOString();
    await db.batch([
      db.prepare(`UPDATE complaints SET status=?, updated_at=?, resolved_at=? WHERE id=?`).bind(payload.status, now, payload.status === "resolved" ? now : null, complaint.id),
      db.prepare(`INSERT INTO status_history (complaint_id, old_status, new_status, remarks, changed_by, changed_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(complaint.id, complaint.status, payload.status, remarks, actor.id, now),
      db.prepare(`INSERT INTO email_logs (complaint_id, recipient, subject, status, sent_at) SELECT ?, email, ?, 'queued', ? FROM users WHERE id=?`).bind(complaint.id, `${complaint.trackingId} status updated`, now, complaint.citizenId),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

