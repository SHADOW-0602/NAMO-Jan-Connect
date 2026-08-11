from __future__ import annotations

import hmac
import json
import secrets
import uuid
from urllib.parse import parse_qs, quote, unquote, urlparse

from workers import Response, WorkerEntrypoint

from domain import CATEGORIES, TRANSITIONS, image_extension, iso_now, make_password_hash, normalize_phone, session_expiry, sla_expiry, token_hash, valid_email, verify_password


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message
        super().__init__(message)


def as_python(value):
    return value.to_py() if hasattr(value, "to_py") else value


def as_list(value):
    converted = as_python(value)
    return list(converted) if converted is not None else []


async def db_all(db, sql: str, *params) -> list[dict]:
    raw = await db.prepare(sql).bind(*params).raw(columnNames=True)
    rows = as_list(raw)
    if not rows:
        return []
    columns = [str(item) for item in as_list(rows[0])]
    return [dict(zip(columns, as_list(row))) for row in rows[1:]]


async def db_first(db, sql: str, *params) -> dict | None:
    rows = await db_all(db, sql, *params)
    return rows[0] if rows else None


async def db_run(db, sql: str, *params):
    return await db.prepare(sql).bind(*params).run()


def env_text(env, name: str, default: str = "") -> str:
    value = getattr(env, name, default)
    return str(value) if value is not None else default


def cors_headers(env) -> dict[str, str]:
    return {
        "access-control-allow-origin": env_text(env, "FRONTEND_URL", "http://localhost:5173"),
        "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
        "access-control-allow-headers": "Authorization, Content-Type",
        "access-control-max-age": "86400",
        "vary": "Origin",
    }


def json_response(env, payload, status: int = 200) -> Response:
    headers = cors_headers(env)
    headers["content-type"] = "application/json; charset=utf-8"
    return Response(json.dumps(payload, separators=(",", ":"), default=str), status=status, headers=headers)


def error_response(env, error: ApiError) -> Response:
    return json_response(env, {"error": error.message, "detail": error.message}, error.status)


def bearer_token(request) -> str | None:
    header = request.headers.get("authorization")
    if not header or not str(header).lower().startswith("bearer "):
        return None
    return str(header).split(" ", 1)[1].strip()


async def current_user(env, request) -> dict | None:
    token = bearer_token(request)
    if not token:
        return None
    return await db_first(
        env.DB,
        """SELECT u.id, u.name, u.email, u.phone, u.role, u.department_id AS departmentId
           FROM staff_sessions s JOIN users u ON u.id=s.user_id
           WHERE s.token_hash=? AND s.expires_at > ? LIMIT 1""",
        token_hash(token), iso_now(),
    )


def require_role(user: dict | None, *roles: str) -> dict:
    if not user:
        raise ApiError(401, "Staff sign-in required")
    if user.get("role") not in roles:
        raise ApiError(403, "You do not have access to this portal")
    return user


COMPLAINT_SELECT = """
SELECT c.id, c.tracking_id AS trackingId, c.title, c.description,
       c.location_text AS location, c.latitude, c.longitude, c.category,
       c.status, c.priority, c.created_at AS createdAt, c.updated_at AS updatedAt,
       c.resolved_at AS resolvedAt, c.sla_due_at AS slaDueAt,
       d.name AS department, d.id AS departmentId,
       u.name AS citizenName, u.email AS citizenEmail, u.phone AS citizenPhone
FROM complaints c JOIN departments d ON d.id=c.department_id
JOIN users u ON u.id=c.citizen_id
"""


