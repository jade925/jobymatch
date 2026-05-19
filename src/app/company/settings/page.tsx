"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Shield, Info, ChevronRight, Moon, Globe, Users } from "lucide-react";

type SettingRow = {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
};

function Row({ icon, label, description, action, onClick }: SettingRow) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 text-left"
      style={{ backgroundColor: "white" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#F4F4F4" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm" style={{ color: "#393E41" }}>{label}</p>
        {description && (
          <p className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>{description}</p>
        )}
      </div>
      {action ?? <ChevronRight size={15} style={{ color: "#d1d5db" }} />}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-4 pb-1.5 font-sans text-xs font-light uppercase tracking-wider" style={{ color: "#9ca3af" }}>
        {title}
      </p>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #f1f2e8" }}>
        {children}
      </div>
    </div>
  );
}

export default function CompanySettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 lg:pt-6 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center lg:hidden"
          style={{ backgroundColor: "#F4F4F4" }}
        >
          <ArrowLeft size={18} style={{ color: "#393E41" }} />
        </button>
        <div>
          <h1 className="font-heading" style={{ color: "#393E41", fontSize: 26 }}>Réglages</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scrollbar-none pb-8">

        {/* Notifications */}
        <Section title="Notifications">
          <Row
            icon={<Bell size={16} style={{ color: "#FD8F03" }} />}
            label="Nouvelles candidatures"
            description="Alertes à chaque nouvelle candidature"
            action={
              <div className="w-11 h-6 rounded-full flex items-center px-1" style={{ backgroundColor: "#FD8F03" }}>
                <div className="w-4 h-4 rounded-full bg-white ml-auto shadow-sm" />
              </div>
            }
          />
          <Row
            icon={<Bell size={16} style={{ color: "#9ca3af" }} />}
            label="Messages"
            description="Notifications de nouveaux messages"
            action={
              <div className="w-11 h-6 rounded-full flex items-center px-1" style={{ backgroundColor: "#e2e3d8" }}>
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            }
          />
          <Row
            icon={<Users size={16} style={{ color: "#9ca3af" }} />}
            label="Rappels calendrier"
            description="Rappel avant chaque mission programmée"
            action={
              <div className="w-11 h-6 rounded-full flex items-center px-1" style={{ backgroundColor: "#e2e3d8" }}>
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            }
          />
        </Section>

        {/* Apparence */}
        <Section title="Apparence">
          <Row
            icon={<Moon size={16} style={{ color: "#393E41" }} />}
            label="Mode sombre"
            description="Bientôt disponible"
            action={
              <div className="w-11 h-6 rounded-full flex items-center px-1" style={{ backgroundColor: "#e2e3d8", opacity: 0.5 }}>
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            }
          />
          <Row
            icon={<Globe size={16} style={{ color: "#2292A4" }} />}
            label="Langue"
            description="Français"
            action={<span className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>FR</span>}
          />
        </Section>

        {/* Confidentialité */}
        <Section title="Confidentialité">
          <Row
            icon={<Shield size={16} style={{ color: "#2292A4" }} />}
            label="Données entreprise"
            description="Toutes les données sont stockées localement"
          />
          <Row
            icon={<Shield size={16} style={{ color: "#9ca3af" }} />}
            label="Politique de confidentialité"
          />
        </Section>

        {/* À propos */}
        <Section title="À propos">
          <Row
            icon={<Info size={16} style={{ color: "#FD8F03" }} />}
            label="Version"
            description="JOBYMATCH v2.0"
            action={<span className="font-sans font-light text-xs" style={{ color: "#9ca3af" }}>2.0.0</span>}
          />
          <Row
            icon={<Info size={16} style={{ color: "#9ca3af" }} />}
            label="Mentions légales"
          />
        </Section>

        <p className="text-center font-sans font-light text-xs pb-4" style={{ color: "#d1d5db" }}>
          Fait avec ♥ pour les entreprises
        </p>
      </div>
    </div>
  );
}
