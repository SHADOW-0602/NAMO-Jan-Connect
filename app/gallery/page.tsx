import type { Metadata } from "next";
import InfoPageShell from "../InfoPageShell";
import ResolvedGallery from "../ResolvedGallery";

export const metadata: Metadata = { title: "Resolved complaint gallery | NAMO Jan Connect", description: "Browse anonymized photo evidence from complaints resolved through NAMO Jan Connect." };

export default function GalleryPage() {
  return <InfoPageShell eyebrow="EVIDENCE OF ACTION" title={<>Reported by citizens. <em>Resolved in public.</em></>} intro="A living gallery of anonymized complaints that departments have closed with publishable photo evidence. Every image is tied to a real tracking record.">
    <section className="info-section gallery-page-section reveal-on-view"><div className="gallery-note"><span>✓</span><p><b>Verified platform records</b><small>Only resolved complaints with approved evidence appear here. Citizen names and personal details are never displayed.</small></p></div><ResolvedGallery /></section>
  </InfoPageShell>;
}

