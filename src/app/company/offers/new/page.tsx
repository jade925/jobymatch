"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OfferForm } from "@/components/OfferForm";

export default function NewOfferPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F6F7EB" }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => router.back()}>
          <ArrowLeft size={22} style={{ color: "#393E41" }} />
        </button>
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>Nouvelle offre</h1>
      </header>
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <OfferForm mode="create" />
      </div>
    </div>
  );
}
