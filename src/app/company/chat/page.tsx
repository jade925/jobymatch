"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

type Match = {
  id: string;
  score: number;
  status: string;
  student: {
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
  offer: {
    title: string;
  };
};

export default function CompanyChatPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => {
        setMatches(d.matches || []);
        setLoading(false);
      });
  }, []);

  async function handleAccept(matchId: string) {
    await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, status: "ACCEPTE" }),
    });
    setMatches((ms) => ms.map((m) => m.id === matchId ? { ...m, status: "ACCEPTE" } : m));
  }

  async function handleRefuse(matchId: string) {
    await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, status: "REFUSE" }),
    });
    setMatches((ms) => ms.filter((m) => m.id !== matchId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>Candidatures</h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
            <MessageCircle size={48} style={{ color: "#d1d5db" }} />
            <p className="font-heading text-base" style={{ color: "#393E41" }}>Aucune candidature</p>
            <p className="font-sans font-light text-sm text-gray-400">
              Publiez des offres pour recevoir des candidatures d'étudiants.
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
                  <span className="font-heading text-base" style={{ color: "#2292A4" }}>
                    {match.student.firstName.charAt(0)}{match.student.lastName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-sans font-normal text-sm" style={{ color: "#393E41" }}>
                    {match.student.firstName} {match.student.lastName}
                  </p>
                  <p className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>{match.offer.title}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-sans font-light text-white" style={{ backgroundColor: "#FD8F03" }}>
                  {Math.round(match.score)}%
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
