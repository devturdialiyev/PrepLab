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

  const whereClause: { exam?: { track: string }; status?: string } = {};
  if (track && (track === "IELTS" || track === "SAT")) {
    whereClause.exam = { track };
  } else if (session.role === "TEACHER" && session.trackAccess !== "BOTH") {
    whereClause.exam = { track: session.trackAccess };
  }

  const submissions = await prisma.examSubmission.findMany({
    where: whereClause,
    include: {
      student: { select: { id: true, name: true, email: true } },
      exam: { select: { id: true, title: true, track: true } },
      answers: {
        include: {
          question: true,
        },
      },
      evaluation: {
        include: {
          teacher: { select: { name: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { submissionId, bandScore, generalFeedback, criteriaScores } = await request.json();

    if (!submissionId || !bandScore) {
      return NextResponse.json(
        { error: "Submission ID and score are required" },
        { status: 400 }
      );
    }

    // Upsert evaluation
    const evaluation = await prisma.submissionEvaluation.upsert({
      where: { submissionId },
      update: {
        teacherId: session.id,
        bandScore: String(bandScore),
        generalFeedback,
        criteriaScoresJson: criteriaScores ? JSON.stringify(criteriaScores) : null,
        gradedAt: new Date(),
      },
      create: {
        submissionId,
        teacherId: session.id,
        bandScore: String(bandScore),
        generalFeedback,
        criteriaScoresJson: criteriaScores ? JSON.stringify(criteriaScores) : null,
      },
    });

    // Update submission status and scaled score
    await prisma.examSubmission.update({
      where: { id: submissionId },
      data: {
        status: "GRADED",
        scaledScore: `Band ${bandScore}`,
      },
    });

    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json({ error: "Failed to submit evaluation" }, { status: 500 });
  }
}
