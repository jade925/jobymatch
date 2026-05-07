"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapProvider } from "@/components/MapProvider";
import { MapPin, Calendar, Euro, Users, ArrowLeft, Bookmark } from "lucide-react";
import { DEMO_OFFERS } from "@/lib/demo-data";
import {
  getOffers,
  getStudentProfile,
  getMatches,
  saveMatch,
  genId,
} from "@/lib/storage";
import { computeMatchScore } from "@/lib/matching";
import type { Offer } from "@/lib/storage";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OfferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const all = [...DEMO_OFFERS, ...getOffers()];
    const found = all.find((o) => o.id === id) || null;
    setOffer(found);

    const matches = getMatches();
    setApplied(matches.some((m) => m.offerId === id));
  }, [id]);

  function handleApply() {
    if (!offer) return;
    const profile = getStudentProfile();
    const score = profile ? computeMatchScore(profile, offer) : 50;
    saveMatch({
      id: genId(),
      offerId: offer.id,
      offerTitle: offer.title,
      companyName: offer.companyName,
      logoUrl: offer.logoUrl,
      status: "PENDING",
      score,
      appliedAt: new Date().toISOString(),
    });
    setApplied(true);
  }

  if (!offer) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: "#F6F7EB" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const mapCenter =
    offer.latitude && offer.longitude
      ? { lat: offer.latitude, lng: offer.longitude }
      : { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F6F7EB" }}>
      {/* Banner */}
      <div
        className="relative h-48 flex-shrink-0"
        style={{ backgroundColor: "#2292A4" }}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 z-10 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={20} color="white" />
        </button>

        <div className="absolute bottom-0 left-4 right-4 flex items-end gap-3 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md overflow-hidden">
            <span className="font-heading text-xl" style={{ color: "#FD8F03" }}>
              {offer.companyName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-sans font-light text-sm text-white/80">
              {offer.companyName}
            </p>
            <h1 className="font-heading text-xl text-white leading-tight">
              {offer.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28 space-y-5">
        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2
            className="font-heading text-base mb-2"
            style={{ color: "#393E41" }}
          >
            À propos du poste
          </h2>
          <p
            className="font-sans font-light text-sm leading-relaxed"
            style={{ color: "#393E41" }}
          >
            {offer.description}
          </p>
        </div>

        {/* Infos pratiques */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="font-heading text-base" style={{ color: "#393E41" }}>
            Informations pratiques
          </h2>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: "#FD8F03" }} />
            <span
              className="font-sans font-light text-sm"
              style={{ color: "#393E41" }}
            >
              {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: "#FD8F03" }} />
            <span
              className="font-sans font-light text-sm"
              style={{ color: "#393E41" }}
            >
              {offer.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Euro size={16} style={{ color: "#FD8F03" }} />
            <span
              className="font-sans font-light text-sm"
              style={{ color: "#393E41" }}
            >
              {offer.hourlyRate.toFixed(2)} €/h
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "#FD8F03" }} />
            <span
              className="font-sans font-light text-sm"
              style={{ color: "#393E41" }}
            >
              {offer.nbPositions} poste(s) disponible(s)
            </span>
          </div>
          {offer.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {offer.requiredSkills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 rounded-full text-xs font-sans font-light"
                  style={{ backgroundColor: "#fff3e0", color: "#FD8F03" }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <MapProvider>
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ height: 220 }}
          >
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
          disabled={applied}
          className="flex-1 py-4 rounded-xl text-white font-heading text-base shadow-lg disabled:opacity-70"
          style={{ backgroundColor: "#FD8F03" }}
        >
          {applied ? "Candidature envoyée ✓" : "Postuler"}
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
