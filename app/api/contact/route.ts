import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as { name?: string; email?: string; topic?: string; trackingId?: string; message?: string; consent?: string };
    const name = String(payload.name ?? "").trim();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const topic = String(payload.topic ?? "").trim();
    const message = String(payload.message ?? "").trim();
    if (!payload.consent || name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !topic || message.length < 20) return NextResponse.json({ error: "Please complete all required fields" }, { status: 400 });
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS contact_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, topic TEXT NOT NULL, tracking_id TEXT, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at)`).run();
    await env.DB.prepare(`INSERT INTO contact_messages (name, email, topic, tracking_id, message, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(name.slice(0,100), email.slice(0,160), topic.slice(0,80), String(payload.trackingId ?? "").trim().slice(0,40) || null, message.slice(0,2000), new Date().toISOString()).run();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send message" }, { status: 500 }); }
}

