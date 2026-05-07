"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { getMatches, getMessages, addMessage, genId } from "@/lib/storage";
import type { Match, Message } from "@/lib/storage";

export default function CompanyChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  function refresh() {
    const m = getMatches().find((m) => m.id === matchId) || null;
    setMatch(m);
    setMessages(getMessages(matchId));
  }

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 2000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!text.trim()) return;
    addMessage(matchId, {
      id: genId(),
      content: text.trim(),
      sender: "company",
      createdAt: new Date().toISOString(),
    });
    setText("");
    refresh();
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-gray-100">
        <button onClick={() => router.back()}>
          <ArrowLeft size={22} style={{ color: "#393E41" }} />
        </button>
        <div>
          <p className="font-heading text-base" style={{ color: "#393E41" }}>
            Étudiant(e)
          </p>
          <p
            className="font-sans font-light text-xs"
            style={{ color: "#9ca3af" }}
          >
            {match?.offerTitle}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-none">
        {messages.length === 0 && (
          <p
            className="text-center font-sans font-light text-xs pt-6"
            style={{ color: "#9ca3af" }}
          >
            Début de la conversation
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender === "company";
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[75%] px-4 py-2.5 text-sm font-sans font-light"
                style={{
                  backgroundColor: isMe ? "#2292A4" : "#F6F7EB",
                  color: isMe ? "white" : "#393E41",
                  borderRadius: isMe
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && sendMessage()
          }
          placeholder="Écrire un message..."
          className="flex-1 h-10 px-3 rounded-full border font-sans font-light text-sm outline-none"
          style={{ borderColor: "#e2e3d8", backgroundColor: "#F6F7EB" }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
          style={{ backgroundColor: "#2292A4" }}
        >
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}
