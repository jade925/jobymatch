// v2 – client-side only, no auth
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getRole, setRole } from "@/lib/storage";
import { GraduationCap, Building2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();
    if (role === "STUDENT") router.replace("/student/missions");
    else if (role === "COMPANY") router.replace("/company/offers");
  }, [router]);

  function pick(role: "STUDENT" | "COMPANY") {
    setRole(role);
    router.push(role === "STUDENT" ? "/student/missions" : "/company/offers");
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F4F4F4" }}>
      {/* Top gradient band */}
      <div
        className="absolute inset-x-0 top-0 h-64 pointer-events-none"
        style={{
          background: "linear-gradient(160deg, rgba(253,143,3,0.12) 0%, rgba(34,146,164,0.08) 100%)",
        }}
      />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm flex flex-col items-center gap-10">

          {/* Logo complet avec silhouette */}
          <div className="flex flex-col items-center gap-4">
            <Logo size="lg" variant="full" />
            <p className="text-center font-sans font-light text-base" style={{ color: "#6b7280" }}>
              Le job étudiant qui te correspond.
            </p>
          </div>

          {/* Séparateur */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(57,62,65,0.12)" }} />
            <span className="font-sans text-xs font-light" style={{ color: "#9ca3af" }}>Je suis…</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(57,62,65,0.12)" }} />
          </div>

          {/* Boutons */}
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={() => pick("STUDENT")}
              className="w-full py-4 px-5 rounded-2xl text-white font-heading text-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center gap-3 shadow-md"
              style={{ backgroundColor: "#FD8F03", boxShadow: "0 4px 20px rgba(253,143,3,0.35)" }}
            >
              <GraduationCap size={24} />
              <span className="flex-1 text-left">Étudiant(e)</span>
              <span className="text-white/60 text-sm font-sans font-light">→</span>
            </button>

            <button
              onClick={() => pick("COMPANY")}
              className="w-full py-4 px-5 rounded-2xl text-white font-heading text-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center gap-3 shadow-md"
              style={{ backgroundColor: "#2292A4", boxShadow: "0 4px 20px rgba(34,146,164,0.35)" }}
            >
              <Building2 size={24} />
              <span className="flex-1 text-left">Entreprise</span>
              <span className="text-white/60 text-sm font-sans font-light">→</span>
            </button>
          </div>

          <p className="font-sans text-xs font-light text-center" style={{ color: "#9ca3af" }}>
            Aucune création de compte requise · 100% local
          </p>
        </div>
      </div>
    </main>
  );
}
