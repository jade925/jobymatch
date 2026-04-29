"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    const res = await fetch("/api/profile");
    const data = await res.json();

    if (data.profile?.userId) {
      const roleRes = await fetch("/api/auth/session");
      const session = await roleRes.json();
      const role = session?.user?.role;
      if (role === "STUDENT") router.push("/student/missions");
      else if (role === "COMPANY") router.push("/company/offers");
      else router.push("/");
    } else {
      router.push("/");
    }
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
            <label className="text-sm font-sans font-light" style={{ color: "#393E41" }}>Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              className="rounded-xl h-12"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-sans font-light" style={{ color: "#393E41" }}>Mot de passe</label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="rounded-xl h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#9ca3af" }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
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
