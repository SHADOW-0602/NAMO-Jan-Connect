import { useState, FormEvent } from "react";
import PublicLayout from "./PublicLayout";
import { apiFetch, readJson } from "../api";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("complaint");
  const [trackingId, setTrackingId] = useState("");
  const [message, setMessage] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, topic, tracking_id: trackingId, message })
      });
      const result = await readJson<{ ok: boolean; message?: string; detail?: string }>(response);
      if (!response.ok) {
        throw new Error(result.detail || result.message || "Failed to send message");
      }
      setSuccess("Your support request has been sent! Our team will get back to you shortly.");
      setName("");
      setEmail("");
      setTrackingId("");
      setMessage("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to send message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicLayout activePath="/contact">
      <div className="info-shell">
        <section className="info-hero" style={{ minHeight: "360px" }}>
          <div className="info-orbit"><i /><i /><i /></div>
          <p className="eyebrow">WE ARE HERE TO HELP</p>
          <h1>Contact <em>Support</em></h1>
          <p>Have questions about tracking your grievance or using the portal? Get in touch with our helpdesk.</p>
        </section>

        <section className="info-section reveal-on-view">
          <div className="two-column" style={{ gap: "40px" }}>
            <div>
              <p className="eyebrow">HELPDESK DETAILS</p>
              <h2>Direct Support Channels</h2>
              <p style={{ marginBottom: "28px" }}>
                For faster assistance regarding an existing complaint, please include your public tracking ID.
              </p>

              <div style={{ display: "grid", gap: "24px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ background: "rgba(3,105,161,0.08)", color: "var(--accent)", padding: "12px", borderRadius: "50%" }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700 }}>Email Address</h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>kushagra.singh0562@gmail.com</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ background: "rgba(3,105,161,0.08)", color: "var(--accent)", padding: "12px", borderRadius: "50%" }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700 }}>Toll-Free Helpline</h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>1800-11-2026 (Mon-Sat, 9 AM - 6 PM)</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ background: "rgba(3,105,161,0.08)", color: "var(--accent)", padding: "12px", borderRadius: "50%" }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700 }}>Main Office</h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>
                      National Informatics Centre (NIC)<br />
                      A-Block, CGO Complex, Lodhi Road,<br />
                      New Delhi - 110003, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "36px 30px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
                <p className="eyebrow" style={{ color: "var(--accent-2)" }}>ONLINE ASSISTANCE</p>
                <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Send a Message</h2>
                
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {success && (
                    <p className="form-success-banner" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      <CheckCircle2 size={16} /> {success}
                    </p>
                  )}

                  <label className="form-field-label">
                    <span className="form-label-row">
                      <span>Full Name</span>
                      <span className="hindi-hint">पूरा नाम</span>
                    </span>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Enter your name" 
                    />
                  </label>

                  <label className="form-field-label">
                    <span className="form-label-row">
                      <span>Email Address</span>
                      <span className="hindi-hint">ईमेल पता</span>
                    </span>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="your.email@example.com" 
                    />
                  </label>

                  <label className="form-field-label">
                    <span className="form-label-row">
                      <span>Topic</span>
                      <span className="hindi-hint">विषय</span>
                    </span>
                    <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                      <option value="complaint">Complaint Tracking Support</option>
                      <option value="technical">Technical Portal Issue</option>
                      <option value="accessibility">Accessibility Feedback</option>
                      <option value="other">General Inquiry</option>
                    </select>
                  </label>

                  {topic === "complaint" && (
                    <label className="form-field-label">
                      <span className="form-label-row">
                        <span>Grievance Tracking ID</span>
                        <span className="hindi-hint">शिकायत ट्रैकिंग आईडी (वैकल्पिक)</span>
                      </span>
                      <input 
                        type="text" 
                        value={trackingId} 
                        onChange={(e) => setTrackingId(e.target.value)} 
                        placeholder="e.g. NJC-12345-6789" 
                      />
                    </label>
                  )}

                  <label className="form-field-label">
                    <span className="form-label-row">
                      <span>Your Message</span>
                      <span className="hindi-hint">आपका संदेश</span>
                    </span>
                    <textarea 
                      required 
                      rows={4} 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      placeholder="Describe your issue or query..."
                    />
                  </label>

                  {error && (
                    <p className="form-error-banner" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      <AlertCircle size={16} /> {error}
                    </p>
                  )}

                  <button className="btn btn-primary" disabled={busy} style={{ width: "100%", padding: "12px", display: "inline-flex", gap: "8px" }}>
                    {busy ? "Sending..." : <>Send Message <Send size={14} /></>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
