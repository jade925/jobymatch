import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!offer) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(offer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const offer = await prisma.offer.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
      ...(body.requiredSkills && { requiredSkills: JSON.stringify(body.requiredSkills) }),
      ...(body.jobType !== undefined && { jobType: body.jobType }),
      ...(body.startDate && { startDate: body.startDate }),
      ...(body.endDate && { endDate: body.endDate }),
      ...(body.schedules && { schedules: JSON.stringify(body.schedules) }),
      ...(body.hourlyRate && { hourlyRate: parseFloat(body.hourlyRate) }),
      ...(body.location && { location: body.location }),
      ...(body.latitude !== undefined && { latitude: body.latitude }),
      ...(body.longitude !== undefined && { longitude: body.longitude }),
      ...(body.nbPositions && { nbPositions: parseInt(body.nbPositions) }),
      ...(body.status && { status: body.status }),
    },
  });

  return NextResponse.json(offer);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.offer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
