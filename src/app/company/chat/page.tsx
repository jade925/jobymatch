"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, CheckCircle, XCircle } from "lucide-react";
import { getMatches, saveMatch, getStudentProfile } from "@/lib/storage";
import { ChatThread, ChatEmptyState } from "@/components/ChatPane";
import type { Match } from "@/lib/storage";

// ─── Conversation row ────────────────────────────────────────────────────────
function ConvRow({
  match,
  selected,
  candidateName,
  onSelect,
  onAccept,
  onRefuse,
}: {
  match: Match;
  selected: boolean;
  candidateName: string;
  onSelect: () => void;
  onAccept: () => void;
  onRefuse: () => void;
}) {
  return (
    <div
      className="border-b border-gray-50 transition-colors"
      style={{ backgroundColor: selected ? "rgba(34,146,164,0.06)" : "white" }}
    >
      <button onClick={onSelect} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div
          className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: "#e0f5f8" }}
        >
          <span className="font-heading text-base" style={{ color: "#2292A4" }}>
            {candidateName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-normal text-sm truncate" style={{ color: "#393E41" }}>
            {candidateName}
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
      </button>

      {/* Accept/Refuse actions only when PENDING */}
      {match.status === "PENDING" && (
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRefuse(); }}
            className="flex-1 py-2 rounded-xl border font-sans font-light text-xs flex items-center justify-center gap-1.5"
            style={{ borderColor: "#d1d5db", color: "#9ca3af" }}
          >
            <XCircle size={13} />
            Refuser
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(); }}
            className="flex-1 py-2 rounded-xl text-white font-heading text-xs flex items-center justify-center gap-1.5"
            style={{ backgroundColor: "#FD8F03" }}
          >
            <CheckCircle size={13} />
            Accepter
          </button>
        </div>
      )}
    </div>
  );
}

const DEMO_CANDIDATE_NAMES: Record<string, string> = {
  "demo-match-1": "Léa Martin",
  "demo-match-2": "Thomas Dupont",
  "demo-match-3": "Camille Bernard",
  "demo-match-4": "Noah Petit",
  "demo-match-5": "Emma Rousseau",
  "demo-match-6": "Léa Martin",
  "demo-match-7": "Léa Martin",
  "demo-match-8": "Noah Petit",
  "demo-match-9": "Emma Rousseau",
};

function getCandidateName(match: Match, fallback: string): string {
  return DEMO_CANDIDATE_NAMES[match.id] ?? fallback;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CompanyChatPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);
  const [defaultName, setDefaultName] = useState("Étudiant(e)");

  function load() {
    const all = getMatches().filter((m) => m.status !== "REFUSE");
    setMatches(all);
    const profile = getStudentProfile();
    if (profile?.firstName) {
      setDefaultName(`${profile.firstName} ${profile.lastName ?? ""}`.trim());
    }
  }

  useEffect(() => { load(); }, []);

  function handleSelect(match: Match) {
    if (window.innerWidth < 1024) {
      router.push(`/company/chat/${match.id}`);
    } else {
      setSelected(match);
    }
  }

  function handleAccept(matchId: string) {
    const m = getMatches().find((m) => m.id === matchId);
    if (!m) return;
    saveMatch({ ...m, status: "ACCEPTE" });
    load();
    // Update selected if it's the same match
    if (selected?.id === matchId) setSelected({ ...m, status: "ACCEPTE" });
  }

  function handleRefuse(matchId: string) {
    const m = getMatches().find((m) => m.id === matchId);
    if (!m) return;
    saveMatch({ ...m, status: "REFUSE" });
    if (selected?.id === matchId) setSelected(null);
    load();
  }

  // Sync selected with fresh data
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
        Aucune candidature
      </p>
      <p className="font-sans font-light text-sm" style={{ color: "#9ca3af" }}>
        Les candidatures des étudiants apparaîtront ici.
      </p>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* ── Left panel ── */}
      <div className="flex flex-col flex-shrink-0 w-full lg:w-80 border-r border-gray-100 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 border-b border-gray-100 lg:pt-6 flex-shrink-0">
          <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>
            Candidatures
          </h1>
          {matches.length > 0 && (
            <p className="font-sans text-xs font-light mt-0.5" style={{ color: "#9ca3af" }}>
              {matches.length} candidature{matches.length > 1 ? "s" : ""}
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
                  candidateName={getCandidateName(m, defaultName)}
                  onSelect={() => handleSelect(m)}
                  onAccept={() => handleAccept(m.id)}
                  onRefuse={() => handleRefuse(m.id)}
                />
              ))}
        </div>
      </div>

      {/* ── Right panel (desktop) ── */}
      <div className="hidden lg:flex flex-col flex-1 min-w-0">
        {selected ? (
          <ChatThread
            match={selected}
            senderRole="company"
            candidateName={getCandidateName(selected, defaultName)}
          />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  );
}
