"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending"); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to send your message");
      event.currentTarget.reset(); setState("sent");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Unable to send your message"); }
  }

  if (state === "sent") return <div className="contact-success" role="status"><span>✓</span><h2>Message received.</h2><p>We have sent your request to the support team. Keep your complaint tracking ID nearby if your message relates to an existing case.</p><button className="btn btn-line" onClick={() => setState("idle")}>Send another message</button></div>;

  return <form className="contact-form" onSubmit={submit}><div className="form-pair"><label>Your name<input name="name" required maxLength={100} autoComplete="name" /></label><label>Email address<input name="email" type="email" required maxLength={160} autoComplete="email" /></label></div><label>How can we help?<select name="topic" required defaultValue=""><option value="" disabled>Select a topic</option><option>Complaint support</option><option>Accessibility</option><option>Privacy request</option><option>Department access</option><option>Technical issue</option><option>Other</option></select></label><label>Complaint tracking ID <small>Optional</small><input name="trackingId" maxLength={40} placeholder="NJC-2026-000124" /></label><label>Message<textarea name="message" required minLength={20} maxLength={2000} rows={7} placeholder="Tell us what happened and what you need help with..." /></label><label className="form-consent"><input type="checkbox" required name="consent" value="yes" /><span>I agree that NAMO Jan Connect may use these details to respond to this request.</span></label>{state === "error" && <p className="form-error" role="alert">{message}</p>}<button className="btn btn-primary btn-large" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message →"}</button></form>;
}

