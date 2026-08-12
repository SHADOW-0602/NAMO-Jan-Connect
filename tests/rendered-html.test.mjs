import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("builds the Cloudflare Pages React application", async () => {
  const [html, app, redirects, config] = await Promise.all([
    readFile(new URL("frontend/dist/index.html", root), "utf8"),
    readFile(new URL("frontend/src/App.tsx", root), "utf8"),
    readFile(new URL("frontend/public/_redirects", root), "utf8"),
    readFile(new URL("frontend/wrangler.jsonc", root), "utf8"),
  ]);
  assert.match(html, /NAMO Jan Connect/i);
  assert.match(app, /StaffLogin/);
  assert.match(app, /departmentPaths/);
  assert.match(redirects, /index\.html 200/);
  assert.match(config, /pages_build_output_dir/);
});

test("uses FastAPI on a Python Worker with native D1 and R2 bindings", async () => {
  const [entry, workerConfig, migration, pyproject] = await Promise.all([
    readFile(new URL("backend/src/entry.py", root), "utf8"),
    readFile(new URL("backend/wrangler.jsonc", root), "utf8"),
    readFile(new URL("backend/migrations/0001_initial.sql", root), "utf8"),
    readFile(new URL("backend/pyproject.toml", root), "utf8"),
  ]);
  assert.match(entry, /class Default\(WorkerEntrypoint\)/);
  assert.match(entry, /app = FastAPI/);
  assert.match(entry, /asgi\.fetch\(app, request, self\.env\)/);
  assert.match(pyproject, /fastapi/);
  assert.match(entry, /db\.prepare\(sql\)/);
  assert.match(entry, /env\.UPLOADS\.put/);
  assert.match(workerConfig, /python_workers/);
  assert.match(workerConfig, /"binding": "DB"/);
  assert.match(workerConfig, /"binding": "UPLOADS"/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS complaints/);
  assert.match(migration, /NJC-WELFARE-01/);
  assert.doesNotMatch(pyproject, /sqlalchemy|asyncpg|aiosqlite/i);
});

test("keeps anonymous filing and server-side department isolation", async () => {
  const [ui, entry, example] = await Promise.all([
    readFile(new URL("frontend/src/components/NamoApp.tsx", root), "utf8"),
    readFile(new URL("backend/src/entry.py", root), "utf8"),
    readFile(new URL(".env.example", root), "utf8"),
  ]);
  assert.match(ui, /NO ACCOUNT OR LOGIN REQUIRED/);
  assert.match(entry, /c\.department_id=\?/);
  assert.match(entry, /Complaint belongs to another department/);
  assert.match(entry, /item\.pop\("citizenEmail"/);
  assert.match(example, /VITE_API_URL/);
  assert.doesNotMatch(example, /R2_SECRET_ACCESS_KEY|DATABASE_URL/);
});
