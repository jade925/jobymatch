// v2 – client-side only, no auth
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getRole, setRole } from "@/lib/storage";

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
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#F6F7EB" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" />
          <p
            className="text-center font-sans font-light text-base"
            style={{ color: "#393E41" }}
          >
            Le job étudiant qui te correspond.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => pick("STUDENT")}
            className="w-full py-4 rounded-xl text-white font-heading text-lg transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#FD8F03" }}
          >
            Je suis étudiant(e)
          </button>

          <button
            onClick={() => pick("COMPANY")}
            className="w-full py-4 rounded-xl text-white font-heading text-lg transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#2292A4" }}
          >
            Je suis une entreprise
          </button>
        </div>
      </div>
    </main>
  );
}
