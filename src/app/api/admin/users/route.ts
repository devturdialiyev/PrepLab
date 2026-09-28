import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      trackAccess: true,
      targetScore: true,
      createdAt: true,
      _count: {
        select: {
          submissions: true,
          uploadedMaterials: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, role, trackAccess } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(trackAccess && { trackAccess }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        trackAccess: true,
      },
    });

    // Also synchronize enrollments
    if (trackAccess === "BOTH") {
      await prisma.enrollment.upsert({
        where: { userId_track: { userId, track: "IELTS" } },
        update: { status: "ACTIVE" },
        create: { userId, track: "IELTS", status: "ACTIVE" },
      });
      await prisma.enrollment.upsert({
        where: { userId_track: { userId, track: "SAT" } },
        update: { status: "ACTIVE" },
        create: { userId, track: "SAT", status: "ACTIVE" },
      });
    } else if (trackAccess === "IELTS" || trackAccess === "SAT") {
      await prisma.enrollment.upsert({
        where: { userId_track: { userId, track: trackAccess } },
        update: { status: "ACTIVE" },
        create: { userId, track: trackAccess, status: "ACTIVE" },
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
