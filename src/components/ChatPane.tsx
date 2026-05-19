"use client";
import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { getMessages, addMessage, genId } from "@/lib/storage";
import { CompanyAvatar } from "./CompanyAvatar";
import type { Match, Message } from "@/lib/storage";

// ─── Thread ─────────────────────────────────────────────────────────────────
interface ThreadProps {
  match: Match;
  senderRole: "student" | "company";
  candidateName?: string;
  onBack?: () => void;
}

export function ChatThread({ match, senderRole, candidateName, onBack }: ThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  function refresh() {
    setMessages(getMessages(match.id));
  }

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 2000);
    return () => clearInterval(iv);
  }, [match.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    if (!text.trim()) return;
    addMessage(match.id, { id: genId(), content: text.trim(), sender: senderRole, createdAt: new Date().toISOString() });
    setText("");
    refresh();
  }

  const displayName = senderRole === "student" ? match.companyName : (candidateName || "Candidat(e)");

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0" style={{ backgroundColor: "white" }}>
        {onBack && (
          <button onClick={onBack} className="lg:hidden p-1">
            <ArrowLeft size={20} style={{ color: "#393E41" }} />
          </button>
        )}
        <CompanyAvatar
          name={senderRole === "student" ? match.companyName : displayName}
          size="sm"
        />
        <div>
          <p className="font-heading text-sm" style={{ color: "#393E41" }}>{displayName}</p>
          <p className="font-sans text-xs font-light" style={{ color: "#9ca3af" }}>{match.offerTitle}</p>
        </div>
        <span
          className="ml-auto text-xs font-sans px-2 py-0.5 rounded-full"
          style={match.status === "ACCEPTE" ? { backgroundColor: "#dcfce7", color: "#16a34a" } : { backgroundColor: "#fff3e0", color: "#FD8F03" }}
        >
          {match.status === "ACCEPTE" ? "Accepté" : "En attente"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none" style={{ backgroundColor: "#F4F4F4" }}>
        {messages.length === 0 && (
          <p className="text-center font-sans font-light text-xs pt-4" style={{ color: "#9ca3af" }}>
            Début de la conversation
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender === senderRole;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[72%] px-4 py-2.5 text-sm font-sans font-light leading-relaxed"
                style={{
                  backgroundColor: isMe ? "#FD8F03" : "white",
                  color: isMe ? "white" : "#393E41",
                  borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  boxShadow: isMe ? "0 2px 8px rgba(253,143,3,0.25)" : "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {match.status === "ACCEPTE" ? (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Écrire un message..."
            className="flex-1 h-11 px-4 rounded-full text-sm font-sans font-light outline-none"
            style={{ backgroundColor: "#F4F4F4", border: "1.5px solid #e2e3d8" }}
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-30 flex-shrink-0"
            style={{ backgroundColor: "#FD8F03" }}
          >
            <Send size={16} color="white" />
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
          <p className="text-center font-sans text-xs font-light" style={{ color: "#9ca3af" }}>
            La messagerie sera disponible une fois la candidature acceptée.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8" style={{ backgroundColor: "#F4F4F4" }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(253,143,3,0.1)" }}>
        <MessageCircle size={28} style={{ color: "#FD8F03" }} />
      </div>
      <p className="font-heading text-base" style={{ color: "#393E41" }}>Sélectionne une conversation</p>
      <p className="font-sans font-light text-sm text-center" style={{ color: "#9ca3af" }}>
        Clique sur un contact à gauche pour démarrer l'échange.
      </p>
    </div>
  );
}