async def authenticate(env, request) -> Response:
    try:
        body = json.loads(await request.text())
    except Exception as exc:
        raise ApiError(400, "Invalid JSON request") from exc
    identifier = str(body.get("identifier", "")).strip().lower()
    password = str(body.get("password", ""))
    if len(identifier) < 3 or len(password) < 8:
        raise ApiError(422, "Staff email and password are required")
    now = iso_now()
    if identifier == env_text(env, "ADMIN_EMAIL").lower() and hmac.compare_digest(password, env_text(env, "ADMIN_PASSWORD")):
        await db_run(env.DB, "INSERT INTO users (name,email,role,created_at) VALUES ('NJC Administrator',?,'admin',?) ON CONFLICT(email) DO UPDATE SET role='admin', name='NJC Administrator'", identifier, now)
        user = await db_first(env.DB, "SELECT id,name,email,role,department_id AS departmentId FROM users WHERE email=?", identifier)
        department_category = None
    else:
        portal = await db_first(env.DB, """SELECT dp.department_id AS departmentId, dp.portal_id AS portalId, dp.staff_email AS staffEmail,
            dp.password_salt AS passwordSalt, dp.password_hash AS passwordHash, d.name, d.category
            FROM department_portals dp JOIN departments d ON d.id=dp.department_id
            WHERE lower(dp.staff_email)=? LIMIT 1""", identifier)
        if not portal or not portal.get("passwordSalt") or not portal.get("passwordHash") or not verify_password(password, str(portal["passwordSalt"]), str(portal["passwordHash"])):
            raise ApiError(401, "Invalid staff credentials")
        email = str(portal["staffEmail"])
        await db_run(env.DB, """INSERT INTO users (name,email,role,department_id,created_at) VALUES (?,?,'department_staff',?,?)
            ON CONFLICT(email) DO UPDATE SET role='department_staff', department_id=excluded.department_id, name=excluded.name""", f"{portal['name']} Officer", email, portal["departmentId"], now)
        user = await db_first(env.DB, "SELECT id,name,email,role,department_id AS departmentId FROM users WHERE email=?", email)
        department_category = portal["category"]
    token = secrets.token_urlsafe(32)
    ttl = int(env_text(env, "SESSION_TTL_HOURS", "12"))
    await db_run(env.DB, "INSERT INTO staff_sessions (user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?)", user["id"], token_hash(token), session_expiry(ttl), now)
    return json_response(env, {"access_token": token, "token_type": "bearer", "role": user["role"], "name": user["name"], "department_category": department_category})


async def complaint_get(env, request, query: dict[str, list[str]]) -> Response:
    scope = query.get("scope", ["stats"])[0]
    if scope == "stats":
        row = await db_first(env.DB, """SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END),0) AS resolved,
            COALESCE(SUM(CASE WHEN status NOT IN ('resolved','rejected') THEN 1 ELSE 0 END),0) AS active
            FROM complaints""") or {"total": 0, "resolved": 0, "active": 0}
        row["avgDays"] = 0
        return json_response(env, {"summary": row, "departments": []})
    if scope == "track":
        tracking = query.get("tracking", [""])[0].strip().upper()
        item = await db_first(env.DB, COMPLAINT_SELECT + " WHERE upper(c.tracking_id)=? LIMIT 1", tracking)
        if not item:
            raise ApiError(404, "Tracking ID not found")
        item["citizenName"] = "Citizen"
        item.pop("citizenEmail", None); item.pop("citizenPhone", None)
        return json_response(env, item)
    if scope == "gallery":
        origin = f"{urlparse(request.url).scheme}://{urlparse(request.url).netloc}"
        rows = await db_all(env.DB, """SELECT c.id, c.tracking_id AS trackingId, c.title, c.location_text AS location,
            c.category, c.resolved_at AS resolvedAt, d.name AS department, a.object_key AS objectKey
            FROM complaints c JOIN departments d ON d.id=c.department_id
            JOIN complaint_attachments a ON a.complaint_id=c.id AND a.file_type='resolution_image'
            WHERE c.status='resolved' ORDER BY c.resolved_at DESC LIMIT 24""")
        for row in rows:
            row["imageUrl"] = f"{origin}/api/uploads/{quote(str(row.pop('objectKey')), safe='')}"
        return json_response(env, {"items": rows})
    user = await current_user(env, request)
    if scope == "admin":
        require_role(user, "admin")
        complaints = await db_all(env.DB, COMPLAINT_SELECT + " ORDER BY c.created_at DESC")
        access = await db_all(env.DB, """SELECT dp.department_id AS departmentId, d.name AS department, d.category,
            dp.portal_id AS portalId, dp.staff_email AS staffEmail,
            CASE WHEN dp.password_hash IS NULL THEN 0 ELSE 1 END AS passwordConfigured FROM department_portals dp
            JOIN departments d ON d.id=dp.department_id ORDER BY dp.department_id""")
        return json_response(env, {"complaints": complaints, "departmentAccess": access})
    if scope == "department":
        staff = require_role(user, "department_staff", "admin")
        complaints = await db_all(env.DB, COMPLAINT_SELECT + (" ORDER BY c.created_at DESC" if staff["role"] == "admin" else " WHERE c.department_id=? ORDER BY c.created_at DESC"), *(() if staff["role"] == "admin" else (staff["departmentId"],)))
        return json_response(env, {"complaints": complaints})
    raise ApiError(400, "Unknown scope")


