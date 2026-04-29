import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";
import { computeMatchScore } from "@/lib/matching";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const forStudent = searchParams.get("forStudent") === "true";

  if (forStudent && session.user.role === "STUDENT") {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!studentProfile) return NextResponse.json({ offers: [] });

    const offers = await prisma.offer.findMany({
      where: { status: "ACTIVE" },
      include: { company: true },
    });

    const scored = offers.map((offer) => ({
      ...offer,
      score: computeMatchScore(studentProfile, offer),
    }));

    scored.sort((a, b) => b.score - a.score);
    return NextResponse.json({ offers: scored });
  }

  if (session.user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        offers: {
          include: {
            _count: { select: { matches: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json({ offers: company?.offers || [] });
  }

  return NextResponse.json({ offers: [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) return NextResponse.json({ error: "Profil entreprise non trouvé" }, { status: 404 });

  const body = await req.json();

  const offer = await prisma.offer.create({
    data: {
      companyProfileId: company.id,
      title: body.title,
      description: body.description,
      requiredSkills: JSON.stringify(body.requiredSkills || []),
      jobType: body.jobType || null,
      startDate: body.startDate,
      endDate: body.endDate,
      schedules: JSON.stringify(body.schedules || {}),
      hourlyRate: parseFloat(body.hourlyRate),
      location: body.location,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      nbPositions: parseInt(body.nbPositions) || 1,
    },
  });

  // Auto-match with all students
  const students = await prisma.studentProfile.findMany();
  for (const student of students) {
    const score = computeMatchScore(student, offer);
    if (score > 20) {
      await prisma.match.create({
        data: {
          studentProfileId: student.id,
          offerId: offer.id,
          score,
        },
      });
    }
  }

  return NextResponse.json(offer, { status: 201 });
}
