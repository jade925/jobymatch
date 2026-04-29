import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (session.user.role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ profile });
  }

  if (session.user.role === "COMPANY") {
    const profile = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ profile });
  }

  return NextResponse.json({ profile: null });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();

  if (session.user.role === "STUDENT") {
    const profile = await prisma.studentProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.dateOfBirth !== undefined && { dateOfBirth: body.dateOfBirth }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.diploma !== undefined && { diploma: body.diploma }),
        ...(body.school !== undefined && { school: body.school }),
        ...(body.skills !== undefined && { skills: JSON.stringify(body.skills) }),
        ...(body.jobTypes !== undefined && { jobTypes: JSON.stringify(body.jobTypes) }),
        ...(body.availabilities !== undefined && { availabilities: JSON.stringify(body.availabilities) }),
        ...(body.iban !== undefined && { iban: body.iban }),
        ...(body.bic !== undefined && { bic: body.bic }),
        ...(body.photoUrl !== undefined && { photoUrl: body.photoUrl }),
        ...(body.cvUrl !== undefined && { cvUrl: body.cvUrl }),
        ...(body.coverLetterUrl !== undefined && { coverLetterUrl: body.coverLetterUrl }),
      },
    });
    return NextResponse.json({ profile });
  }

  if (session.user.role === "COMPANY") {
    const profile = await prisma.companyProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.siret !== undefined && { siret: body.siret }),
        ...(body.activityType !== undefined && { activityType: body.activityType }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.iban !== undefined && { iban: body.iban }),
        ...(body.bic !== undefined && { bic: body.bic }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      },
    });
    return NextResponse.json({ profile });
  }

  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ success: true });
}
