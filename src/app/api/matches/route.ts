import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (session.user.role === "STUDENT") {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) return NextResponse.json({ matches: [] });

    const matches = await prisma.match.findMany({
      where: { studentProfileId: student.id, status: "ACCEPTE" },
      include: { offer: { include: { company: true } } },
    });
    return NextResponse.json({ matches });
  }

  if (session.user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!company) return NextResponse.json({ matches: [] });

    const matches = await prisma.match.findMany({
      where: {
        offer: { companyProfileId: company.id },
        status: { in: ["EN_ATTENTE", "ACCEPTE"] },
      },
      include: {
        student: true,
        offer: true,
      },
    });
    return NextResponse.json({ matches });
  }

  return NextResponse.json({ matches: [] });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { matchId, status } = body;

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { status },
    include: {
      offer: { include: { company: true } },
      student: true,
    },
  });

  if (status === "ACCEPTE") {
    const offerSchedules = JSON.parse(match.offer.schedules || "{}");
    const days = Object.keys(offerSchedules);
    const startDate = new Date(match.offer.startDate);
    const endDate = new Date(match.offer.endDate);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayName = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"][d.getDay()];
      if (days.includes(dayName)) {
        const sched = offerSchedules[dayName];
        await prisma.calendarEvent.create({
          data: {
            matchId: match.id,
            date: d.toISOString().split("T")[0],
            startTime: sched?.start || "09:00",
            endTime: sched?.end || "17:00",
            note: match.offer.title,
          },
        });
      }
    }
  }

  return NextResponse.json(match);
}
