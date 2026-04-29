"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

type Match = {
  id: string;
  score: number;
  offer: {
    title: string;
    company: {
      companyName: string;
      logoUrl: string | null;
    };
  };
  messages: Array<{
    content: string | null;
    createdAt: string;
  }>;
};

export default function StudentChatPage() {
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
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>Messages</h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
            <MessageCircle size={48} style={{ color: "#d1d5db" }} />
            <p className="font-heading text-base" style={{ color: "#393E41" }}>Aucun chat disponible</p>
            <p className="font-sans font-light text-sm text-gray-400">
              Postule à des offres pour démarrer une conversation avec les entreprises.
            </p>
          </div>
        ) : (
          matches.map((match) => {
            const lastMsg = match.messages?.[match.messages.length - 1];
            return (
              <div
                key={match.id}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 cursor-pointer bg-white active:bg-gray-50"
                onClick={() => router.push(`/student/chat/${match.id}`)}
              >
                <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {match.offer.company.logoUrl ? (
                    <Image src={match.offer.company.logoUrl} alt={match.offer.company.companyName} width={44} height={44} className="object-cover" />
                  ) : (
                    <span className="font-heading text-base" style={{ color: "#FD8F03" }}>
                      {match.offer.company.companyName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-normal text-sm" style={{ color: "#393E41" }}>{match.offer.company.companyName}</p>
                  <p className="font-sans font-light text-xs truncate" style={{ color: "#9ca3af" }}>
                    {lastMsg?.content || match.offer.title}
                  </p>
                </div>
                {lastMsg && (
                  <span className="font-sans font-light text-xs flex-shrink-0" style={{ color: "#9ca3af" }}>
                    {new Date(lastMsg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
