"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "STUDENT") router.replace("/student/missions");
    if (session?.user?.role === "COMPANY") router.replace("/company/offers");
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F6F7EB" }}>
        <Logo size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: "#F6F7EB" }}>
      <div className="w-full max-w-sm flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" />
          <p className="text-center font-sans font-light text-base" style={{ color: "#393E41" }}>
            Le job étudiant qui te correspond.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => router.push("/register?role=STUDENT")}
            className="w-full py-4 rounded-xl text-white font-heading text-lg transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#FD8F03" }}
          >
            Je suis étudiant
          </button>

          <button
            onClick={() => router.push("/register?role=COMPANY")}
            className="w-full py-4 rounded-xl text-white font-heading text-lg transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#2292A4" }}
          >
            Je suis une entreprise
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 rounded-xl font-sans font-light text-sm underline"
            style={{ color: "#393E41" }}
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </main>
  );
}
