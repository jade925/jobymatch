"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getMatches, saveMatch } from "@/lib/storage";
import type { Match } from "@/lib/storage";

// In demo mode: company sees student matches stored locally.
// (On a real device, students apply and the company user on the same device can review them.)

export default function CompanyChatPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);

  function load() {
    setMatches(getMatches().filter((m) => m.status !== "REFUSE"));
  }

  useEffect(() => { load(); }, []);

  function handleAccept(matchId: string) {
    const m = getMatches().find((m) => m.id === matchId);
    if (!m) return;
    saveMatch({ ...m, status: "ACCEPTE" });
    load();
  }

  function handleRefuse(matchId: string) {
    const m = getMatches().find((m) => m.id === matchId);
    if (!m) return;
    saveMatch({ ...m, status: "REFUSE" });
    load();
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>
          Candidatures
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
            <MessageCircle size={48} style={{ color: "#d1d5db" }} />
            <p className="font-heading text-base" style={{ color: "#393E41" }}>
              Aucune candidature
            </p>
            <p className="font-sans font-light text-sm text-gray-400">
              Les candidatures des étudiants apparaîtront ici.
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-white border-b border-gray-50 px-4 py-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span
                    className="font-heading text-base"
                    style={{ color: "#2292A4" }}
                  >
                    É
                  </span>
                </div>
                <div className="flex-1">
                  <p
                    className="font-sans font-normal text-sm"
                    style={{ color: "#393E41" }}
                  >
                    Étudiant(e)
                  </p>
                  <p
                    className="font-sans font-light text-xs"
                    style={{ color: "#6b7280" }}
                  >
                    {match.offerTitle}
                  </p>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-sans font-light text-white"
                  style={{ backgroundColor: "#FD8F03" }}
                >
                  {match.score}%
                </span>
              </div>

              {match.status === "ACCEPTE" ? (
                <button
                  onClick={() => router.push(`/company/chat/${match.id}`)}
                  className="w-full py-2.5 rounded-xl text-white font-heading text-sm"
                  style={{ backgroundColor: "#2292A4" }}
                >
                  Ouvrir la conversation
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRefuse(match.id)}
                    className="flex-1 py-2.5 rounded-xl border font-sans font-light text-sm"
                    style={{ borderColor: "#d1d5db", color: "#9ca3af" }}
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => handleAccept(match.id)}
                    className="flex-1 py-2.5 rounded-xl text-white font-heading text-sm"
                    style={{ backgroundColor: "#FD8F03" }}
                  >
                    Accepter
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
