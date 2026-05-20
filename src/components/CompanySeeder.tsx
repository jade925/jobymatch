"use client";
import { useEffect } from "react";
import { getCompanyProfile, setCompanyProfile, getOffers, saveOffer } from "@/lib/storage";

const SEEDED_KEY = "jm:company-demo-seeded-v1";

const DEMO_COMPANY_PROFILE = {
  companyName: "Bistrot des Chartrons",
  siret: "85234718900012",
  activityType: "RESTAURATION",
  description: "Bistrot bordelais fondé en 2008 au cœur des Chartrons. Cuisine du marché, vins naturels et ambiance chaleureuse. Nous accueillons chaque semaine des événements privés et soirées thématiques dans un cadre authentique.",
  address: "16 Rue des Bahutiers, 33000 Bordeaux",
  latitude: 44.8384,
  longitude: -0.5717,
  phone: "+33 5 56 44 22 11",
  website: "www.bistrotdeschartrons.fr",
  logoUrl: null,
  iban: "FR76 3000 6000 0112 3456 7890 189",
  bic: "BNPAFRPP",
};

const DEMO_COMPANY_OFFER = {
  id: "company-demo-1",
  title: "Serveur·se de banquet",
  companyName: "Bistrot des Chartrons",
  logoUrl: null,
  description:
    "Rejoignez notre équipe pour le service du soir lors de nos soirées privées et événements. Accueil des clients, prise de commande, service à table et débarrassage. Ambiance conviviale garantie, équipe soudée.",
  activityType: "RESTAURATION",
  startDate: "2026-06-01",
  endDate: "2026-08-31",
  hourlyRate: 12.0,
  nbPositions: 3,
  location: "16 Rue des Bahutiers, 33000 Bordeaux",
  latitude: 44.8384,
  longitude: -0.5717,
  requiredSkills: ["Service en salle", "HACCP", "Relation client"],
  schedules: {},
  jobType: "RESTAURATION",
  isDemo: false,
  status: "ACTIVE" as const,
};

export function CompanySeeder() {
  useEffect(() => {
    if (localStorage.getItem(SEEDED_KEY)) return;

    // Seed profile only if none exists
    if (!getCompanyProfile()) {
      setCompanyProfile(DEMO_COMPANY_PROFILE);
    }

    // Seed offer only if not already present
    const existing = getOffers().find((o) => o.id === DEMO_COMPANY_OFFER.id);
    if (!existing) {
      saveOffer(DEMO_COMPANY_OFFER);
    }

    localStorage.setItem(SEEDED_KEY, "1");
  }, []);

  return null;
}
