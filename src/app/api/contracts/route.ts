import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (session.user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!company) return NextResponse.json({ contracts: [] });

    const contracts = await prisma.contract.findMany({
      where: { match: { offer: { companyProfileId: company.id } } },
      include: { match: { include: { student: true, offer: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ contracts });
  }

  if (session.user.role === "STUDENT") {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) return NextResponse.json({ contracts: [] });

    const contracts = await prisma.contract.findMany({
      where: { match: { studentProfileId: student.id } },
      include: { match: { include: { offer: { include: { company: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ contracts });
  }

  return NextResponse.json({ contracts: [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { matchId, content } = body;

  const contract = await prisma.contract.create({
    data: {
      matchId,
      content,
      status: "ENVOYE",
    },
  });

  return NextResponse.json(contract, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { contractId, status } = await req.json();

  const contract = await prisma.contract.update({
    where: { id: contractId },
    data: { status },
  });

  return NextResponse.json(contract);
}
