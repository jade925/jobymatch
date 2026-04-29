"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OfferForm } from "@/components/OfferForm";

export default function EditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [offer, setOffer] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOffer({
          ...data,
          requiredSkills: JSON.parse(data.requiredSkills || "[]"),
          schedules: JSON.parse(data.schedules || "{}"),
        });
      });
  }, [id]);

  if (!offer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F6F7EB" }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => router.back()}>
          <ArrowLeft size={22} style={{ color: "#393E41" }} />
        </button>
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>Modifier l'offre</h1>
      </header>
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <OfferForm
          mode="edit"
          offerId={id}
          initialData={offer as Parameters<typeof OfferForm>[0]["initialData"]}
        />
      </div>
    </div>
  );
}
