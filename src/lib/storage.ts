// ─── Keys ───────────────────────────────────────────────────────────────────
const ROLE_KEY = "jm:role";
const STUDENT_KEY = "jm:studentProfile";
const COMPANY_KEY = "jm:companyProfile";
const OFFERS_KEY = "jm:offers";
const MATCHES_KEY = "jm:matches";
const msgKey = (matchId: string) => `jm:messages:${matchId}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function get<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// ─── Types ───────────────────────────────────────────────────────────────────
export type Role = "STUDENT" | "COMPANY";

export type StudentProfile = {
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
  skills: string[];
  jobTypes: string[];
  availabilities: Record<string, Record<string, boolean>>;
  iban: string | null;
  bic: string | null;
  photoUrl: string | null;
  cvUrl: string | null;
};

export type CompanyProfile = {
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

export type Offer = {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  hourlyRate: number;
  nbPositions: number;
  latitude: number | null;
  longitude: number | null;
  requiredSkills: string[];
  schedules: Record<string, { start: string; end: string } | null>;
  jobType: string;
  status: "ACTIVE" | "POURVUE" | "EXPIREE";
  companyName: string;
  logoUrl: string | null;
  activityType: string;
  isDemo: boolean;
};

export type Match = {
  id: string;
  offerId: string;
  offerTitle: string;
  companyName: string;
  logoUrl: string | null;
  status: "PENDING" | "ACCEPTE" | "REFUSE";
  score: number;
  appliedAt: string;
};

export type Message = {
  id: string;
  content: string;
  sender: "student" | "company";
  createdAt: string;
};

// ─── Role ─────────────────────────────────────────────────────────────────────
export function getRole(): Role | null {
  return get<Role>(ROLE_KEY);
}
export function setRole(role: Role): void {
  set(ROLE_KEY, role);
}
export function clearRole(): void {
  remove(ROLE_KEY);
}

// ─── Student profile ──────────────────────────────────────────────────────────
export function getStudentProfile(): StudentProfile | null {
  return get<StudentProfile>(STUDENT_KEY);
}
export function setStudentProfile(p: StudentProfile): void {
  set(STUDENT_KEY, p);
}
export function clearStudentProfile(): void {
  remove(STUDENT_KEY);
}

// ─── Company profile ──────────────────────────────────────────────────────────
export function getCompanyProfile(): CompanyProfile | null {
  return get<CompanyProfile>(COMPANY_KEY);
}
export function setCompanyProfile(p: CompanyProfile): void {
  set(COMPANY_KEY, p);
}
export function clearCompanyProfile(): void {
  remove(COMPANY_KEY);
}

// ─── Offers (company creates, everyone sees) ──────────────────────────────────
export function getOffers(): Offer[] {
  return get<Offer[]>(OFFERS_KEY) || [];
}
export function saveOffer(offer: Offer): void {
  const offers = getOffers();
  const idx = offers.findIndex((o) => o.id === offer.id);
  if (idx >= 0) offers[idx] = offer;
  else offers.push(offer);
  set(OFFERS_KEY, offers);
}
export function deleteOffer(id: string): void {
  set(OFFERS_KEY, getOffers().filter((o) => o.id !== id));
}

// ─── Matches (student applies) ────────────────────────────────────────────────
export function getMatches(): Match[] {
  return get<Match[]>(MATCHES_KEY) || [];
}
export function saveMatch(match: Match): void {
  const matches = getMatches();
  const idx = matches.findIndex((m) => m.id === match.id);
  if (idx >= 0) matches[idx] = match;
  else matches.push(match);
  set(MATCHES_KEY, matches);
}
export function deleteMatch(id: string): void {
  set(MATCHES_KEY, getMatches().filter((m) => m.id !== id));
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export function getMessages(matchId: string): Message[] {
  return get<Message[]>(msgKey(matchId)) || [];
}
export function addMessage(matchId: string, msg: Message): void {
  const msgs = getMessages(matchId);
  msgs.push(msg);
  set(msgKey(matchId), msgs);
}

// ─── Reset ────────────────────────────────────────────────────────────────────
export function clearAll(): void {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith("jm:"))
    .forEach((k) => localStorage.removeItem(k));
}

// ─── Utils ────────────────────────────────────────────────────────────────────
export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
