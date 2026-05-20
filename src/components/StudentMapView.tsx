"use client";
import { useEffect, useRef } from "react";
import type { Offer, StudentProfile } from "@/lib/storage";

interface Props {
  offers: Offer[];
  profile: StudentProfile | null;
  onOfferClick: (id: string) => void;
}

export default function StudentMapView({ offers, profile, onOfferClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inject Leaflet CSS once
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    function initMap() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L || !containerRef.current) return;

      // Avoid double init
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }

      const center: [number, number] =
        profile?.latitude && profile?.longitude
          ? [profile.latitude, profile.longitude]
          : [44.8378, -0.5792]; // Bordeaux

      const map = L.map(containerRef.current, { zoomControl: true }).setView(center, 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Student marker
      if (profile?.latitude && profile?.longitude) {
        const studentIcon = L.divIcon({
          className: "",
          html: `<div style="width:36px;height:36px;background:#2292A4;border-radius:50%;border:4px solid white;box-shadow:0 2px 8px rgba(34,146,164,0.5)"></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -22],
        });
        L.marker([profile.latitude, profile.longitude], { icon: studentIcon })
          .addTo(map)
          .bindPopup(`<strong style="color:#2292A4">Ma position</strong><br>${profile.address || ""}`);
      }

      // Offer markers
      const offerIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;background:#FD8F03;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25)"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      const points: [number, number][] = [];
      if (profile?.latitude && profile?.longitude) points.push([profile.latitude, profile.longitude]);

      offers
        .filter((o) => o.latitude && o.longitude)
        .forEach((offer) => {
          points.push([offer.latitude!, offer.longitude!]);
          const marker = L.marker([offer.latitude!, offer.longitude!], { icon: offerIcon }).addTo(map);
          const popup = L.popup({ minWidth: 160 }).setContent(
            `<div>
              <p style="font-weight:800;color:#393E41;margin:0 0 2px">${offer.title}</p>
              <p style="font-size:11px;color:#9ca3af;margin:0">${offer.companyName}</p>
              <p style="font-size:11px;color:#6b7280;margin:4px 0">${offer.hourlyRate.toFixed(2)} €/h</p>
              <button id="offer-btn-${offer.id}" style="width:100%;background:#FD8F03;color:white;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:12px">
                Voir l'offre →
              </button>
            </div>`
          );
          marker.bindPopup(popup);
          marker.on("popupopen", () => {
            setTimeout(() => {
              document.getElementById(`offer-btn-${offer.id}`)?.addEventListener("click", () => {
                onOfferClick(offer.id);
              });
            }, 50);
          });
        });

      if (points.length > 1) {
        map.fitBounds(points, { padding: [40, 40] });
      }
    }

    // Load Leaflet JS if not already present
    if ((window as any).L) { // eslint-disable-line @typescript-eslint/no-explicit-any
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers, profile]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} className="z-0" />;
}
