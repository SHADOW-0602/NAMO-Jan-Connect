import type { Metadata } from "next";
import InfoPageShell from "../InfoPageShell";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact | NAMO Jan Connect", description: "Contact NAMO Jan Connect support about a complaint, accessibility, privacy, or department access." };

export default function ContactPage() {
  return <InfoPageShell eyebrow="WE’RE HERE TO HELP" title={<>Tell us what you <em>need.</em></>} intro="For the fastest complaint update, use your public tracking ID first. For account, accessibility, privacy, or technical help, send the support team a message.">
    <section className="contact-layout reveal-on-view"><div className="contact-options"><article><span>01</span><h3>Existing complaint</h3><p>Use the tracking tool for live status and department remarks.</p><a href="/">Track a complaint →</a></article><article><span>02</span><h3>General support</h3><p>Questions about your account or how to use the platform.</p><a href="mailto:support@namojanconnect.in">support@namojanconnect.in</a></article><article><span>03</span><h3>Accessibility</h3><p>Report a barrier or request an alternative way to complete a task.</p><a href="mailto:accessibility@namojanconnect.in">Accessibility support →</a></article><article><span>04</span><h3>Privacy</h3><p>Request access, correction, deletion, or more information.</p><a href="mailto:privacy@namojanconnect.in">Privacy team →</a></article></div><div className="contact-form-card"><p className="eyebrow">SEND A MESSAGE</p><h2>How can we help?</h2><ContactForm /></div></section>
  </InfoPageShell>;
}

