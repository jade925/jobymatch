import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) return NextResponse.json({ error: "matchId requis" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { matchId, content, fileUrl } = body;

  if (!matchId || (!content && !fileUrl)) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      matchId,
      senderId: session.user.id,
      content: content || null,
      fileUrl: fileUrl || null,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
