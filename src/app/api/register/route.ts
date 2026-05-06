import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, role, ...profileData } = body;

    if (!username || !role) {
      return NextResponse.json({ error: "Pseudo et rôle requis" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json({ error: "Ce pseudo est déjà pris" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        username,
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
                  skills: JSON.stringify(profileData.skills || []),
                  jobTypes: JSON.stringify(profileData.jobTypes || []),
                  availabilities: JSON.stringify(profileData.availabilities || {}),
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

    return NextResponse.json({ id: user.id, username: user.username, role: user.role }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
