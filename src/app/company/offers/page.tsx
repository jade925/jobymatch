"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Euro, Users, Edit2, Archive } from "lucide-react";
import { getOffers, saveOffer } from "@/lib/storage";
import type { Offer } from "@/lib/storage";

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: "Active", bg: "#dcfce7", text: "#16a34a" },
  POURVUE: { label: "Pourvue", bg: "#dbeafe", text: "#2563eb" },
  EXPIREE: { label: "Expirée", bg: "#f3f4f6", text: "#6b7280" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function CompanyOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);

  function load() {
    setOffers(getOffers());
  }

  useEffect(() => { load(); }, []);

  function archiveOffer(id: string) {
    const offer = getOffers().find((o) => o.id === id);
    if (!offer) return;
    saveOffer({ ...offer, status: "EXPIREE" });
    load();
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-5 pt-10 pb-4 bg-white border-b border-gray-100 lg:pt-6">
        <div>
          <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>Mes offres</h1>
          {offers.length > 0 && (
            <p className="font-sans text-xs font-light mt-0.5" style={{ color: "#9ca3af" }}>
              {offers.length} offre{offers.length > 1 ? "s" : ""} publiée{offers.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={() => router.push("/company/offers/new")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-heading text-sm"
          style={{ backgroundColor: "#2292A4" }}
        >
          <Plus size={15} />
          Nouvelle offre
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <p className="font-heading text-base" style={{ color: "#393E41" }}>
              Aucune offre publiée
            </p>
            <p className="font-sans font-light text-sm text-gray-400">
              Créez votre première offre pour trouver des étudiants
            </p>
            <button
              onClick={() => router.push("/company/offers/new")}
              className="px-6 py-3 rounded-xl text-white font-heading text-sm"
              style={{ backgroundColor: "#FD8F03" }}
            >
              Créer une offre
            </button>
          </div>
        ) : (
          offers.map((offer) => {
            const statusStyle = STATUS_LABELS[offer.status] || STATUS_LABELS.ACTIVE;
            return (
              <div key={offer.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className="font-heading text-base leading-tight flex-1 mr-2"
                    style={{ color: "#393E41" }}
                  >
                    {offer.title}
                  </h3>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-sans font-light flex-shrink-0"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} style={{ color: "#2292A4" }} />
                    <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                      {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Euro size={13} style={{ color: "#2292A4" }} />
                    <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                      {offer.hourlyRate.toFixed(2)} €/h
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} style={{ color: "#2292A4" }} />
                    <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                      {offer.nbPositions} poste(s) disponible(s)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/company/offers/${offer.id}/edit`)
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-sans font-light"
                    style={{ borderColor: "#2292A4", color: "#2292A4" }}
                  >
                    <Edit2 size={13} />
                    Modifier
                  </button>
                  <button
                    onClick={() => archiveOffer(offer.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-sans font-light"
                    style={{ borderColor: "#d1d5db", color: "#9ca3af" }}
                  >
                    <Archive size={13} />
                    Archiver
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
