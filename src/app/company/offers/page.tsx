"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Plus, Calendar, Users, Edit2, Archive } from "lucide-react";

type Offer = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "POURVUE" | "EXPIREE";
  _count: { matches: number };
};

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: "Active", bg: "#dcfce7", text: "#16a34a" },
  POURVUE: { label: "Pourvue", bg: "#dbeafe", text: "#2563eb" },
  EXPIREE: { label: "Expirée", bg: "#f3f4f6", text: "#6b7280" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function CompanyOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOffers() {
    const res = await fetch("/api/offers");
    const data = await res.json();
    setOffers(data.offers || []);
    setLoading(false);
  }

  useEffect(() => { loadOffers(); }, []);

  async function archiveOffer(id: string) {
    await fetch(`/api/offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "EXPIREE" }),
    });
    loadOffers();
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <Logo size="md" />
        <button
          onClick={() => router.push("/company/offers/new")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-heading text-sm"
          style={{ backgroundColor: "#FD8F03" }}
        >
          <Plus size={16} />
          Nouvelle offre
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }} />
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <p className="font-heading text-base" style={{ color: "#393E41" }}>Aucune offre publiée</p>
            <p className="font-sans font-light text-sm text-gray-400">Créez votre première offre pour trouver des étudiants</p>
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
                  <h3 className="font-heading text-base leading-tight flex-1 mr-2" style={{ color: "#393E41" }}>
                    {offer.title}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-sans font-light flex-shrink-0" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                    {statusStyle.label}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} style={{ color: "#9ca3af" }} />
                    <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                      {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} style={{ color: "#9ca3af" }} />
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-sans text-white"
                      style={{ backgroundColor: "#2292A4" }}
                    >
                      {offer._count?.matches || 0} candidat(s)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/company/offers/${offer.id}/edit`)}
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
