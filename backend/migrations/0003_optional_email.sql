PRAGMA foreign_keys=OFF;

CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'citizen',
  department_id INTEGER REFERENCES departments(id),
  created_at TEXT NOT NULL
);

INSERT INTO users_new (id, name, email, phone, role, department_id, created_at)
SELECT id, name, email, phone, role, department_id, created_at FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;

PRAGMA foreign_keys=ON;
