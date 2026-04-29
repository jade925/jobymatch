import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";
import { computeMatchScore } from "@/lib/matching";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { offerId } = await req.json();

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!student) return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 });

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });

  const score = computeMatchScore(student, offer);

  const match = await prisma.match.upsert({
    where: { studentProfileId_offerId: { studentProfileId: student.id, offerId } },
    update: { status: "EN_ATTENTE" },
    create: {
      studentProfileId: student.id,
      offerId,
      score,
      status: "EN_ATTENTE",
    },
  });

  return NextResponse.json(match, { status: 201 });
}
