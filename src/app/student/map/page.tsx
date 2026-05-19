"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { DEMO_OFFERS } from "@/lib/demo-data";
import { getOffers, getStudentProfile } from "@/lib/storage";
import type { Offer, StudentProfile } from "@/lib/storage";

// Lazy-load the map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/StudentMapView"), { ssr: false, loading: () => (
  <div className="flex-1 flex items-center justify-center bg-gray-100">
    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }} />
  </div>
)});

export default function StudentMapPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const all = [...DEMO_OFFERS, ...getOffers().filter(o => o.status === "ACTIVE")];
    setOffers(all.filter(o => o.latitude && o.longitude));
    setProfile(getStudentProfile());
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 lg:pt-6 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => router.back()} className="lg:hidden">
          <ArrowLeft size={22} style={{ color: "#393E41" }} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>Carte des offres</h1>
          <p className="font-sans font-light text-xs mt-0.5" style={{ color: "#9ca3af" }}>
            {offers.length} offre{offers.length > 1 ? "s" : ""} autour de toi
          </p>
        </div>
      </header>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FD8F03" }} />
          <span className="font-sans text-xs" style={{ color: "#6b7280" }}>Offres disponibles</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2292A4" }} />
          <span className="font-sans text-xs" style={{ color: "#6b7280" }}>Ma position</span>
        </div>
        {!profile?.latitude && (
          <span className="text-xs font-sans" style={{ color: "#9ca3af" }}>
            (position non renseignée)
          </span>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <MapView offers={offers} profile={profile} onOfferClick={(id) => router.push(`/student/missions/${id}`)} />
      </div>
    </div>
  );
}
