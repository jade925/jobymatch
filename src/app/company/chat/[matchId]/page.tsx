"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMatches, getStudentProfile } from "@/lib/storage";
import { ChatThread } from "@/components/ChatPane";
import type { Match } from "@/lib/storage";

export default function CompanyChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [candidateName, setCandidateName] = useState("Étudiant(e)");

  useEffect(() => {
    const m = getMatches().find((m) => m.id === matchId) || null;
    setMatch(m);

    const profile = getStudentProfile();
    if (profile?.firstName) {
      setCandidateName(`${profile.firstName} ${profile.lastName ?? ""}`.trim());
    }

    // On desktop redirect back to main chat page (thread shown inline)
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      router.replace("/company/chat");
    }
  }, [matchId, router]);

  if (!match) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-sans font-light text-sm" style={{ color: "#9ca3af" }}>
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatThread
        match={match}
        senderRole="company"
        candidateName={candidateName}
        onBack={() => router.push("/company/chat")}
      />
    </div>
  );
}
