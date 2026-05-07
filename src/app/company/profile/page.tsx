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
    if (!getCompanyProfile()) setEditing(true);
  }, []);

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
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(form.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.results?.[0]?.geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
      }
    } catch {}
  }

  const mapCenter =
    profile.latitude && profile.longitude
      ? { lat: profile.latitude, lng: profile.longitude }
      : { lat: 48.8566, lng: 2.3522 };

  const activityLabel =
    ACTIVITY_TYPES.find((a) => a.value === profile.activityType)?.label ||
    profile.activityType;

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white px-4 pt-12 pb-5 flex items-start justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
            <span
              className="font-heading text-xl"
              style={{ color: "#2292A4" }}
            >
              {profile.companyName
                ? profile.companyName.charAt(0).toUpperCase()
                : "?"}
            </span>
          </div>
          <div>
            <h1
              className="font-heading text-xl"
              style={{ color: "#393E41" }}
            >
              {profile.companyName || "Mon entreprise"}
            </h1>
            <p
              className="font-sans font-light text-sm"
              style={{ color: "#6b7280" }}
            >
              {activityLabel}
            </p>
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
        <Section title="Informations de contact">
          <InfoRow label="Téléphone" value={profile.phone || "—"} />
          <InfoRow label="Site web" value={profile.website || "—"} />
          <InfoRow label="Adresse" value={profile.address || "—"} />
        </Section>

        <Section title="Informations entreprise">
          <InfoRow label="Raison sociale" value={profile.companyName || "—"} />
          <InfoRow label="SIRET" value={profile.siret || "—"} />
          <InfoRow label="Activité" value={activityLabel} />
        </Section>

        <Section title="Localisation">
          <MapProvider>
            <div className="rounded-2xl overflow-hidden mt-2" style={{ height: 200 }}>
              <Map
                defaultCenter={mapCenter}
                defaultZoom={14}
                gestureHandling="cooperative"
                disableDefaultUI
                mapId="company-profile-map"
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
            <DialogTitle className="font-heading">Mon entreprise</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto py-2 pr-1">
            <Input
              placeholder="Nom de l'entreprise *"
              value={form.companyName}
              onChange={(e) =>
                setForm((f) => ({ ...f, companyName: e.target.value }))
              }
              className="rounded-xl h-12"
            />
            <Input
              placeholder="SIRET"
              value={form.siret || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, siret: e.target.value }))
              }
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Téléphone"
              value={form.phone || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Site web"
              value={form.website || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, website: e.target.value }))
              }
              className="rounded-xl h-12"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Adresse"
                value={form.address || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                className="rounded-xl h-12 flex-1"
              />
              <button
                type="button"
                onClick={handleGeocodeAddress}
                className="px-3 h-12 rounded-xl"
                style={{ backgroundColor: "#F6F7EB", color: "#2292A4" }}
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
                  onClick={() =>
                    setForm((f) => ({ ...f, activityType: a.value }))
                  }
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
            Toutes les données locales seront effacées. Tu retourneras à
            l'accueil.
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
