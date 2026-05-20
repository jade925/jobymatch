"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, XCircle, ChevronRight, MessageCircle } from "lucide-react";
import { getMatches, deleteMatch } from "@/lib/storage";
import { DEMO_STUDENT_MATCHES } from "@/lib/demo-data";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import type { Match } from "@/lib/storage";

const STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    color: "#FD8F03",
    bg: "#fff3e0",
    Icon: Clock,
  },
  ACCEPTE: {
    label: "Acceptée",
    color: "#16a34a",
    bg: "#dcfce7",
    Icon: CheckCircle,
  },
  REFUSE: {
    label: "Refusée",
    color: "#dc2626",
    bg: "#fee2e2",
    Icon: XCircle,
  },
};

const STEPS = ["Candidature envoyée", "Vue par l'entreprise", "Entretien", "Réponse finale"];

function StatusSteps({ status }: { status: Match["status"] }) {
  const activeStep = status === "PENDING" ? 1 : status === "ACCEPTE" ? 4 : 2;
  return (
    <div className="flex items-center gap-1 mt-3">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const done = stepNum <= activeStep;
        const isRefused = status === "REFUSE" && stepNum === 2;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: isRefused ? "#fee2e2" : done ? "#FD8F03" : "#e5e7eb",
                }}
              >
                {isRefused ? (
                  <XCircle size={12} style={{ color: "#dc2626" }} />
                ) : done ? (
                  <div className="w-2 h-2 rounded-full bg-white" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <span className="text-[9px] font-sans text-center leading-tight" style={{ color: done ? "#393E41" : "#9ca3af", maxWidth: 52 }}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mb-4 mx-0.5" style={{ backgroundColor: stepNum < activeStep ? "#FD8F03" : "#e5e7eb" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CandidaturesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);

  function load() {
    const all = getMatches();
    // Merge demo matches (don't duplicate)
    const demoIds = DEMO_STUDENT_MATCHES.map(m => m.id);
    const withDemo = [...all.filter(m => !demoIds.includes(m.id)), ...DEMO_STUDENT_MATCHES.filter(d => all.some(m => m.id === d.id))];
    setMatches(all.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()));
  }

  useEffect(() => { load(); }, []);

  function handleWithdraw(id: string) {
    deleteMatch(id);
    load();
  }

  const grouped = {
    ACCEPTE: matches.filter((m) => m.status === "ACCEPTE"),
    PENDING: matches.filter((m) => m.status === "PENDING"),
    REFUSE: matches.filter((m) => m.status === "REFUSE"),
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 lg:pt-6 bg-white border-b border-gray-100">
        <button onClick={() => router.back()} className="lg:hidden">
          <ArrowLeft size={22} style={{ color: "#393E41" }} />
        </button>
        <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>
          Mes candidatures
        </h1>
        <span className="ml-auto text-xs font-sans px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fff3e0", color: "#FD8F03" }}>
          {matches.length} total
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-none">
        {matches.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Clock size={40} style={{ color: "#d1d5db" }} />
            <p className="font-heading text-base" style={{ color: "#393E41" }}>Aucune candidature</p>
            <p className="font-sans font-light text-sm text-gray-400 text-center px-8">
              Postule à des offres pour suivre tes candidatures ici.
            </p>
            <button
              onClick={() => router.push("/student/missions")}
              className="mt-2 px-4 py-2 rounded-xl text-white font-sans text-sm"
              style={{ backgroundColor: "#FD8F03" }}
            >
              Voir les missions
            </button>
          </div>
        )}

        {(["ACCEPTE", "PENDING", "REFUSE"] as const).map((status) => {
          const group = grouped[status];
          if (group.length === 0) return null;
          const config = STATUS_CONFIG[status];

          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <config.Icon size={15} style={{ color: config.color }} />
                <h2 className="font-heading text-sm" style={{ color: config.color }}>
                  {config.label} ({group.length})
                </h2>
              </div>
              <div className="space-y-3">
                {group.map((match) => (
                  <div key={match.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <CompanyAvatar name={match.companyName} size="sm" />
                        <div>
                          <p className="font-sans text-xs" style={{ color: "#9ca3af" }}>{match.companyName}</p>
                          <p className="font-heading text-base leading-tight" style={{ color: "#393E41" }}>
                            {match.offerTitle}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-sans px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: config.bg, color: config.color }}>
                        {match.score}%
                      </span>
                    </div>

                    <p className="font-sans text-xs font-light mb-3" style={{ color: "#9ca3af" }}>
                      Postulé le {new Date(match.appliedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </p>

                    <StatusSteps status={match.status} />

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {match.status === "ACCEPTE" && (
                        <button
                          onClick={() => router.push(`/student/chat/${match.id}`)}
                          className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-white font-sans text-xs"
                          style={{ backgroundColor: "#2292A4" }}
                        >
                          <MessageCircle size={13} />
                          Écrire un message
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/student/missions/${match.offerId}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border font-sans text-xs"
                        style={{ borderColor: "#e2e3d8", color: "#393E41" }}
                      >
                        Voir l'offre
                        <ChevronRight size={13} />
                      </button>
                      {match.status === "PENDING" && (
                        <button
                          onClick={() => handleWithdraw(match.id)}
                          className="px-3 py-2.5 rounded-xl border font-sans text-xs"
                          style={{ borderColor: "#fee2e2", color: "#dc2626" }}
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
