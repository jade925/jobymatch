"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username: username.trim(),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Pseudo introuvable. Vérifie ton identifiant.");
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;
    if (role === "STUDENT") router.push("/student/missions");
    else if (role === "COMPANY") router.push("/company/offers");
    else router.push("/");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: "#F6F7EB" }}>
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <Logo size="lg" />
          <p className="mt-2 font-sans font-light text-sm" style={{ color: "#6b7280" }}>
            Connexion à ton compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-sans font-light" style={{ color: "#393E41" }}>Pseudo</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ton-pseudo"
                required
                className="rounded-xl h-12 pl-9"
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-4 rounded-xl text-white font-heading text-base mt-2 disabled:opacity-60"
            style={{ backgroundColor: "#FD8F03" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          className="text-center font-sans font-light text-sm underline"
          style={{ color: "#393E41" }}
        >
          Pas encore de compte ? S'inscrire
        </button>
      </div>
    </main>
  );
}
