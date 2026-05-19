"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Euro, Briefcase, Heart, Map } from "lucide-react";
import { DEMO_OFFERS } from "@/lib/demo-data";
import { getOffers, getStudentProfile } from "@/lib/storage";
import { computeMatchScore } from "@/lib/matching";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import type { Offer } from "@/lib/storage";

type OfferWithScore = Offer & { score: number };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function MissionsPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferWithScore[]>([]);

  useEffect(() => {
    const profile = getStudentProfile();
    const localOffers = getOffers().filter((o) => o.status === "ACTIVE");
    const all = [...DEMO_OFFERS, ...localOffers];
    const scored = all.map((o) => ({
      ...o,
      score: profile ? computeMatchScore(profile, o) : 50,
    }));
    scored.sort((a, b) => b.score - a.score);
    setOffers(scored);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-5 pt-10 pb-4 bg-white border-b border-gray-100 lg:hidden">
        <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>
          Missions pour toi
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/student/map")}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#e0f5f8" }}
          >
            <Map size={18} style={{ color: "#2292A4" }} />
          </button>
          <button
            onClick={() => router.push("/student/favorites")}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#fff3e0" }}
          >
            <Heart size={18} style={{ color: "#FD8F03" }} />
          </button>
        </div>
      </header>

      <div className="hidden lg:block px-5 pt-6 pb-2">
        <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>
          Missions pour toi
        </h1>
        <p className="font-sans text-sm font-light mt-0.5" style={{ color: "#9ca3af" }}>
          {offers.length} offre{offers.length > 1 ? "s" : ""} disponible{offers.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 scrollbar-none">
        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Briefcase size={40} style={{ color: "#d1d5db" }} />
            <p className="font-sans font-light text-sm text-gray-400">
              Aucune mission disponible pour l'instant
            </p>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => router.push(`/student/missions/${offer.id}`)}
            >
              {/* Ligne entreprise + score */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CompanyAvatar name={offer.companyName} size="sm" />
                  <span className="font-sans text-xs" style={{ color: "#9ca3af" }}>
                    {offer.companyName}
                  </span>
                </div>
                <span
                  className="text-xs font-sans px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#e0f5f8", color: "#2292A4" }}
                >
                  {offer.score}%
                </span>
              </div>

              {/* Titre — élément le plus important */}
              <h3
                className="font-heading leading-tight mb-3"
                style={{ color: "#393E41", fontSize: 22 }}
              >
                {offer.title}
              </h3>

              {/* Infos secondaires */}
              <div className="flex flex-col gap-1.5 mb-4">
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

              {/* CTA */}
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 rounded-xl text-white font-heading text-xs tracking-wide"
                  style={{ backgroundColor: "#FD8F03" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/student/missions/${offer.id}`);
                  }}
                >
                  Voir l'offre →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
