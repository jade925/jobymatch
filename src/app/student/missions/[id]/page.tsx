"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MapPin, Calendar, Euro, Users, ArrowLeft, Bookmark, X, Globe, Building2 } from "lucide-react";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { DEMO_OFFERS } from "@/lib/demo-data";
import {
  getOffers,
  getStudentProfile,
  getMatches,
  saveMatch,
  deleteMatch,
  genId,
} from "@/lib/storage";
import { computeMatchScore } from "@/lib/matching";
import type { Offer } from "@/lib/storage";

const FAVORITES_KEY = "jm:favorites";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
}
function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) { favs.push(id); localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs)); return true; }
  favs.splice(idx, 1); localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs)); return false;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const ACTIVITY_LABELS: Record<string, string> = {
  RESTAURATION: "Restauration & Hôtellerie",
  COMMERCE: "Commerce & Distribution",
  EVENEMENTIEL: "Événementiel",
  SERVICES: "Services aux particuliers",
  AUTRE: "Autre",
};

export default function OfferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [applied, setApplied] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    const all = [...DEMO_OFFERS, ...getOffers()];
    const found = all.find((o) => o.id === id) || null;
    setOffer(found);

    const matches = getMatches();
    const existing = matches.find((m) => m.offerId === id);
    if (existing) { setApplied(true); setMatchId(existing.id); }
    setSaved(getFavorites().includes(id));
  }, [id]);

  function handleApply() {
    if (!offer) return;
    if (applied) { setShowWithdraw(true); return; }
    const profile = getStudentProfile();
    const score = profile ? computeMatchScore(profile, offer) : 50;
    const newId = genId();
    saveMatch({
      id: newId,
      offerId: offer.id,
      offerTitle: offer.title,
      companyName: offer.companyName,
      logoUrl: offer.logoUrl,
      status: "PENDING",
      score,
      appliedAt: new Date().toISOString(),
    });
    setApplied(true);
    setMatchId(newId);
  }

  function handleWithdraw() {
    if (matchId) { deleteMatch(matchId); }
    setApplied(false);
    setMatchId(null);
    setShowWithdraw(false);
  }

  function handleSave() {
    const isNowSaved = toggleFavorite(id);
    setSaved(isNowSaved);
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: "#F4F4F4" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: "#F4F4F4" }}>
      {/* Banner */}
      <div className="relative h-44 flex-shrink-0" style={{ backgroundColor: "#2292A4" }}>
        <button onClick={() => router.back()} className="absolute top-12 left-4 lg:top-4 z-10 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowLeft size={20} color="white" />
        </button>
        <button
          onClick={handleSave}
          className="absolute top-12 right-4 lg:top-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: saved ? "#FD8F03" : "rgba(255,255,255,0.2)" }}
        >
          <Bookmark size={18} color="white" fill={saved ? "white" : "none"} />
        </button>

        <div className="absolute bottom-0 left-4 right-4 flex items-end gap-3 pb-4">
          {/* Company avatar — clickable */}
          <button
            onClick={() => setShowCompany(true)}
            className="active:scale-95 transition-transform flex-shrink-0"
          >
            <CompanyAvatar name={offer.companyName} size="lg" />
          </button>
          <div>
            <button onClick={() => setShowCompany(true)} className="text-left">
              <p className="font-sans font-light text-sm text-white/80 underline-offset-2 hover:underline">
                {offer.companyName}
              </p>
            </button>
            <h1 className="font-heading text-xl text-white leading-tight">{offer.title}</h1>
          </div>
        </div>
      </div>

      {/* Content — split layout on desktop */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* LEFT — Description + infos + desktop CTA */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-heading text-base mb-2" style={{ color: "#393E41" }}>Missions du poste</h2>
              <p className="font-sans font-light text-sm leading-relaxed" style={{ color: "#393E41" }}>
                {offer.description}
              </p>
            </div>

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
              {offer.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {offer.requiredSkills.map((s) => (
                    <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-sans font-light" style={{ backgroundColor: "#fff3e0", color: "#FD8F03" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop CTA — inside the left column */}
            <button
              onClick={handleApply}
              className="hidden lg:block w-full py-4 rounded-xl text-white font-heading text-base shadow-sm mt-auto"
              style={{ backgroundColor: applied ? "#9ca3af" : "#FD8F03" }}
            >
              {applied ? "Retirer ma candidature" : "Postuler à cette mission"}
            </button>
          </div>

          {/* RIGHT — Map */}
          <div className="lg:w-[48%] lg:flex-shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ height: 300 }}>
              {offer.latitude && offer.longitude ? (
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${offer.longitude - 0.01},${offer.latitude - 0.01},${offer.longitude + 0.01},${offer.latitude + 0.01}&layer=mapnik&marker=${offer.latitude},${offer.longitude}`}
                  className="w-full h-full border-0"
                  title="Localisation"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <MapPin size={28} style={{ color: "#9ca3af" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA — fixed on mobile only */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 lg:hidden">
        <button
          onClick={handleApply}
          className="w-full py-4 rounded-xl text-white font-heading text-base shadow-lg"
          style={{ backgroundColor: applied ? "#9ca3af" : "#FD8F03" }}
        >
          {applied ? "Retirer ma candidature" : "Postuler à cette mission"}
        </button>
      </div>

      {/* Withdraw confirmation sheet */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowWithdraw(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
            <h3 className="font-heading text-lg mb-2" style={{ color: "#393E41" }}>Retirer la candidature ?</h3>
            <p className="font-sans font-light text-sm mb-5" style={{ color: "#6b7280" }}>
              Ta candidature pour <strong>{offer.title}</strong> chez <strong>{offer.companyName}</strong> sera annulée.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowWithdraw(false)} className="flex-1 py-3 rounded-xl border font-sans text-sm" style={{ borderColor: "#e2e3d8", color: "#6b7280" }}>
                Annuler
              </button>
              <button onClick={handleWithdraw} className="flex-1 py-3 rounded-xl text-white font-heading text-sm" style={{ backgroundColor: "#ef4444" }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company profile sheet */}
      {showCompany && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCompany(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg" style={{ color: "#393E41" }}>Profil entreprise</h3>
              <button onClick={() => setShowCompany(false)}>
                <X size={20} style={{ color: "#9ca3af" }} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <CompanyAvatar name={offer.companyName} size="lg" />
              <div>
                <h4 className="font-heading text-xl" style={{ color: "#393E41" }}>{offer.companyName}</h4>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "#e0f5f8", color: "#2292A4" }}>
                  {ACTIVITY_LABELS[offer.activityType] || offer.activityType}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {offer.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} style={{ color: "#FD8F03" }} className="mt-0.5 flex-shrink-0" />
                  <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>{offer.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Building2 size={16} style={{ color: "#FD8F03" }} />
                <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>
                  {offer.nbPositions} poste(s) actuellement ouvert(s)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={16} style={{ color: "#FD8F03" }} />
                <span className="font-sans font-light text-sm" style={{ color: "#9ca3af" }}>
                  Pas de site web renseigné
                </span>
              </div>
            </div>

            <button
              onClick={() => { setShowCompany(false); router.push(`/student/company/${encodeURIComponent(offer.companyName)}`); }}
              className="w-full py-3 rounded-xl border font-sans text-sm"
              style={{ borderColor: "#2292A4", color: "#2292A4" }}
            >
              Voir toutes les offres de {offer.companyName} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
