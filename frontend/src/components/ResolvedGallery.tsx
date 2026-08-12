"use client";

import { useEffect, useState } from "react";
import { apiFetch, readJson } from "../api";

type GalleryItem = { id: number; trackingId: string; title: string; location: string; category: string; department: string; resolvedAt: string; imageUrl: string };

export default function ResolvedGallery({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiFetch("/api/complaints?scope=gallery").then((response) => response.ok ? readJson<{ items?: GalleryItem[] }>(response) : Promise.reject()).then((data) => setItems(data.items ?? [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  if (loading) return <div className={`resolved-gallery ${compact ? "gallery-compact" : ""}`} aria-label="Loading resolved complaints">{[1,2,3].map((item) => <div className="gallery-skeleton" key={item}><i /><b /><span /></div>)}</div>;
  if (!items.length) return <div className="gallery-empty"><span>□</span><h3>Resolution evidence will appear here.</h3><p>When departments close complaints with publishable photo proof, the anonymized result is added automatically. No fabricated success stories.</p><a className="text-link" href="/">Track a resolved complaint →</a></div>;
  return <div className={`resolved-gallery ${compact ? "gallery-compact" : ""}`}>{items.slice(0, compact ? 3 : 24).map((item) => <article key={item.id}><div className="gallery-photo"><img src={item.imageUrl} alt={`Resolution evidence for ${item.title}`} loading="lazy" /><span>✓ Solved</span></div><div className="gallery-card-copy"><p>{item.department}</p><h3>{item.title}</h3><small>⌖ {item.location}</small><div><b>{item.trackingId}</b><span>{new Intl.DateTimeFormat("en-IN", { day:"numeric", month:"short", year:"numeric" }).format(new Date(item.resolvedAt))}</span></div></div></article>)}</div>;
}
