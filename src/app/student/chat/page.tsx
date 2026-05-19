"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getMatches, saveMatch } from "@/lib/storage";
import { ChatThread, ChatEmptyState } from "@/components/ChatPane";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import type { Match } from "@/lib/storage";

// ─── Conversation row ────────────────────────────────────────────────────────
function ConvRow({
  match,
  selected,
  onClick,
}: {
  match: Match;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 text-left transition-colors"
      style={{ backgroundColor: selected ? "rgba(253,143,3,0.06)" : "white" }}
    >
      <CompanyAvatar name={match.companyName} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-sans font-normal text-sm truncate" style={{ color: "#393E41" }}>
          {match.companyName}
        </p>
        <p className="font-sans font-light text-xs truncate" style={{ color: "#9ca3af" }}>
          {match.offerTitle}
        </p>
      </div>
      <span
        className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-sans font-light"
        style={
          match.status === "ACCEPTE"
            ? { backgroundColor: "#dcfce7", color: "#16a34a" }
            : { backgroundColor: "#fff3e0", color: "#FD8F03" }
        }
      >
        {match.status === "ACCEPTE" ? "Accepté" : "En attente"}
      </span>
      {selected && (
        <div
          className="absolute right-0 top-0 bottom-0 w-0.5 rounded-l"
          style={{ backgroundColor: "#FD8F03" }}
        />
      )}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function StudentChatPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);

  useEffect(() => {
    const all = getMatches().filter((m) => m.status !== "REFUSE");
    setMatches(all);
  }, []);

  function handleClick(match: Match) {
    // On mobile (no lg class active): navigate to dedicated thread page
    if (window.innerWidth < 1024) {
      router.push(`/student/chat/${match.id}`);
    } else {
      setSelected(match);
    }
  }

  // Sync selected when matches update
  useEffect(() => {
    if (selected) {
      const fresh = matches.find((m) => m.id === selected.id);
      if (fresh) setSelected(fresh);
    }
  }, [matches]);

  const empty = (
    <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
      <MessageCircle size={48} style={{ color: "#d1d5db" }} />
      <p className="font-heading text-base" style={{ color: "#393E41" }}>
        Aucun message
      </p>
      <p className="font-sans font-light text-sm" style={{ color: "#9ca3af" }}>
        Postule à des offres pour démarrer une conversation avec les entreprises.
      </p>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* ── Left panel: conversation list ── */}
      <div className="flex flex-col flex-shrink-0 w-full lg:w-80 border-r border-gray-100 bg-white">
        {/* List header */}
        <div className="px-5 pt-10 pb-4 border-b border-gray-100 lg:pt-6 flex-shrink-0">
          <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>
            Messages
          </h1>
          {matches.length > 0 && (
            <p className="font-sans text-xs font-light mt-0.5" style={{ color: "#9ca3af" }}>
              {matches.length} conversation{matches.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {matches.length === 0
            ? empty
            : matches.map((m) => (
                <ConvRow
                  key={m.id}
                  match={m}
                  selected={selected?.id === m.id}
                  onClick={() => handleClick(m)}
                />
              ))}
        </div>
      </div>

      {/* ── Right panel: thread (desktop only) ── */}
      <div className="hidden lg:flex flex-col flex-1 min-w-0">
        {selected ? (
          <ChatThread match={selected} senderRole="student" />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  );
}
