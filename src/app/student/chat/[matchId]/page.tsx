"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Paperclip, Send } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  content: string | null;
  fileUrl: string | null;
  createdAt: string;
};

export default function StudentChatThreadPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/messages?matchId=${matchId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, content: text.trim() }),
    });
    setText("");
    setSending(false);
    loadMessages();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const { url } = await res.json();
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, fileUrl: url }),
    });
    loadMessages();
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-gray-100">
        <button onClick={() => router.back()}>
          <ArrowLeft size={22} style={{ color: "#393E41" }} />
        </button>
        <h1 className="font-heading text-lg" style={{ color: "#393E41" }}>Conversation</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-none">
        {messages.map((msg) => {
          const isMe = msg.senderId === session?.user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[75%] px-4 py-2.5 text-sm font-sans font-light"
                style={{
                  backgroundColor: isMe ? "#FD8F03" : "#F6F7EB",
                  color: isMe ? "white" : "#393E41",
                  borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                }}
              >
                {msg.content || (
                  <a href={msg.fileUrl!} target="_blank" rel="noreferrer" className="underline">
                    📎 Fichier joint
                  </a>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <label className="cursor-pointer">
          <Paperclip size={20} style={{ color: "#9ca3af" }} />
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFile}
          />
        </label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Écrire un message..."
          className="flex-1 h-10 px-3 rounded-full border font-sans font-light text-sm outline-none"
          style={{ borderColor: "#e2e3d8", backgroundColor: "#F6F7EB" }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !text.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
          style={{ backgroundColor: "#FD8F03" }}
        >
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}
