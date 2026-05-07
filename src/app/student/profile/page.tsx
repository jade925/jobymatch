"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapProvider } from "@/components/MapProvider";
import { Pencil, Trash2, MapPin, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getStudentProfile,
  setStudentProfile,
  clearAll,
  clearRole,
} from "@/lib/storage";
import type { StudentProfile } from "@/lib/storage";

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const SLOTS = ["matin", "aprem", "soir"];
const SKILLS_SUGGESTIONS = [
  "Service en salle","Caisse","Cuisine","Manutention","Vente",
  "Accueil","Conduite","Informatique","Langues","Communication",
];
const JOB_TYPES = [
  "Restauration","Commerce","Événementiel","Services","Livraison","Hôtellerie","Autre",
];

const DEFAULT_PROFILE: StudentProfile = {
  firstName: "",
  lastName: "",
  gender: null,
  dateOfBirth: null,
  phone: null,
  address: null,
  latitude: null,
  longitude: null,
  diploma: null,
  school: null,
  skills: [],
  jobTypes: [],
  availabilities: {},
  iban: null,
  bic: null,
  photoUrl: null,
  cvUrl: null,
};

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [form, setForm] = useState<StudentProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const p = getStudentProfile() || DEFAULT_PROFILE;
    setProfile(p);
    setForm(p);
    // If no profile yet, open editor immediately
    if (!getStudentProfile()) setEditing(true);
  }, []);

  function saveProfile() {
    setStudentProfile(form);
    setProfile(form);
    setEditing(false);
  }

  function toggleSkill(s: string) {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
    }));
  }

  function toggleJobType(jt: string) {
    setForm((f) => ({
      ...f,
      jobTypes: f.jobTypes.includes(jt)
        ? f.jobTypes.filter((x) => x !== jt)
        : [...f.jobTypes, jt],
    }));
  }

  function toggleAvail(day: string, slot: string) {
    setForm((f) => ({
      ...f,
      availabilities: {
        ...f.availabilities,
        [day]: {
          ...(f.availabilities[day] || { matin: false, aprem: false, soir: false }),
          [slot]: !(f.availabilities[day]?.[slot] ?? false),
        },
      },
    }));
  }

  function handleLeave() {
    clearRole();
    router.push("/");
  }

  function handleDelete() {
    clearAll();
    router.push("/");
  }

  const mapCenter =
    profile.latitude && profile.longitude
      ? { lat: profile.latitude, lng: profile.longitude }
      : { lat: 48.8566, lng: 2.3522 };

  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "Mon profil";

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-5 flex items-start justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            <span className="font-heading text-2xl" style={{ color: "#FD8F03" }}>
              {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <div>
            <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>
              {displayName}
            </h1>
            {profile.diploma && (
              <p className="font-sans font-light text-sm" style={{ color: "#6b7280" }}>
                {profile.diploma}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => { setForm(profile); setEditing(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-sans font-light"
          style={{ borderColor: "#FD8F03", color: "#FD8F03" }}
        >
          <Pencil size={14} />
          Modifier
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none pb-6">
        <Section title="Informations personnelles">
          <InfoRow label="Téléphone" value={profile.phone || "—"} />
          <InfoRow label="Adresse" value={profile.address || "—"} />
          {profile.dateOfBirth && (
            <InfoRow label="Naissance" value={profile.dateOfBirth} />
          )}
        </Section>

        <Section title="Formation & Compétences">
          {profile.diploma && <InfoRow label="Diplôme" value={profile.diploma} />}
          {profile.school && <InfoRow label="Établissement" value={profile.school} />}
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-sans font-light"
                  style={{ backgroundColor: "#fff3e0", color: "#FD8F03" }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {profile.jobTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.jobTypes.map((jt) => (
                <span
                  key={jt}
                  className="px-3 py-1 rounded-full text-xs font-sans font-light"
                  style={{ backgroundColor: "#e0f2f4", color: "#2292A4" }}
                >
                  {jt}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3">
            <p className="font-sans font-light text-xs mb-2" style={{ color: "#6b7280" }}>
              Disponibilités
            </p>
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
                      <td className="py-1 capitalize font-sans font-light" style={{ color: "#393E41" }}>
                        {day.slice(0, 3)}
                      </td>
                      {SLOTS.map((slot) => (
                        <td key={slot} className="text-center">
                          <div
                            className="w-4 h-4 rounded mx-auto"
                            style={{
                              backgroundColor: profile.availabilities[day]?.[slot]
                                ? "#FD8F03"
                                : "#e2e3d8",
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
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shadow"
                    style={{ backgroundColor: "#2292A4" }}
                  >
                    <MapPin size={14} color="white" />
                  </div>
                </AdvancedMarker>
              </Map>
            </div>
          </MapProvider>
        </Section>

        <button
          onClick={handleLeave}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border font-sans font-light text-sm"
          style={{ borderColor: "#e2e3d8", color: "#9ca3af" }}
        >
          <LogOut size={16} />
          Changer de rôle
        </button>

        <button
          onClick={() => setDeleteDialog(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-200 text-red-500 font-sans font-light text-sm"
        >
          <Trash2 size={16} />
          Réinitialiser mes données
        </button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Mon profil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto py-2 pr-1">
            <Input
              placeholder="Prénom *"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Nom *"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Téléphone"
              value={form.phone || ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Adresse"
              value={form.address || ""}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Diplôme"
              value={form.diploma || ""}
              onChange={(e) => setForm((f) => ({ ...f, diploma: e.target.value }))}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="École / Université"
              value={form.school || ""}
              onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
              className="rounded-xl h-12"
            />

            <p className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
              Compétences
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILLS_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-sans font-light border"
                  style={
                    form.skills.includes(s)
                      ? { backgroundColor: "#FD8F03", color: "white", borderColor: "#FD8F03" }
                      : { backgroundColor: "white", color: "#393E41", borderColor: "#e2e3d8" }
                  }
                >
                  {s}
                </button>
              ))}
            </div>

            <p className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
              Types de job
            </p>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((jt) => (
                <button
                  key={jt}
                  type="button"
                  onClick={() => toggleJobType(jt)}
                  className="px-3 py-1.5 rounded-full text-xs font-sans font-light border"
                  style={
                    form.jobTypes.includes(jt)
                      ? { backgroundColor: "#2292A4", color: "white", borderColor: "#2292A4" }
                      : { backgroundColor: "white", color: "#393E41", borderColor: "#e2e3d8" }
                  }
                >
                  {jt}
                </button>
              ))}
            </div>

            <p className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
              Disponibilités
            </p>
            <div className="space-y-1">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-3">
                  <span
                    className="w-14 text-xs font-sans font-light capitalize"
                    style={{ color: "#393E41" }}
                  >
                    {day.slice(0, 3)}.
                  </span>
                  {SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleAvail(day, slot)}
                      className="px-2 py-1 rounded-lg text-xs font-sans font-light border"
                      style={
                        form.availabilities[day]?.[slot]
                          ? { backgroundColor: "#FD8F03", color: "white", borderColor: "#FD8F03" }
                          : { backgroundColor: "white", color: "#9ca3af", borderColor: "#e2e3d8" }
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex gap-2 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-3 rounded-xl border font-sans font-light text-sm"
              style={{ borderColor: "#e2e3d8" }}
            >
              Annuler
            </button>
            <button
              onClick={saveProfile}
              className="flex-1 py-3 rounded-xl text-white font-heading text-sm"
              style={{ backgroundColor: "#FD8F03" }}
            >
              Sauvegarder
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-red-500">
              Réinitialiser
            </DialogTitle>
          </DialogHeader>
          <p className="font-sans font-light text-sm" style={{ color: "#393E41" }}>
            Toutes tes données locales seront effacées. Tu retourneras à l'accueil.
          </p>
          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setDeleteDialog(false)}
              className="flex-1 py-3 rounded-xl border font-sans font-light text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-heading text-sm"
            >
              Réinitialiser
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
      <h2 className="font-heading text-base mb-3" style={{ color: "#393E41" }}>
        {title}
      </h2>
      <Separator className="mb-3" />
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>
        {label}
      </span>
      <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>
        {value}
      </span>
    </div>
  );
}
