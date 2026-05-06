"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const SLOTS = ["matin", "aprem", "soir"];

const JOB_TYPES = ["Restauration", "Commerce", "Événementiel", "Services", "Livraison", "Hôtellerie", "Autre"];
const SKILLS_SUGGESTIONS = ["Service en salle", "Caisse", "Cuisine", "Manutention", "Vente", "Accueil", "Conduite", "Informatique", "Langues", "Communication"];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "STUDENT";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    diploma: "",
    school: "",
    skills: [] as string[],
    jobTypes: [] as string[],
    availabilities: {} as Record<string, Record<string, boolean>>,
    companyName: "",
    siret: "",
    activityType: "AUTRE",
    website: "",
  });

  function setField(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSkill(skill: string) {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  }

  function toggleJobType(jt: string) {
    setForm((f) => ({
      ...f,
      jobTypes: f.jobTypes.includes(jt) ? f.jobTypes.filter((s) => s !== jt) : [...f.jobTypes, jt],
    }));
  }

  function toggleAvail(day: string, slot: string) {
    setForm((f) => {
      const dayAvail = f.availabilities[day] || { matin: false, aprem: false, soir: false };
      return {
        ...f,
        availabilities: { ...f.availabilities, [day]: { ...dayAvail, [slot]: !dayAvail[slot as keyof typeof dayAvail] } },
      };
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      await signIn("credentials", { username: form.username, redirect: false });

      if (role === "STUDENT") router.push("/student/missions");
      else router.push("/company/offers");
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  const isStudent = role === "STUDENT";
  const totalSteps = isStudent ? 3 : 2;

  return (
    <main className="min-h-screen flex flex-col px-6 py-8" style={{ backgroundColor: "#F6F7EB" }}>
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1">
          <Logo size="md" />
          <p className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
            {isStudent ? "Inscription étudiant" : "Inscription entreprise"} — Étape {step}/{totalSteps}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(step / totalSteps) * 100}%`, backgroundColor: "#FD8F03" }}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Step 1 — Identité */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-heading text-xl" style={{ color: "#393E41" }}>
                {isStudent ? "Qui es-tu ?" : "Ton entreprise"}
              </h2>
              <p className="font-sans font-light text-xs mt-1" style={{ color: "#9ca3af" }}>
                Choisis un pseudo pour te connecter
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Input
                  type="text"
                  placeholder="Pseudo (ex: lucas-m)"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  className="rounded-xl h-12"
                  autoCapitalize="none"
                />
                <p className="text-xs font-sans font-light pl-1" style={{ color: "#9ca3af" }}>
                  Ce sera ton identifiant pour te reconnecter
                </p>
              </div>

              {isStudent ? (
                <>
                  <Input placeholder="Prénom" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="rounded-xl h-12" />
                  <Input placeholder="Nom" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="rounded-xl h-12" />
                  <Input placeholder="Téléphone (optionnel)" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="rounded-xl h-12" />
                </>
              ) : (
                <>
                  <Input placeholder="Nom de l'entreprise" value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} className="rounded-xl h-12" />
                  <Input placeholder="SIRET (optionnel)" value={form.siret} onChange={(e) => setField("siret", e.target.value)} className="rounded-xl h-12" />
                  <Input placeholder="Téléphone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="rounded-xl h-12" />
                  <Input placeholder="Site web (optionnel)" value={form.website} onChange={(e) => setField("website", e.target.value)} className="rounded-xl h-12" />
                  <select
                    value={form.activityType}
                    onChange={(e) => setField("activityType", e.target.value)}
                    className="h-12 rounded-xl border border-gray-200 bg-white px-3 font-sans font-light text-sm"
                    style={{ color: "#393E41" }}
                  >
                    <option value="RESTAURATION">Restauration</option>
                    <option value="COMMERCE">Commerce</option>
                    <option value="EVENEMENTIEL">Événementiel</option>
                    <option value="SERVICES">Services</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 2 Student: Skills & Job types */}
        {step === 2 && isStudent && (
          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-xl" style={{ color: "#393E41" }}>Tes compétences</h2>
            <div>
              <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>Compétences</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS_SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => toggleSkill(s)}
                    className="px-3 py-1.5 rounded-full text-sm font-sans font-light border transition-colors"
                    style={form.skills.includes(s)
                      ? { backgroundColor: "#FD8F03", color: "white", borderColor: "#FD8F03" }
                      : { backgroundColor: "white", color: "#393E41", borderColor: "#e2e3d8" }}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>Types de jobs</p>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((jt) => (
                  <button key={jt} type="button" onClick={() => toggleJobType(jt)}
                    className="px-3 py-1.5 rounded-full text-sm font-sans font-light border transition-colors"
                    style={form.jobTypes.includes(jt)
                      ? { backgroundColor: "#2292A4", color: "white", borderColor: "#2292A4" }
                      : { backgroundColor: "white", color: "#393E41", borderColor: "#e2e3d8" }}
                  >{jt}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-sans font-light text-sm mb-2" style={{ color: "#6b7280" }}>Formation</p>
              <div className="flex flex-col gap-2">
                <Input placeholder="Diplôme en cours (ex: Licence Marketing)" value={form.diploma} onChange={(e) => setField("diploma", e.target.value)} className="rounded-xl h-12" />
                <Input placeholder="Établissement" value={form.school} onChange={(e) => setField("school", e.target.value)} className="rounded-xl h-12" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 Student: Availabilities */}
        {step === 3 && isStudent && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-xl" style={{ color: "#393E41" }}>Tes disponibilités</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left font-sans font-light pb-2" style={{ color: "#6b7280" }}>Jour</th>
                    {SLOTS.map((slot) => (
                      <th key={slot} className="font-sans font-light pb-2 capitalize" style={{ color: "#6b7280" }}>{slot}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day} className="border-t border-gray-100">
                      <td className="py-2 capitalize font-sans font-light text-xs" style={{ color: "#393E41" }}>{day.slice(0, 3)}</td>
                      {SLOTS.map((slot) => (
                        <td key={slot} className="py-2 text-center">
                          <input type="checkbox"
                            checked={form.availabilities[day]?.[slot] || false}
                            onChange={() => toggleAvail(day, slot)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: "#FD8F03" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Input placeholder="Ville (ex: Paris)" value={form.address} onChange={(e) => setField("address", e.target.value)} className="rounded-xl h-12" />
          </div>
        )}

        {/* Step 2 Company: Address */}
        {step === 2 && !isStudent && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-xl" style={{ color: "#393E41" }}>Adresse de l'entreprise</h2>
            <Input placeholder="Adresse complète" value={form.address} onChange={(e) => setField("address", e.target.value)} className="rounded-xl h-12" />
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pb-8">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-4 rounded-xl font-heading text-base border-2"
              style={{ borderColor: "#2292A4", color: "#2292A4" }}
            >Retour</button>
          )}
          {step < totalSteps ? (
            <button type="button"
              onClick={() => {
                if (step === 1 && !form.username.trim()) { setError("Choisis un pseudo pour continuer"); return; }
                setError("");
                setStep((s) => s + 1);
              }}
              className="flex-1 py-4 rounded-xl text-white font-heading text-base"
              style={{ backgroundColor: "#FD8F03" }}
            >Suivant</button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex-1 py-4 rounded-xl text-white font-heading text-base disabled:opacity-60"
              style={{ backgroundColor: "#FD8F03" }}
            >{loading ? "Création..." : "C'est parti !"}</button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
