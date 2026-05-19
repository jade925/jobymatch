"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Euro, Heart, ArrowLeft } from "lucide-react";
import { DEMO_OFFERS } from "@/lib/demo-data";
import { getOffers } from "@/lib/storage";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import type { Offer } from "@/lib/storage";

const FAVORITES_KEY = "jm:favorites";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function FavoritesPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const favIds = getFavorites();
    const all = [...DEMO_OFFERS, ...getOffers()];
    setOffers(all.filter((o) => favIds.includes(o.id)));
  }, []);

  function removeFavorite(id: string) {
    const favs = getFavorites().filter((f) => f !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 lg:pt-6 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="lg:hidden">
          <ArrowLeft size={22} style={{ color: "#393E41" }} />
        </button>
        <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>
          Mes favoris
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-none">
        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Heart size={40} style={{ color: "#d1d5db" }} />
            <p className="font-heading text-base" style={{ color: "#393E41" }}>Aucun favori pour l'instant</p>
            <p className="font-sans font-light text-sm text-gray-400 text-center px-8">
              Sauvegarde des offres en cliquant sur le signet depuis la page d'une offre.
            </p>
            <button
              onClick={() => router.push("/student/missions")}
              className="mt-2 px-4 py-2 rounded-xl text-white font-sans text-sm"
              style={{ backgroundColor: "#FD8F03" }}
            >
              Voir les missions
            </button>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => router.push(`/student/missions/${offer.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CompanyAvatar name={offer.companyName} size="sm" />
                  <span className="font-sans text-xs" style={{ color: "#9ca3af" }}>{offer.companyName}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFavorite(offer.id); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#fff3e0" }}
                >
                  <Heart size={15} fill="#FD8F03" style={{ color: "#FD8F03" }} />
                </button>
              </div>

              <h3 className="font-heading leading-tight mb-3" style={{ color: "#393E41", fontSize: 22 }}>
                {offer.title}
              </h3>

              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} style={{ color: "#FD8F03" }} />
                  <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                    {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: "#FD8F03" }} />
                  <span className="font-sans font-light text-xs truncate" style={{ color: "#6b7280" }}>{offer.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Euro size={13} style={{ color: "#FD8F03" }} />
                  <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>{offer.hourlyRate.toFixed(2)} €/h</span>
                </div>
              </div>

              <button
                className="w-full py-3 rounded-xl text-white font-heading text-sm"
                style={{ backgroundColor: "#FD8F03" }}
                onClick={(e) => { e.stopPropagation(); router.push(`/student/missions/${offer.id}`); }}
              >
                Voir l'offre →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
