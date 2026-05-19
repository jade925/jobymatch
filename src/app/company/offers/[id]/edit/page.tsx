"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OfferForm } from "@/components/OfferForm";
import { getOffers } from "@/lib/storage";
import type { Offer } from "@/lib/storage";

export default function EditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [offer, setOffer] = useState<Offer | null>(null);

  useEffect(() => {
    const found = getOffers().find((o) => o.id === id) || null;
    setOffer(found);
  }, [id]);

  if (!offer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "#F4F4F4" }}
    >
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => router.back()}>
          <ArrowLeft size={22} style={{ color: "#393E41" }} />
        </button>
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>
          Modifier l'offre
        </h1>
      </header>
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <OfferForm
          mode="edit"
          offerId={id}
          initialData={{
            title: offer.title,
            description: offer.description,
            requiredSkills: offer.requiredSkills,
            jobType: offer.jobType,
            startDate: offer.startDate,
            endDate: offer.endDate,
            schedules: offer.schedules,
            hourlyRate: offer.hourlyRate,
            location: offer.location,
            latitude: offer.latitude,
            longitude: offer.longitude,
            nbPositions: offer.nbPositions,
          }}
        />
      </div>
    </div>
  );
}
