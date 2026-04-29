"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapProvider } from "@/components/MapProvider";
import { MapPin, Calendar, Clock, Euro, Users, ArrowLeft, Bookmark } from "lucide-react";
import Image from "next/image";

type Offer = {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  hourlyRate: number;
  nbPositions: number;
  latitude: number | null;
  longitude: number | null;
  requiredSkills: string;
  schedules: string;
  company: {
    companyName: string;
    logoUrl: string | null;
    activityType: string;
  };
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function OfferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then((r) => r.json())
      .then(setOffer);
  }, [id]);

  async function handleApply() {
    setApplying(true);
    await fetch("/api/matches/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId: id }),
    });
    setApplying(false);
    setApplied(true);
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: "#F6F7EB" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const skills: string[] = JSON.parse(offer.requiredSkills || "[]");
  const mapCenter = offer.latitude && offer.longitude
    ? { lat: offer.latitude, lng: offer.longitude }
    : { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F6F7EB" }}>
      {/* Banner */}
      <div className="relative h-48 flex-shrink-0" style={{ backgroundColor: "#2292A4" }}>
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 z-10 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={20} color="white" />
        </button>

        <div className="absolute bottom-0 left-4 right-4 flex items-end gap-3 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md overflow-hidden">
            {offer.company.logoUrl ? (
              <Image src={offer.company.logoUrl} alt={offer.company.companyName} width={56} height={56} className="object-cover" />
            ) : (
              <span className="font-heading text-xl" style={{ color: "#FD8F03" }}>
                {offer.company.companyName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="font-sans font-light text-sm text-white/80">{offer.company.companyName}</p>
            <h1 className="font-heading text-xl text-white leading-tight">{offer.title}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28 space-y-5">
        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-heading text-base mb-2" style={{ color: "#393E41" }}>À propos du poste</h2>
          <p className="font-sans font-light text-sm leading-relaxed" style={{ color: "#393E41" }}>{offer.description}</p>
        </div>

        {/* Infos pratiques */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="font-heading text-base" style={{ color: "#393E41" }}>Informations pratiques</h2>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: "#FD8F03" }} />
            <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>
              {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: "#FD8F03" }} />
            <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>{offer.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Euro size={16} style={{ color: "#FD8F03" }} />
            <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>{offer.hourlyRate.toFixed(2)} €/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "#FD8F03" }} />
            <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>{offer.nbPositions} poste(s) disponible(s)</span>
          </div>
          {skills.length > 0 && (
            <div className="flex items-start gap-2">
              <Clock size={16} style={{ color: "#FD8F03", marginTop: 2 }} />
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-sans font-light" style={{ backgroundColor: "#fff3e0", color: "#FD8F03" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <MapProvider>
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ height: 220 }}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={15}
            gestureHandling="cooperative"
            disableDefaultUI
            mapId="offer-detail-map"
          >
            <AdvancedMarker position={mapCenter}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: "#FD8F03" }}
              >
                <MapPin size={16} color="white" />
              </div>
            </AdvancedMarker>
          </Map>
        </div>
        </MapProvider>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 bg-transparent flex gap-3">
        <button
          onClick={handleApply}
          disabled={applying || applied}
          className="flex-1 py-4 rounded-xl text-white font-heading text-base shadow-lg disabled:opacity-70"
          style={{ backgroundColor: "#FD8F03" }}
        >
          {applied ? "Candidature envoyée !" : applying ? "Envoi..." : "Postuler"}
        </button>
        <button
          className="w-14 h-14 rounded-xl border-2 flex items-center justify-center"
          style={{ borderColor: "#2292A4" }}
        >
          <Bookmark size={20} style={{ color: "#2292A4" }} />
        </button>
      </div>
    </div>
  );
}
