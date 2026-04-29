"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapProvider } from "@/components/MapProvider";
import { Pencil, Trash2, Eye, EyeOff, MapPin, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type CompanyProfile = {
  id: string;
  companyName: string;
  siret: string | null;
  activityType: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  iban: string | null;
  bic: string | null;
};

type Contract = {
  id: string;
  status: string;
  createdAt: string;
  match: {
    student: { firstName: string; lastName: string };
    offer: { title: string };
  };
};

const ACTIVITY_LABELS: Record<string, string> = {
  RESTAURATION: "Restauration",
  COMMERCE: "Commerce",
  EVENEMENTIEL: "Événementiel",
  SERVICES: "Services",
  AUTRE: "Autre",
};

export default function CompanyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [editing, setEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [contractDialog, setContractDialog] = useState(false);
  const [showIban, setShowIban] = useState(false);
  const [showBic, setShowBic] = useState(false);
  const [form, setForm] = useState<Partial<CompanyProfile>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/contracts").then((r) => r.json()),
    ]).then(([profileData, contractData]) => {
      setProfile(profileData.profile);
      setForm(profileData.profile || {});
      setContracts(contractData.contracts || []);
    });
  }, []);

  async function saveProfile() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

  const mapCenter = profile.latitude && profile.longitude
    ? { lat: profile.latitude, lng: profile.longitude }
    : { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white px-4 pt-12 pb-5 flex items-start justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
            {profile.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logoUrl} alt="Logo" className="object-cover w-full h-full" />
            ) : (
              <span className="font-heading text-xl" style={{ color: "#2292A4" }}>
                {profile.companyName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>{profile.companyName}</h1>
            <p className="font-sans font-light text-sm" style={{ color: "#6b7280" }}>
              {ACTIVITY_LABELS[profile.activityType] || profile.activityType}
            </p>
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
        <Section title="Informations de contact">
          <InfoRow label="Téléphone" value={profile.phone || "—"} />
          <InfoRow label="Site web" value={profile.website || "—"} />
          <InfoRow label="Adresse" value={profile.address || "—"} />
        </Section>

        <Section title="Informations entreprise">
          <InfoRow label="Raison sociale" value={profile.companyName} />
          <InfoRow label="SIRET" value={profile.siret || "—"} />
          <InfoRow label="Activité" value={ACTIVITY_LABELS[profile.activityType] || "—"} />
        </Section>

        {/* Map */}
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
                <div className="w-7 h-7 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: "#2292A4" }}>
                  <MapPin size={14} color="white" />
                </div>
              </AdvancedMarker>
            </Map>
          </div>
          </MapProvider>
        </Section>

        {/* Paiement */}
        <Section title="Paiement">
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

        {/* Contrats */}
        <Section title="Contrats">
          <button
            onClick={() => setContractDialog(true)}
            className="flex items-center gap-2 mb-3 px-4 py-2.5 rounded-xl text-white font-heading text-sm"
            style={{ backgroundColor: "#FD8F03" }}
          >
            <Plus size={16} />
            Créer un contrat
          </button>
          {contracts.length === 0 ? (
            <p className="font-sans font-light text-sm text-gray-400">Aucun contrat</p>
          ) : (
            <div className="space-y-2">
              {contracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="font-sans text-sm" style={{ color: "#393E41" }}>
                      {c.match.student.firstName} {c.match.student.lastName}
                    </p>
                    <p className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>
                      {c.match.offer.title} · {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-sans font-light"
                    style={
                      c.status === "SIGNE"
                        ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                        : { backgroundColor: "#fef3c7", color: "#d97706" }
                    }
                  >
                    {c.status === "SIGNE" ? "Signé" : "Envoyé"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <button
          onClick={() => setDeleteDialog(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-200 text-red-500 font-sans font-light text-sm mt-2"
        >
          <Trash2 size={16} />
          Supprimer le profil
        </button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto py-2">
            <Input placeholder="Nom de l'entreprise" value={form.companyName || ""} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="SIRET" value={form.siret || ""} onChange={(e) => setForm((f) => ({ ...f, siret: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="Téléphone" value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="Site web" value={form.website || ""} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="Adresse" value={form.address || ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="IBAN" value={form.iban || ""} onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))} className="rounded-xl h-12" />
            <Input placeholder="BIC" value={form.bic || ""} onChange={(e) => setForm((f) => ({ ...f, bic: e.target.value }))} className="rounded-xl h-12" />
          </div>
          <DialogFooter className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl border font-sans font-light text-sm" style={{ borderColor: "#e2e3d8" }}>Annuler</button>
            <button onClick={saveProfile} className="flex-1 py-3 rounded-xl text-white font-heading text-sm" style={{ backgroundColor: "#FD8F03" }}>Sauvegarder</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-red-500">Supprimer le profil</DialogTitle>
          </DialogHeader>
          <p className="font-sans font-light text-sm" style={{ color: "#393E41" }}>
            Cette action est irréversible. Toutes les données de l'entreprise seront supprimées.
          </p>
          <DialogFooter className="flex gap-2">
            <button onClick={() => setDeleteDialog(false)} className="flex-1 py-3 rounded-xl border font-sans font-light text-sm">Annuler</button>
            <button onClick={deleteProfile} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-heading text-sm">Supprimer</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Dialog */}
      <Dialog open={contractDialog} onOpenChange={setContractDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Nouveau contrat</DialogTitle>
          </DialogHeader>
          <p className="font-sans font-light text-sm" style={{ color: "#6b7280" }}>
            La génération de contrats PDF est disponible une fois qu'un match est accepté. Accédez à vos candidatures pour créer un contrat.
          </p>
          <DialogFooter>
            <button onClick={() => setContractDialog(false)} className="flex-1 py-3 rounded-xl text-white font-heading text-sm" style={{ backgroundColor: "#FD8F03" }}>
              Compris
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
