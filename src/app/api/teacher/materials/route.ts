import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const track = searchParams.get("track");

  const whereClause: { track?: string } = {};
  if (track && (track === "IELTS" || track === "SAT")) {
    whereClause.track = track;
  } else if (session.role === "TEACHER" && session.trackAccess !== "BOTH") {
    whereClause.track = session.trackAccess;
  }

  const materials = await prisma.studyMaterial.findMany({
    where: whereClause,
    include: {
      uploadedBy: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ materials });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { title, description, track, module, fileUrl, fileType, fileSize } = await request.json();

    if (!title || !track || !module || !fileUrl || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields (title, track, module, fileUrl, fileType)" },
        { status: 400 }
      );
    }

    // Verify track permissions
    if (session.role === "TEACHER" && session.trackAccess !== "BOTH" && session.trackAccess !== track) {
      return NextResponse.json(
        { error: `You do not have permission to upload materials to the ${track} track.` },
        { status: 403 }
      );
    }

    const material = await prisma.studyMaterial.create({
      data: {
        title,
        description,
        track,
        module,
        fileUrl,
        fileType,
        fileSize: fileSize || "1.5 MB",
        uploadedById: session.id,
      },
      include: {
        uploadedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, material });
  } catch (error) {
    console.error("Create material error:", error);
    return NextResponse.json({ error: "Failed to upload study material" }, { status: 500 });
  }
}
