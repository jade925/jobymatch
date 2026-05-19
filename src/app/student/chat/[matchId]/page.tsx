"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMatches } from "@/lib/storage";
import { ChatThread } from "@/components/ChatPane";
import type { Match } from "@/lib/storage";

export default function StudentChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const m = getMatches().find((m) => m.id === matchId) || null;
    setMatch(m);
    // On desktop redirect to the main chat page (thread is shown inline there)
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      router.replace("/student/chat");
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
        senderRole="student"
        onBack={() => router.push("/student/chat")}
      />
    </div>
  );
}
