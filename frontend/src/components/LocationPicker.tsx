"use client";

import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";

type Position = { lat: number; lng: number };

export default function LocationPicker() {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [address, setAddress] = useState("");
  const [gpsState, setGpsState] = useState<"idle" | "finding" | "found" | "error">("idle");
  const [message, setMessage] = useState("Click anywhere on the map to drop a pin.");

  useEffect(() => {
    let disposed = false;
    async function setup() {
      const L = await import("leaflet");
      if (disposed || !mapElement.current || map.current) return;
      const instance = L.map(mapElement.current, { zoomControl: true, attributionControl: true }).setView([22.5937, 78.9629], 5);
      if (mapElement.current) {
        L.DomEvent.disableScrollPropagation(mapElement.current);
        L.DomEvent.disableClickPropagation(mapElement.current);
        mapElement.current.addEventListener("touchmove", (e) => {
          e.stopPropagation();
        }, { passive: false });
      }
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(instance);
      const pinIcon = L.divIcon({ className: "njc-map-pin-wrap", html: '<span class="njc-map-pin"><i></i></span>', iconSize: [34, 44], iconAnchor: [17, 40] });
      function place(next: Position, zoom = false) {
        if (!marker.current) {
          marker.current = L.marker([next.lat, next.lng], { icon: pinIcon, draggable: true }).addTo(instance);
          marker.current.on("dragend", () => { const point = marker.current!.getLatLng(); update({ lat: point.lat, lng: point.lng }, false); });
        } else marker.current.setLatLng([next.lat, next.lng]);
        setPosition(next);
        setMessage("Pin placed. Drag it to fine-tune the location.");
        if (zoom) instance.setView([next.lat, next.lng], 16, { animate: true });
      }
      function update(next: Position, zoom = false) { place(next, zoom); }
      instance.on("click", (event) => update({ lat: event.latlng.lat, lng: event.latlng.lng }));
      map.current = instance;
      setTimeout(() => instance.invalidateSize(), 100);
    }
    setup();
    return () => { disposed = true; map.current?.remove(); map.current = null; marker.current = null; };
  }, []);

  function useGps() {
    if (!navigator.geolocation) { setGpsState("error"); setMessage("GPS is not supported by this browser. Drop a pin manually."); return; }
    setGpsState("finding"); setMessage("Finding your current location…");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const next = { lat: coords.latitude, lng: coords.longitude };
      setPosition(next); setGpsState("found"); setMessage(`Location detected within about ${Math.round(coords.accuracy)} metres.`);
      if (!address) setAddress(`GPS location: ${next.lat.toFixed(5)}, ${next.lng.toFixed(5)}`);
      import("leaflet").then((L) => {
        if (!map.current) return;
        const pinIcon = L.divIcon({ className: "njc-map-pin-wrap", html: '<span class="njc-map-pin"><i></i></span>', iconSize: [34, 44], iconAnchor: [17, 40] });
        if (!marker.current) marker.current = L.marker([next.lat, next.lng], { icon: pinIcon, draggable: true }).addTo(map.current);
        else marker.current.setLatLng([next.lat, next.lng]);
        marker.current.on("dragend", () => { const point = marker.current!.getLatLng(); setPosition({ lat: point.lat, lng: point.lng }); setMessage("Pin moved to your selected location."); });
        map.current.setView([next.lat, next.lng], 16, { animate: true });
      });
    }, (error) => { setGpsState("error"); setMessage(error.code === 1 ? "Location permission was declined. You can still drop a pin manually." : "We could not detect your location. Drop a pin manually."); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  }

  return <fieldset className="location-picker"><legend>Where is it?</legend><div className="location-toolbar"><button type="button" className="btn btn-gps" onClick={useGps} disabled={gpsState === "finding"}><span aria-hidden="true">◎</span>{gpsState === "finding" ? "Detecting…" : gpsState === "found" ? "Location detected" : "Use my GPS"}</button><p aria-live="polite">{message}</p></div><div className="location-map" ref={mapElement} aria-label="Interactive map. Click to place the complaint location pin." /><label className="location-address">Address or landmark<input name="location" required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Area, landmark, ward or complete address" /></label><input type="hidden" name="latitude" value={position?.lat ?? ""} /><input type="hidden" name="longitude" value={position?.lng ?? ""} />{position && <div className="coordinate-chip"><span>⌖</span><b>{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</b><small>Exact pin saved with complaint</small></div>}</fieldset>;
}
