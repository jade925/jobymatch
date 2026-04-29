"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { MapPin, Calendar, SlidersHorizontal, Briefcase } from "lucide-react";
import Image from "next/image";

type Offer = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  hourlyRate: number;
  score: number;
  company: {
    companyName: string;
    logoUrl: string | null;
    activityType: string;
  };
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MissionsPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/offers?forStudent=true")
      .then((r) => r.json())
      .then((d) => {
        setOffers(d.offers || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <Logo size="md" />
        <button className="p-2 rounded-xl" style={{ color: "#393E41" }}>
          <SlidersHorizontal size={22} />
        </button>
      </header>

      <div className="px-4 pt-4">
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>
          Missions pour toi
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }} />
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Briefcase size={40} style={{ color: "#d1d5db" }} />
            <p className="font-sans font-light text-sm text-gray-400">Aucune mission disponible pour l'instant</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => router.push(`/student/missions/${offer.id}`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {offer.company.logoUrl ? (
                    <Image src={offer.company.logoUrl} alt={offer.company.companyName} width={48} height={48} className="object-cover" />
                  ) : (
                    <span className="font-heading text-base" style={{ color: "#FD8F03" }}>
                      {offer.company.companyName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm" style={{ color: "#393E41" }}>{offer.company.companyName}</p>
                  <h3 className="font-heading text-base leading-tight" style={{ color: "#393E41" }}>{offer.title}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs text-white font-sans font-light flex-shrink-0" style={{ backgroundColor: "#FD8F03" }}>
                  {offer.score}%
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: "#9ca3af" }} />
                  <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>{offer.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} style={{ color: "#9ca3af" }} />
                  <span className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
                    {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-sm text-white font-sans" style={{ backgroundColor: "#FD8F03" }}>
                  {offer.hourlyRate.toFixed(2)} €/h
                </span>
                <button
                  className="px-4 py-2 rounded-xl text-sm font-sans font-light border"
                  style={{ borderColor: "#FD8F03", color: "#FD8F03" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/student/missions/${offer.id}`);
                  }}
                >
                  Voir l'offre
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
