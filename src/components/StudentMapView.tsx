"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Offer, StudentProfile } from "@/lib/storage";

// Fix Leaflet default icon in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const offerIcon = L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;background:#FD8F03;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25)"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const studentIcon = L.divIcon({
  className: "",
  html: `<div style="width:36px;height:36px;background:#2292A4;border-radius:50%;border:4px solid white;box-shadow:0 2px 8px rgba(34,146,164,0.5)"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

function FitBounds({ offers, profile }: { offers: Offer[]; profile: StudentProfile | null }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = offers
      .filter(o => o.latitude && o.longitude)
      .map(o => [o.latitude!, o.longitude!]);
    if (profile?.latitude && profile?.longitude) {
      points.push([profile.latitude, profile.longitude]);
    }
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [map, offers, profile]);
  return null;
}

interface Props {
  offers: Offer[];
  profile: StudentProfile | null;
  onOfferClick: (id: string) => void;
}

export default function StudentMapView({ offers, profile, onOfferClick }: Props) {
  const defaultCenter: [number, number] = profile?.latitude && profile?.longitude
    ? [profile.latitude, profile.longitude]
    : [48.8566, 2.3522];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={11}
      style={{ width: "100%", height: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds offers={offers} profile={profile} />

      {/* Student location */}
      {profile?.latitude && profile?.longitude && (
        <Marker position={[profile.latitude, profile.longitude]} icon={studentIcon}>
          <Popup>
            <div className="font-sans text-sm">
              <strong style={{ color: "#2292A4" }}>Ma position</strong>
              <br />
              {profile.address || "Adresse non renseignée"}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Offer markers */}
      {offers.filter(o => o.latitude && o.longitude).map((offer) => (
        <Marker key={offer.id} position={[offer.latitude!, offer.longitude!]} icon={offerIcon}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <p className="font-heading text-sm font-bold" style={{ color: "#393E41" }}>{offer.title}</p>
              <p className="font-sans text-xs" style={{ color: "#9ca3af" }}>{offer.companyName}</p>
              <p className="font-sans text-xs mt-1" style={{ color: "#6b7280" }}>{offer.hourlyRate.toFixed(2)} €/h</p>
              <button
                onClick={() => onOfferClick(offer.id)}
                style={{ marginTop: 8, backgroundColor: "#FD8F03", color: "white", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 12, width: "100%" }}
              >
                Voir l'offre →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
