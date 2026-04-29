import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, ...profileData } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        role,
        ...(role === "STUDENT"
          ? {
              studentProfile: {
                create: {
                  firstName: profileData.firstName || "",
                  lastName: profileData.lastName || "",
                  phone: profileData.phone || null,
                  address: profileData.address || null,
                  latitude: profileData.latitude || null,
                  longitude: profileData.longitude || null,
                  diploma: profileData.diploma || null,
                  school: profileData.school || null,
                  skills: profileData.skills || "[]",
                  jobTypes: profileData.jobTypes || "[]",
                  availabilities: profileData.availabilities || "{}",
                },
              },
            }
          : {
              companyProfile: {
                create: {
                  companyName: profileData.companyName || "",
                  siret: profileData.siret || null,
                  activityType: profileData.activityType || "AUTRE",
                  address: profileData.address || null,
                  latitude: profileData.latitude || null,
                  longitude: profileData.longitude || null,
                  phone: profileData.phone || null,
                  website: profileData.website || null,
                },
              },
            }),
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