async def store_image(env, file, prefix: str) -> tuple[str, str]:
    content_type = str(getattr(file, "type", ""))
    try:
        extension = image_extension(content_type)
    except ValueError as exc:
        raise ApiError(422, str(exc)) from exc
    max_bytes = int(env_text(env, "MAX_UPLOAD_MB", "5")) * 1024 * 1024
    if int(getattr(file, "size", 0)) > max_bytes:
        raise ApiError(422, f"Image exceeds the {env_text(env, 'MAX_UPLOAD_MB', '5')} MB limit")
    key = f"{prefix.strip('/')}/{uuid.uuid4().hex}{extension}"
    await env.UPLOADS.put(key, file.stream(), httpMetadata={"contentType": content_type, "cacheControl": "public, max-age=31536000, immutable"})
    return key, content_type


async def complaint_create(env, request) -> Response:
    form = await request.formData()
    name = str(form.get("citizenName") or "").strip()
    email = str(form.get("citizenEmail") or "").strip().lower()
    try: phone = normalize_phone(str(form.get("citizenPhone") or ""))
    except ValueError as exc: raise ApiError(422, str(exc)) from exc
    category = str(form.get("category") or "")
    title = str(form.get("title") or "").strip()
    description = str(form.get("description") or "").strip()
    location = str(form.get("location") or "").strip()
    if len(name) < 2 or not valid_email(email): raise ApiError(422, "Provide a valid name and email")
    if category not in CATEGORIES or len(title) < 6 or len(description) < 20 or not location: raise ApiError(422, "Complete all complaint details")
    recent = await db_first(env.DB, "SELECT COUNT(*) AS total FROM complaints c JOIN users u ON u.id=c.citizen_id WHERE lower(u.email)=? AND c.created_at >= datetime('now','-1 day')", email)
    if recent and int(recent["total"]) >= 10: raise ApiError(429, "Daily complaint limit reached")
    now = iso_now()
    await db_run(env.DB, "INSERT INTO users (name,email,phone,role,created_at) VALUES (?,?,?,'citizen',?) ON CONFLICT(email) DO UPDATE SET name=excluded.name, phone=excluded.phone", name, email, phone, now)
    citizen = await db_first(env.DB, "SELECT id FROM users WHERE email=?", email)
    department = await db_first(env.DB, "SELECT id,name,sla_days AS sla FROM departments WHERE category=?", category)
    result = await db_run(env.DB, """INSERT INTO complaints (tracking_id,citizen_id,category,department_id,title,description,location_text,latitude,longitude,status,priority,created_at,updated_at,sla_due_at)
        VALUES (?,?,?,?,?,?,?,?,?,'submitted','medium',?,?,?)""", f"pending-{uuid.uuid4().hex}", citizen["id"], category, department["id"], title, description, location, form.get("latitude") or None, form.get("longitude") or None, now, now, sla_expiry(int(department["sla"])))
    complaint_id = int(result.meta.last_row_id)
    tracking_id = f"NJC-{now[:4]}-{complaint_id:06d}"
    await db_run(env.DB, "UPDATE complaints SET tracking_id=? WHERE id=?", tracking_id, complaint_id)
    await db_run(env.DB, "INSERT INTO status_history (complaint_id,old_status,new_status,remarks,changed_by,changed_at) VALUES (?,NULL,'submitted',?,?,?)", complaint_id, f"Complaint received and routed to {department['name']}.", citizen["id"], now)
    for file in as_list(form.getAll("evidence"))[:4]:
        if int(getattr(file, "size", 0)) <= 0: continue
        key, content_type = await store_image(env, file, f"complaints/{complaint_id}/evidence")
        await db_run(env.DB, "INSERT INTO complaint_attachments (complaint_id,object_key,file_type,content_type,uploaded_by,uploaded_at) VALUES (?,?,'evidence_image',?,?,?)", complaint_id, key, content_type, citizen["id"], now)
    return json_response(env, {"ok": True, "trackingId": tracking_id, "department": department["name"]}, 201)


