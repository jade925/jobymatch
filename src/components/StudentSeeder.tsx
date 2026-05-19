"use client";
import { useEffect } from "react";
import { DEMO_STUDENT_PROFILE, DEMO_STUDENT_MATCHES } from "@/lib/demo-data";
import { getStudentProfile, setStudentProfile, getMatches, saveMatch } from "@/lib/storage";

const SEEDED_KEY = "jm:student-demo-seeded-v2";

export function StudentSeeder() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SEEDED_KEY)) return;
    if (!getStudentProfile()) setStudentProfile(DEMO_STUDENT_PROFILE);
    const existing = getMatches();
    DEMO_STUDENT_MATCHES.forEach((m) => {
      if (!existing.some((e) => e.id === m.id)) saveMatch(m);
    });
    localStorage.setItem(SEEDED_KEY, "1");
  }, []);
  return null;
}
