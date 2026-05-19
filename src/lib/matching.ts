import type { StudentProfile, Offer } from "./storage";

function scoreSkills(studentSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 100;
  const matched = studentSkills.filter((s) =>
    requiredSkills.some((r) => r.toLowerCase() === s.toLowerCase())
  );
  return (matched.length / requiredSkills.length) * 100;
}

function scoreAvailabilities(
  studentAvail: Record<string, Record<string, boolean>>,
  schedules: Record<string, { start: string; end: string } | null>
): number {
  const days = Object.keys(schedules ?? {});
  if (days.length === 0) return 100;
  let matched = 0;
  for (const day of days) {
    if (schedules[day] && studentAvail[day]) {
      const hour = parseInt(schedules[day]!.start.split(":")[0]);
      if (hour < 12 && studentAvail[day].matin) matched++;
      else if (hour < 18 && studentAvail[day].aprem) matched++;
      else if (studentAvail[day].soir) matched++;
    }
  }
  return (matched / days.length) * 100;
}

function scoreDistance(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 50;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  if (distKm <= 2) return 100;
  if (distKm <= 5) return 80;
  if (distKm <= 10) return 60;
  if (distKm <= 20) return 40;
  if (distKm <= 50) return 20;
  return 0;
}

function scoreJobType(studentJobTypes: string[], offerJobType: string): number {
  if (!offerJobType) return 100;
  return studentJobTypes.some(
    (t) => t.toLowerCase() === offerJobType.toLowerCase()
  )
    ? 100
    : 0;
}

export function computeMatchScore(
  student: StudentProfile,
  offer: Offer
): number {
  const s1 = scoreSkills(student.skills, offer.requiredSkills);
  const s2 = scoreAvailabilities(student.availabilities, offer.schedules);
  const s3 = scoreDistance(
    student.latitude,
    student.longitude,
    offer.latitude,
    offer.longitude
  );
  const s4 = scoreJobType(student.jobTypes, offer.jobType);

  return Math.round(s1 * 0.4 + s2 * 0.3 + s3 * 0.2 + s4 * 0.1);
}
