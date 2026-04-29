import { auth } from "@/auth";
import { NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (session.user.role === "STUDENT") {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) return NextResponse.json({ events: [] });

    const events = await prisma.calendarEvent.findMany({
      where: { match: { studentProfileId: student.id, status: "ACCEPTE" } },
      include: { match: { include: { offer: { include: { company: true } } } } },
    });
    return NextResponse.json({ events });
  }

  if (session.user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!company) return NextResponse.json({ events: [] });

    const events = await prisma.calendarEvent.findMany({
      where: { match: { offer: { companyProfileId: company.id }, status: "ACCEPTE" } },
      include: { match: { include: { student: true, offer: true } } },
    });
    return NextResponse.json({ events });
  }

  return NextResponse.json({ events: [] });
}
