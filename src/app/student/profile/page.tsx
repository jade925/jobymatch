"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil, Trash2, MapPin, LogOut, Settings, X, Check,
  GraduationCap, Briefcase, Clock, FileText, ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getStudentProfile, setStudentProfile, clearAll, clearRole } from "@/lib/storage";
import type { StudentProfile } from "@/lib/storage";

// ─── Constants ───────────────────────────────────────────────────────────────
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
  firstName: "", lastName: "", gender: null, dateOfBirth: null,
  phone: null, address: null, latitude: null, longitude: null,
  diploma: null, school: null, skills: [], jobTypes: [],
  availabilities: {}, bio: null, iban: null, bic: null, photoUrl: null, cvUrl: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function countAvailDays(avail: Record<string, Record<string, boolean>>) {
  return DAYS.filter((d) => Object.values(avail[d] || {}).some(Boolean)).length;
}

// ─── Availability Sheet ───────────────────────────────────────────────────────
function AvailSheet({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean;
  value: Record<string, Record<string, boolean>>;
  onClose: () => void;
  onSave: (v: Record<string, Record<string, boolean>>) => void;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => { setLocal(value); }, [value, open]);

  function toggle(day: string, slot: string) {
    setLocal((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || { matin: false, aprem: false, soir: false }),
        [slot]: !(prev[day]?.[slot] ?? false),
      },
    }));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white flex flex-col"
        style={{ maxHeight: "85dvh" }}
      >
        {/* Handle */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
          <h2 className="font-heading text-lg" style={{ color: "#393E41" }}>
            Mes disponibilités
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ backgroundColor: "#F4F4F4" }}>
            <X size={16} style={{ color: "#393E41" }} />
          </button>
        </div>

        <div className="px-5 pb-2 flex-shrink-0">
          <p className="font-sans text-xs font-light" style={{ color: "#9ca3af" }}>
            Sélectionne les créneaux où tu es disponible.
          </p>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2 scrollbar-none">
          {DAYS.map((day) => {
            const hasAny = SLOTS.some((s) => local[day]?.[s]);
            return (
              <div
                key={day}
                className="rounded-2xl p-3.5 transition-colors"
                style={{ backgroundColor: hasAny ? "rgba(253,143,3,0.05)" : "#F4F4F4" }}
              >
                <p
                  className="font-sans text-xs font-light capitalize mb-2.5"
                  style={{ color: hasAny ? "#FD8F03" : "#9ca3af", fontWeight: hasAny ? 500 : 300 }}
                >
                  {day}
                </p>
                <div className="flex gap-2">
                  {SLOTS.map((slot) => {
                    const active = local[day]?.[slot] ?? false;
                    return (
                      <button
                        key={slot}
                        onClick={() => toggle(day, slot)}
                        className="flex-1 py-2 rounded-xl text-xs font-sans font-light transition-all"
                        style={
                          active
                            ? { backgroundColor: "#FD8F03", color: "white" }
                            : { backgroundColor: "white", color: "#9ca3af", border: "1.5px solid #e2e3d8" }
                        }
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => { onSave(local); onClose(); }}
            className="w-full py-3.5 rounded-2xl text-white font-heading text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: "#FD8F03" }}
          >
            <Check size={16} />
            Confirmer mes disponibilités
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfileState] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const [form, setForm] = useState<StudentProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const p = getStudentProfile() || DEFAULT_PROFILE;
    setProfileState(p);
    setForm(p);
    if (!getStudentProfile()) setEditing(true);
  }, []);

  function saveProfile() {
    setStudentProfile(form);
    setProfileState(form);
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
      jobTypes: f.jobTypes.includes(jt) ? f.jobTypes.filter((x) => x !== jt) : [...f.jobTypes, jt],
    }));
  }

  function handleAvailSave(avail: Record<string, Record<string, boolean>>) {
    const updated = { ...profile, availabilities: avail };
    setStudentProfile(updated);
    setProfileState(updated);
    setForm(updated);
  }

  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "Mon profil";

  const availDays = countAvailDays(profile.availabilities);

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Hero header ── */}
      <div className="relative bg-white border-b border-gray-100 overflow-hidden">
        {/* Gradient band */}
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(253,143,3,0.15) 0%, rgba(34,146,164,0.08) 100%)" }}
        />
        <div className="relative px-5 pt-12 pb-5 lg:pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #FD8F03 0%, rgba(253,143,3,0.7) 100%)" }}
              >
                <span className="font-heading text-3xl text-white">
                  {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
              <div>
                <h1 className="font-heading text-xl leading-tight" style={{ color: "#393E41" }}>
                  {displayName}
                </h1>
                {profile.diploma && (
                  <p className="font-sans font-light text-sm mt-0.5" style={{ color: "#6b7280" }}>
                    {profile.diploma}
                  </p>
                )}
                {profile.school && (
                  <p className="font-sans font-light text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                    {profile.school}
                  </p>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/student/settings")}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#F4F4F4", color: "#9ca3af" }}
              >
                <Settings size={16} />
              </button>
              <button
                onClick={() => { setForm(profile); setEditing(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-sans font-light"
                style={{ backgroundColor: "rgba(253,143,3,0.1)", color: "#FD8F03" }}
              >
                <Pencil size={13} />
                Modifier
              </button>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="font-sans font-light text-sm mt-4 leading-relaxed" style={{ color: "#6b7280" }}>
              {profile.bio}
            </p>
          )}

          {/* Quick stats */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {profile.phone && (
              <span className="text-xs font-sans font-light px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F4F4F4", color: "#6b7280" }}>
                📞 {profile.phone}
              </span>
            )}
            {profile.address && (
              <span className="text-xs font-sans font-light px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F4F4F4", color: "#6b7280" }}>
                📍 {profile.address.split(",")[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none pb-8">

        {/* Compétences */}
        {profile.skills.length > 0 && (
          <Card
            icon={<GraduationCap size={16} style={{ color: "#FD8F03" }} />}
            title="Compétences"
          >
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.skills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-sans font-light" style={{ backgroundColor: "rgba(253,143,3,0.1)", color: "#FD8F03" }}>
                  {s}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Secteurs */}
        {profile.jobTypes.length > 0 && (
          <Card
            icon={<Briefcase size={16} style={{ color: "#2292A4" }} />}
            title="Secteurs recherchés"
          >
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.jobTypes.map((jt) => (
                <span key={jt} className="px-3 py-1 rounded-full text-xs font-sans font-light" style={{ backgroundColor: "#F4F4F4", color: "#2292A4" }}>
                  {jt}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Disponibilités */}
        <button
          onClick={() => setAvailOpen(true)}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
          style={{ border: "1px solid #f1f2e8" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(253,143,3,0.1)" }}>
              <Clock size={15} style={{ color: "#FD8F03" }} />
            </div>
            <div className="text-left">
              <p className="font-heading text-sm" style={{ color: "#393E41" }}>Disponibilités</p>
              <p className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>
                {availDays > 0 ? `${availDays} jour${availDays > 1 ? "s" : ""} disponible${availDays > 1 ? "s" : ""}` : "Non renseignées"}
              </p>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "#9ca3af" }} />
        </button>

        {/* Formation */}
        {(profile.diploma || profile.school) && (
          <Card
            icon={<GraduationCap size={16} style={{ color: "#2292A4" }} />}
            title="Formation"
          >
            <div className="mt-3 space-y-2">
              {profile.diploma && (
                <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>Diplôme</span>
                  <span className="font-sans font-light text-sm" style={{ color: "#393E41" }}>{profile.diploma}</span>
                </div>
              )}
              {profile.school && (
                <div className="flex justify-between py-1.5">
                  <span className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>Établissement</span>
                  <span className="font-sans font-light text-sm text-right" style={{ color: "#393E41", maxWidth: "60%" }}>{profile.school}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Localisation */}
        <Card
          icon={<MapPin size={16} style={{ color: "#2292A4" }} />}
          title="Ma localisation"
        >
          <div className="rounded-2xl overflow-hidden mt-3" style={{ height: 160 }}>
            {profile.latitude && profile.longitude ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${profile.longitude - 0.02},${profile.latitude - 0.02},${profile.longitude + 0.02},${profile.latitude + 0.02}&layer=mapnik&marker=${profile.latitude},${profile.longitude}`}
                className="w-full h-full border-0"
                title="Ma localisation"
              />
            ) : (
              <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-2" style={{ backgroundColor: "#F4F4F4" }}>
                <MapPin size={24} style={{ color: "#9ca3af" }} />
                <p className="font-sans text-xs font-light" style={{ color: "#9ca3af" }}>Adresse non renseignée</p>
              </div>
            )}
          </div>
        </Card>

        {/* CV */}
        <Card
          icon={<FileText size={16} style={{ color: "#6b7280" }} />}
          title="Documents"
        >
          <div className="mt-3 flex items-center justify-between py-2">
            <div>
              <p className="font-sans font-light text-sm" style={{ color: "#393E41" }}>Curriculum Vitae</p>
              <p className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>
                {profile.cvUrl ? "CV importé" : "Aucun CV importé"}
              </p>
            </div>
            <span
              className="px-3 py-1.5 rounded-xl text-xs font-sans font-light border"
              style={{ borderColor: "#e2e3d8", color: "#9ca3af" }}
            >
              {profile.cvUrl ? "Voir" : "Importer"}
            </span>
          </div>
        </Card>

        {/* Danger zone */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => { clearRole(); router.push("/"); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border font-sans font-light text-sm"
            style={{ borderColor: "#e2e3d8", color: "#9ca3af" }}
          >
            <LogOut size={16} />
            Changer de rôle
          </button>
          <button
            onClick={() => setDeleteDialog(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border font-sans font-light text-sm"
            style={{ borderColor: "#fecaca", color: "#ef4444" }}
          >
            <Trash2 size={16} />
            Réinitialiser mes données
          </button>
        </div>
      </div>

      {/* ── Availability Sheet ── */}
      <AvailSheet
        open={availOpen}
        value={profile.availabilities}
        onClose={() => setAvailOpen(false)}
        onSave={handleAvailSave}
      />

      {/* ── Edit Dialog ── */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Modifier mon profil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 max-h-[68vh] overflow-y-auto py-2 pr-1 scrollbar-none">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Prénom *"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="rounded-xl h-11"
              />
              <Input
                placeholder="Nom *"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="rounded-xl h-11"
              />
            </div>
            <textarea
              placeholder="Bio (quelques mots sur toi…)"
              value={form.bio || ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm font-sans font-light outline-none resize-none"
              style={{ border: "1.5px solid #e2e3d8", backgroundColor: "#fafafa", color: "#393E41" }}
            />
            <Input
              placeholder="Téléphone"
              value={form.phone || ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-xl h-11"
            />
            <Input
              placeholder="Adresse"
              value={form.address || ""}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="rounded-xl h-11"
            />
            <Input
              placeholder="Diplôme"
              value={form.diploma || ""}
              onChange={(e) => setForm((f) => ({ ...f, diploma: e.target.value }))}
              className="rounded-xl h-11"
            />
            <Input
              placeholder="École / Université"
              value={form.school || ""}
              onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
              className="rounded-xl h-11"
            />

            <p className="font-sans font-light text-xs pt-1" style={{ color: "#6b7280" }}>
              Compétences
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILLS_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-sans font-light border transition-all"
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

            <p className="font-sans font-light text-xs pt-1" style={{ color: "#6b7280" }}>
              Secteurs recherchés
            </p>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((jt) => (
                <button
                  key={jt}
                  type="button"
                  onClick={() => toggleJobType(jt)}
                  className="px-3 py-1.5 rounded-full text-xs font-sans font-light border transition-all"
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

            <p className="font-sans font-light text-xs pt-1" style={{ color: "#6b7280" }}>
              Disponibilités
            </p>
            <button
              type="button"
              onClick={() => { saveProfile(); setTimeout(() => setAvailOpen(true), 100); }}
              className="w-full py-3 rounded-xl border font-sans font-light text-sm flex items-center justify-between px-4"
              style={{ borderColor: "#e2e3d8", color: "#393E41" }}
            >
              <span className="flex items-center gap-2">
                <Clock size={14} style={{ color: "#FD8F03" }} />
                Gérer mes disponibilités
              </span>
              <ChevronRight size={14} style={{ color: "#9ca3af" }} />
            </button>
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

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-red-500">Réinitialiser</DialogTitle>
          </DialogHeader>
          <p className="font-sans font-light text-sm" style={{ color: "#393E41" }}>
            Toutes tes données locales seront effacées. Tu retourneras à l'accueil.
          </p>
          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setDeleteDialog(false)}
              className="flex-1 py-3 rounded-xl border font-sans font-light text-sm"
              style={{ borderColor: "#e2e3d8" }}
            >
              Annuler
            </button>
            <button
              onClick={() => { clearAll(); router.push("/"); }}
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

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm" style={{ border: "1px solid #f1f2e8" }}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-heading text-sm" style={{ color: "#393E41" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
