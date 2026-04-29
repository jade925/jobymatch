"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapProvider } from "@/components/MapProvider";
import { Pencil, Trash2, Eye, EyeOff, Upload, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type StudentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  diploma: string | null;
  school: string | null;
  skills: string;
  jobTypes: string;
  availabilities: string;
  iban: string | null;
  bic: string | null;
  photoUrl: string | null;
  cvUrl: string | null;
};

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const SLOTS = ["matin", "aprem", "soir"];

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [showIban, setShowIban] = useState(false);
  const [showBic, setShowBic] = useState(false);
  const [form, setForm] = useState<Partial<StudentProfile>>({});

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        setForm(d.profile || {});
      });
  }, []);

  async function saveProfile() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        skills: form.skills ? JSON.parse(form.skills as string) : [],
        jobTypes: form.jobTypes ? JSON.parse(form.jobTypes as string) : [],
        availabilities: form.availabilities ? JSON.parse(form.availabilities as string) : {},
      }),
    });
    const data = await res.json();
    setProfile(data.profile);
    setEditing(false);
  }

  async function deleteProfile() {
    await fetch("/api/profile", { method: "DELETE" });
    await signOut({ redirect: false });
    router.push("/");
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FD8F03", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const skills: string[] = JSON.parse(profile.skills || "[]");
  const jobTypes: string[] = JSON.parse(profile.jobTypes || "[]");
  const availabilities = JSON.parse(profile.availabilities || "{}");
  const mapCenter = profile.latitude && profile.longitude
    ? { lat: profile.latitude, lng: profile.longitude }
    : { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-5 flex items-start justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt="Photo" className="object-cover w-full h-full" />
            ) : (
              <span className="font-heading text-2xl" style={{ color: "#FD8F03" }}>
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>
              {profile.firstName} {profile.lastName}
            </h1>
            {profile.diploma && (
              <p className="font-sans font-light text-sm" style={{ color: "#6b7280" }}>{profile.diploma}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-sans font-light"
          style={{ borderColor: "#FD8F03", color: "#FD8F03" }}
        >
          <Pencil size={14} />
          Modifier
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none pb-6">
        {/* Infos personnelles */}
        <Section title="Informations personnelles">
          <InfoRow label="Email" value="(voir compte)" />
          <InfoRow label="Téléphone" value={profile.phone || "—"} />
          <InfoRow label="Adresse" value={profile.address || "—"} />
          {profile.dateOfBirth && <InfoRow label="Naissance" value={profile.dateOfBirth} />}
          {profile.gender && <InfoRow label="Sexe" value={profile.gender} />}
        </Section>

        {/* Formation & Compétences */}
        <Section title="Formation & Compétences">
          {profile.diploma && <InfoRow label="Diplôme" value={profile.diploma} />}
          {profile.school && <InfoRow label="Établissement" value={profile.school} />}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-sans font-light" style={{ backgroundColor: "#fff3e0", color: "#FD8F03" }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {jobTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {jobTypes.map((jt) => (
                <span key={jt} className="px-3 py-1 rounded-full text-xs font-sans font-light" style={{ backgroundColor: "#e0f2f4", color: "#2292A4" }}>
                  {jt}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3">
            <p className="font-sans font-light text-xs mb-2" style={{ color: "#6b7280" }}>Disponibilités</p>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr>
                    <th className="text-left font-sans font-light" style={{ color: "#9ca3af" }}>Jour</th>
                    {SLOTS.map((s) => (
                      <th key={s} className="font-sans font-light capitalize text-center" style={{ color: "#9ca3af" }}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td className="py-1 capitalize font-sans font-light" style={{ color: "#393E41" }}>{day.slice(0, 3)}</td>
                      {SLOTS.map((slot) => (
                        <td key={slot} className="text-center">
                          <div
                            className="w-4 h-4 rounded mx-auto"
                            style={{
                              backgroundColor: availabilities[day]?.[slot] ? "#FD8F03" : "#e2e3d8",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Documents */}
        <Section title="Documents">
          <div className="flex items-center justify-between py-2">
            <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>CV</span>
            {profile.cvUrl ? (
              <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="text-sm underline" style={{ color: "#FD8F03" }}>
                Télécharger
              </a>
            ) : (
              <label className="flex items-center gap-1 text-sm cursor-pointer" style={{ color: "#FD8F03" }}>
                <Upload size={14} />
                Ajouter
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
              </label>
            )}
          </div>
        </Section>

        {/* Coordonnées bancaires */}
        <Section title="Coordonnées bancaires">
          <div className="flex items-center justify-between py-1">
            <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>IBAN</span>
            <div className="flex items-center gap-2">
              <span className="font-sans font-light text-sm" style={{ color: "#6b7280" }}>
                {showIban ? (profile.iban || "Non renseigné") : "•••• •••• ••••"}
              </span>
              <button onClick={() => setShowIban(!showIban)}>
                {showIban ? <EyeOff size={14} style={{ color: "#9ca3af" }} /> : <Eye size={14} style={{ color: "#9ca3af" }} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>BIC</span>
            <div className="flex items-center gap-2">
              <span className="font-sans font-light text-sm" style={{ color: "#6b7280" }}>
                {showBic ? (profile.bic || "Non renseigné") : "••••••••"}
              </span>
              <button onClick={() => setShowBic(!showBic)}>
                {showBic ? <EyeOff size={14} style={{ color: "#9ca3af" }} /> : <Eye size={14} style={{ color: "#9ca3af" }} />}
              </button>
            </div>
          </div>
        </Section>

        {/* Localisation */}
        <Section title="Ma localisation">
          <MapProvider>
          <div className="rounded-2xl overflow-hidden mt-2" style={{ height: 180 }}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={11}
              gestureHandling="none"
              disableDefaultUI
              mapId="student-profile-map"
            >
              <AdvancedMarker position={mapCenter}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: "#2292A4" }}>
                  <MapPin size={14} color="white" />
                </div>
              </AdvancedMarker>
            </Map>
          </div>
          </MapProvider>
        </Section>

        {/* Supprimer */}
        <button
          onClick={() => setDeleteDialog(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-200 text-red-500 font-sans font-light text-sm mt-2"
        >
          <Trash2 size={16} />
          Supprimer mon profil
        </button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto py-2">
            <Input placeholder="Prénom" value={form.firstName || ""} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="Nom" value={form.lastName || ""} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="Téléphone" value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="Adresse" value={form.address || ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="Diplôme" value={form.diploma || ""} onChange={(e) => setForm((f) => ({ ...f, diploma: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="École" value={form.school || ""} onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="IBAN" value={form.iban || ""} onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="BIC" value={form.bic || ""} onChange={(e) => setForm((f) => ({ ...f, bic: e.target.value }))} className="rounded-xl h-12" />
          </div>
          <DialogFooter className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl border font-sans font-light text-sm" style={{ borderColor: "#e2e3d8" }}>
              Annuler
            </button>
            <button onClick={saveProfile} className="flex-1 py-3 rounded-xl text-white font-heading text-sm" style={{ backgroundColor: "#FD8F03" }}>
              Sauvegarder
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-red-500">Supprimer mon profil</DialogTitle>
          </DialogHeader>
          <p className="font-sans font-light text-sm" style={{ color: "#393E41" }}>
            Cette action est irréversible. Toutes tes données seront définitivement supprimées.
          </p>
          <DialogFooter className="flex gap-2">
            <button onClick={() => setDeleteDialog(false)} className="flex-1 py-3 rounded-xl border font-sans font-light text-sm">
              Annuler
            </button>
            <button onClick={deleteProfile} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-heading text-sm">
              Supprimer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h2 className="font-heading text-base mb-3" style={{ color: "#393E41" }}>{title}</h2>
      <Separator className="mb-3" />
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>{label}</span>
      <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>{value}</span>
    </div>
  );
}
