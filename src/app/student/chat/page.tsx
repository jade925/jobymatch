"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getMatches } from "@/lib/storage";
import type { Match } from "@/lib/storage";

export default function StudentChatPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    setMatches(getMatches().filter((m) => m.status !== "REFUSE"));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>
          Messages
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
            <MessageCircle size={48} style={{ color: "#d1d5db" }} />
            <p className="font-heading text-base" style={{ color: "#393E41" }}>
              Aucun chat disponible
            </p>
            <p className="font-sans font-light text-sm text-gray-400">
              Postule à des offres pour démarrer une conversation avec les
              entreprises.
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 cursor-pointer bg-white active:bg-gray-50"
              onClick={() => router.push(`/student/chat/${match.id}`)}
            >
              <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                <span
                  className="font-heading text-base"
                  style={{ color: "#FD8F03" }}
                >
                  {match.companyName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-sans font-normal text-sm"
                  style={{ color: "#393E41" }}
                >
                  {match.companyName}
                </p>
                <p
                  className="font-sans font-light text-xs truncate"
                  style={{ color: "#9ca3af" }}
                >
                  {match.offerTitle}
                </p>
              </div>
              <span
                className="px-2 py-1 rounded-full text-xs font-sans font-light text-white flex-shrink-0"
                style={{
                  backgroundColor:
                    match.status === "ACCEPTE" ? "#2292A4" : "#FD8F03",
                }}
              >
                {match.status === "ACCEPTE" ? "Accepté" : "En attente"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