async def complaint_patch(env, request) -> Response:
    user = await current_user(env, request)
    content_type = str(request.headers.get("content-type") or "")
    if "application/json" in content_type:
        admin = require_role(user, "admin")
        body = json.loads(await request.text())
        if body.get("action") != "assign_department" or not body.get("departmentId"): raise ApiError(400, "Invalid admin action")
        staff_email = str(body.get("staffEmail") or "").strip().lower()
        password = str(body.get("password") or "")
        if not valid_email(staff_email): raise ApiError(422, "A valid department staff email is required")
        try: password_salt, password_hash = make_password_hash(password)
        except ValueError as exc: raise ApiError(422, str(exc)) from exc
        department_id = int(body["departmentId"])
        await db_run(env.DB, "UPDATE department_portals SET staff_email=?, password_salt=?, password_hash=?, updated_at=? WHERE department_id=?", staff_email, password_salt, password_hash, iso_now(), department_id)
        await db_run(env.DB, "DELETE FROM staff_sessions WHERE user_id IN (SELECT id FROM users WHERE role='department_staff' AND department_id=?)", department_id)
        return json_response(env, {"ok": True, "changedBy": admin["name"]})
    actor = require_role(user, "department_staff", "admin")
    form = await request.formData()
    complaint_id = int(str(form.get("complaintId") or "0"))
    new_status = str(form.get("status") or "")
    remarks = str(form.get("remarks") or "").strip()
    item = await db_first(env.DB, "SELECT id,status,department_id AS departmentId FROM complaints WHERE id=?", complaint_id)
    if not item: raise ApiError(404, "Complaint not found")
    if actor["role"] != "admin" and int(item["departmentId"]) != int(actor["departmentId"]): raise ApiError(403, "Complaint belongs to another department")
    if new_status not in TRANSITIONS.get(str(item["status"]), set()) or len(remarks) < 5: raise ApiError(422, "Invalid status transition or remark")
    now = iso_now(); resolved_at = now if new_status == "resolved" else None
    await db_run(env.DB, "UPDATE complaints SET status=?,updated_at=?,resolved_at=? WHERE id=?", new_status, now, resolved_at, complaint_id)
    await db_run(env.DB, "INSERT INTO status_history (complaint_id,old_status,new_status,remarks,changed_by,changed_at) VALUES (?,?,?,?,?,?)", complaint_id, item["status"], new_status, remarks, actor["id"], now)
    photo = form.get("resolutionPhoto")
    if new_status == "resolved" and photo is not None and int(getattr(photo, "size", 0)) > 0:
        key, photo_type = await store_image(env, photo, f"complaints/{complaint_id}/resolution")
        await db_run(env.DB, "INSERT INTO complaint_attachments (complaint_id,object_key,file_type,content_type,uploaded_by,uploaded_at) VALUES (?,?,'resolution_image',?,?,?)", complaint_id, key, photo_type, actor["id"], now)
    return json_response(env, {"ok": True})


async def contact_create(env, request) -> Response:
    body = json.loads(await request.text())
    name = str(body.get("name", "")).strip(); email = str(body.get("email", "")).strip().lower(); message = str(body.get("message", "")).strip()
    if len(name) < 2 or not valid_email(email) or len(message) < 10: raise ApiError(422, "Complete all contact fields")
    result = await db_run(env.DB, "INSERT INTO contact_messages (name,email,topic,tracking_id,message,status,created_at) VALUES (?,?,?,?,?,'new',?)", name, email, str(body.get("topic", "Support")), body.get("trackingId"), message, iso_now())
    return json_response(env, {"ok": True, "reference": f"NJC-SUPPORT-{int(result.meta.last_row_id):06d}"}, 201)


async def serve_upload(env, encoded_key: str) -> Response:
    key = unquote(encoded_key)
    if not key.startswith("complaints/") or ".." in key: raise ApiError(400, "Invalid object key")
    obj = await env.UPLOADS.get(key)
    if obj is None: raise ApiError(404, "File not found")
    headers = {"content-type": str(getattr(obj.httpMetadata, "contentType", "application/octet-stream")), "cache-control": "public, max-age=3600", "etag": str(obj.httpEtag)}
    return Response(obj.body, headers=headers)


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        if request.method == "OPTIONS": return Response(None, status=204, headers=cors_headers(self.env))
        parsed = urlparse(request.url); path = parsed.path; query = parse_qs(parsed.query)
        try:
            if path == "/api/health" and request.method == "GET": return json_response(self.env, {"status": "ok", "database": "D1", "uploads": "R2"})
            if path == "/api/auth/login" and request.method == "POST": return await authenticate(self.env, request)
            if path == "/api/auth/me" and request.method == "GET": return json_response(self.env, require_role(await current_user(self.env, request), "admin", "department_staff"))
            if path == "/api/complaints" and request.method == "GET": return await complaint_get(self.env, request, query)
            if path == "/api/complaints" and request.method == "POST": return await complaint_create(self.env, request)
            if path == "/api/complaints" and request.method == "PATCH": return await complaint_patch(self.env, request)
            if path == "/api/contact" and request.method == "POST": return await contact_create(self.env, request)
            if path.startswith("/api/uploads/") and request.method == "GET": return await serve_upload(self.env, path.removeprefix("/api/uploads/"))
            raise ApiError(404, "Route not found")
        except ApiError as error:
            return error_response(self.env, error)
        except Exception:
            return error_response(self.env, ApiError(500, "Unexpected service error"))
