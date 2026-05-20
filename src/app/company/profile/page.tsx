"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil, Trash2, MapPin, LogOut, Phone, Globe,
  FileText, CreditCard, Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import {
  getCompanyProfile,
  setCompanyProfile,
  clearAll,
  clearRole,
} from "@/lib/storage";
import type { CompanyProfile } from "@/lib/storage";

const ACTIVITY_TYPES = [
  { value: "RESTAURATION", label: "Restauration" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "EVENEMENTIEL", label: "Événementiel" },
  { value: "SERVICES", label: "Services" },
  { value: "AUTRE", label: "Autre" },
];

const DEFAULT_PROFILE: CompanyProfile = {
  companyName: "",
  siret: null,
  activityType: "AUTRE",
  description: null,
  address: null,
  latitude: null,
  longitude: null,
  phone: null,
  website: null,
  logoUrl: null,
  iban: null,
  bic: null,
};

export default function CompanyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [form, setForm] = useState<CompanyProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const p = getCompanyProfile() || DEFAULT_PROFILE;
    setProfile(p);
    setForm(p);
    // Ne pas ouvrir automatiquement le dialog
  }, []);

  function openEdit() {
    setForm(profile);
    setEditing(true);
  }

  function saveProfile() {
    setCompanyProfile(form);
    setProfile(form);
    setEditing(false);
  }

  function handleLeave() {
    clearRole();
    router.push("/");
  }

  function handleDelete() {
    clearAll();
    router.push("/");
  }

  async function handleGeocodeAddress() {
    if (!form.address) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address)}&format=json&limit=1`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data = await res.json();
      if (data[0]) {
        setForm((f) => ({
          ...f,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        }));
      }
    } catch {}
  }

  const activityLabel =
    ACTIVITY_TYPES.find((a) => a.value === profile.activityType)?.label ||
    profile.activityType;

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Hero entièrement teal ─────────────────────────────────── */}
      <div
        className="relative flex-shrink-0 px-5 pt-12 pb-5 lg:pt-6"
        style={{ background: "linear-gradient(135deg, #2292A4 0%, #1a7a8a 100%)" }}
      >
        {/* Boutons en haut à droite */}
        <div className="absolute top-12 right-4 lg:top-6 flex items-center gap-2">
          <button
            onClick={() => router.push("/company/settings")}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <Settings size={17} color="white" />
          </button>
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 text-white font-sans font-light text-sm"
          >
            <Pencil size={14} />
            Modifier
          </button>
        </div>

        {/* Avatar */}
        <div className="mb-3 mt-1">
          <CompanyAvatar name={profile.companyName || "?"} size="lg" />
        </div>

        {/* Nom + badge */}
        <h1 className="font-heading text-xl text-white leading-tight">
          {profile.companyName || "Mon entreprise"}
        </h1>
        <span
          className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-sans font-light"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
        >
          {activityLabel}
        </span>
      </div>

      {/* ── Contenu ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none pb-8">

        {/* Notre histoire */}
        {profile.description && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-heading text-base mb-2" style={{ color: "#393E41" }}>
              Notre histoire
            </h2>
            <p className="font-sans font-light text-sm leading-relaxed" style={{ color: "#6b7280" }}>
              {profile.description}
            </p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-1">
          <h2 className="font-heading text-base mb-2" style={{ color: "#393E41" }}>
            Informations de contact
          </h2>
          <InfoRow icon={<Phone size={15} style={{ color: "#FD8F03" }} />} label="Téléphone" value={profile.phone || "—"} />
          <InfoRow icon={<Globe size={15} style={{ color: "#FD8F03" }} />} label="Site web" value={profile.website || "—"} />
          <InfoRow icon={<MapPin size={15} style={{ color: "#FD8F03" }} />} label="Adresse" value={profile.address || "—"} />
        </div>

        {/* Entreprise */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-1">
          <h2 className="font-heading text-base mb-2" style={{ color: "#393E41" }}>
            Informations entreprise
          </h2>
          <InfoRow icon={<FileText size={15} style={{ color: "#FD8F03" }} />} label="SIRET" value={profile.siret || "—"} />
          <InfoRow icon={<CreditCard size={15} style={{ color: "#FD8F03" }} />} label="IBAN" value={profile.iban || "—"} />
        </div>

        {/* Carte */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-heading text-base mb-3" style={{ color: "#393E41" }}>
            Localisation
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ height: 220 }}>
            {profile.latitude && profile.longitude ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${profile.longitude - 0.012},${profile.latitude - 0.008},${profile.longitude + 0.012},${profile.latitude + 0.008}&layer=mapnik&marker=${profile.latitude},${profile.longitude}`}
                className="w-full h-full border-0"
                title="Localisation"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2">
                <MapPin size={28} style={{ color: "#9ca3af" }} />
                <p className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>
                  Renseignez une adresse pour afficher la carte
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Changer de rôle — teal visible */}
        <button
          onClick={handleLeave}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-sans font-light text-sm border"
          style={{ borderColor: "#2292A4", color: "#2292A4", backgroundColor: "rgba(34,146,164,0.06)" }}
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

      {/* ── Dialog modifier ───────────────────────────────────────── */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Mon entreprise</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto py-2 pr-1">
            <Input
              placeholder="Nom de l'entreprise *"
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              className="rounded-xl h-12"
            />
            <textarea
              placeholder="Notre histoire (quelques mots sur votre entreprise…)"
              value={form.description || ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm font-sans font-light outline-none resize-none"
              style={{ border: "1.5px solid #e2e3d8", backgroundColor: "#fafafa", color: "#393E41" }}
            />
            <Input
              placeholder="SIRET"
              value={form.siret || ""}
              onChange={(e) => setForm((f) => ({ ...f, siret: e.target.value }))}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Téléphone"
              value={form.phone || ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Site web"
              value={form.website || ""}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              className="rounded-xl h-12"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Adresse"
                value={form.address || ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="rounded-xl h-12 flex-1"
              />
              <button
                type="button"
                onClick={handleGeocodeAddress}
                className="px-3 h-12 rounded-xl"
                style={{ backgroundColor: "#F4F4F4", color: "#2292A4" }}
                title="Géolocaliser l'adresse"
              >
                <MapPin size={18} />
              </button>
            </div>

            <p className="font-sans font-light text-xs" style={{ color: "#6b7280" }}>
              Secteur d'activité
            </p>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, activityType: a.value }))}
                  className="px-3 py-1.5 rounded-full text-xs font-sans font-light border"
                  style={
                    form.activityType === a.value
                      ? { backgroundColor: "#2292A4", color: "white", borderColor: "#2292A4" }
                      : { backgroundColor: "white", color: "#393E41", borderColor: "#e2e3d8" }
                  }
                >
                  {a.label}
                </button>
              ))}
            </div>

            <Input
              placeholder="IBAN"
              value={form.iban || ""}
              onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="BIC"
              value={form.bic || ""}
              onChange={(e) => setForm((f) => ({ ...f, bic: e.target.value }))}
              className="rounded-xl h-12"
            />
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

      {/* ── Dialog supprimer ──────────────────────────────────────── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-red-500">Réinitialiser</DialogTitle>
          </DialogHeader>
          <p className="font-sans font-light text-sm" style={{ color: "#393E41" }}>
            Toutes les données locales seront effacées. Tu retourneras à l'accueil.
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-sans font-light text-xs flex-shrink-0 w-20" style={{ color: "#9ca3af" }}>
        {label}
      </span>
      <span className="font-sans font-light text-sm truncate" style={{ color: "#393E41" }}>
        {value}
      </span>
    </div>
  );
}
