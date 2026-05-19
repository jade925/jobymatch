"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Euro, Briefcase, Building2 } from "lucide-react";
import { DEMO_OFFERS } from "@/lib/demo-data";
import { getOffers } from "@/lib/storage";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import type { Offer } from "@/lib/storage";

const ACTIVITY_LABELS: Record<string, string> = {
  RESTAURATION: "Restauration",
  COMMERCE: "Commerce",
  EVENEMENTIEL: "Événementiel",
  SERVICES: "Services",
  HÔTELLERIE: "Hôtellerie",
  AUTRE: "Autre",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawName = decodeURIComponent(params.name as string);

  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const all = [...DEMO_OFFERS, ...getOffers()];
    const matching = all.filter(
      (o) => o.companyName.toLowerCase() === rawName.toLowerCase() && o.status === "ACTIVE"
    );
    setOffers(matching);
  }, [rawName]);

  const firstOffer = offers[0];
  const activityLabel = firstOffer ? (ACTIVITY_LABELS[firstOffer.activityType] || firstOffer.activityType) : "";

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        {/* Teal banner */}
        <div className="h-24 relative" style={{ background: "linear-gradient(135deg, #2292A4 0%, #1a7a8a 100%)" }}>
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={18} color="white" />
          </button>
        </div>

        {/* Company identity */}
        <div className="px-5 pb-5 -mt-8 relative">
          <CompanyAvatar name={rawName} size="lg" />
          <div className="mt-3">
            <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>{rawName}</h1>
            {activityLabel && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-sans font-light" style={{ backgroundColor: "rgba(34,146,164,0.1)", color: "#2292A4" }}>
                {activityLabel}
              </span>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} style={{ color: "#9ca3af" }} />
              <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                {offers.length} offre{offers.length > 1 ? "s" : ""} active{offers.length > 1 ? "s" : ""}
              </span>
            </div>
            {firstOffer?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} style={{ color: "#9ca3af" }} />
                <span className="font-sans font-light text-xs truncate" style={{ color: "#6b7280" }}>
                  {firstOffer.location.split(",").slice(-2).join(",").trim()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offers list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none pb-8">
        <h2 className="font-heading text-base px-1" style={{ color: "#393E41" }}>
          Offres disponibles
        </h2>

        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Building2 size={40} style={{ color: "#d1d5db" }} />
            <p className="font-sans font-light text-sm" style={{ color: "#9ca3af" }}>
              Aucune offre active pour le moment
            </p>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => router.push(`/student/missions/${offer.id}`)}
            >
              <h3 className="font-heading leading-tight mb-2" style={{ color: "#393E41", fontSize: 18 }}>
                {offer.title}
              </h3>
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} style={{ color: "#FD8F03" }} />
                  <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                    {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: "#FD8F03" }} />
                  <span className="font-sans font-light text-xs truncate" style={{ color: "#6b7280" }}>
                    {offer.location}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Euro size={13} style={{ color: "#FD8F03" }} />
                  <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                    {offer.hourlyRate.toFixed(2)} €/h
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <span
                  className="px-4 py-1.5 rounded-xl text-white font-heading text-xs"
                  style={{ backgroundColor: "#FD8F03" }}
                >
                  Voir l'offre →
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
