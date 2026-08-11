PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL DEFAULT 'National Capital Region',
  sla_days INTEGER NOT NULL DEFAULT 7
);

CREATE TABLE IF NOT EXISTS department_portals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_id INTEGER NOT NULL UNIQUE REFERENCES departments(id),
  portal_id TEXT NOT NULL UNIQUE,
  staff_email TEXT UNIQUE,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'citizen',
  department_id INTEGER REFERENCES departments(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS staff_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_id TEXT NOT NULL UNIQUE,
  citizen_id INTEGER NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_text TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  status TEXT NOT NULL DEFAULT 'submitted',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  resolved_at TEXT,
  sla_due_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS complaint_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content_type TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  uploaded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  remarks TEXT NOT NULL,
  changed_by INTEGER NOT NULL REFERENCES users(id),
  changed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  submitted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  tracking_id TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_complaints_department_status ON complaints(department_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_tracking ON complaints(tracking_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON staff_sessions(token_hash, expires_at);
CREATE INDEX IF NOT EXISTS idx_history_complaint ON status_history(complaint_id, changed_at);

INSERT OR IGNORE INTO departments (name, category, sla_days) VALUES
  ('Civic & Infrastructure', 'civic_infra', 7),
  ('Health & Education', 'health_edu', 5),
  ('Law & Order', 'law_order', 3),
  ('Transport & Public Services', 'transport', 7),
  ('Employment & Welfare', 'employment_welfare', 10);

INSERT OR IGNORE INTO department_portals (department_id, portal_id, updated_at)
  SELECT id, 'NJC-CIVIC-01', datetime('now') FROM departments WHERE category='civic_infra';
INSERT OR IGNORE INTO department_portals (department_id, portal_id, updated_at)
  SELECT id, 'NJC-HEALTH-01', datetime('now') FROM departments WHERE category='health_edu';
INSERT OR IGNORE INTO department_portals (department_id, portal_id, updated_at)
  SELECT id, 'NJC-SAFETY-01', datetime('now') FROM departments WHERE category='law_order';
INSERT OR IGNORE INTO department_portals (department_id, portal_id, updated_at)
  SELECT id, 'NJC-TRANSPORT-01', datetime('now') FROM departments WHERE category='transport';
INSERT OR IGNORE INTO department_portals (department_id, portal_id, updated_at)
  SELECT id, 'NJC-WELFARE-01', datetime('now') FROM departments WHERE category='employment_welfare';
