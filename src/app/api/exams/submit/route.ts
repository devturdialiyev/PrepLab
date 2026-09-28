import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { examId, answers, timeSpentSeconds } = await request.json();

    if (!examId || !answers) {
      return NextResponse.json(
        { error: "Exam ID and answers are required" },
        { status: 400 }
      );
    }

    const exam = await prisma.mockExam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Evaluate answers
    let rawScore = 0;
    let autoGradableCount = 0;
    let hasEssayOrSpeaking = false;

    const answerCreates = [];

    for (const section of exam.sections) {
      for (const question of section.questions) {
        const studentAns = answers[question.id] || "";
        let isCorrect: boolean | null = null;
        let pointsEarned = 0;

        if (question.type === "ESSAY" || question.type === "AUDIO_RECORDING") {
          hasEssayOrSpeaking = true;
        } else if (question.correctAnswer) {
          autoGradableCount++;
          if (studentAns.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
            isCorrect = true;
            pointsEarned = question.points;
            rawScore += pointsEarned;
          } else {
            isCorrect = false;
          }
        }

        answerCreates.push({
          questionId: question.id,
          studentAnswer: studentAns,
          isCorrect,
          pointsEarned,
        });
      }
    }

    // Calculate scaled score based on track
    let scaledScore = "";
    let status = "SUBMITTED";

    if (exam.track === "SAT") {
      // SAT 400-1600 calculation
      const percentage = autoGradableCount > 0 ? rawScore / autoGradableCount : 0.8;
      const computedSat = Math.round(400 + percentage * 1200);
      scaledScore = `${computedSat}`;
      status = "GRADED";
    } else {
      // IELTS 0 - 9.0 calculation
      if (hasEssayOrSpeaking) {
        status = "SUBMITTED"; // Needs teacher review
        scaledScore = "Pending Review";
      } else {
        const percentage = autoGradableCount > 0 ? rawScore / autoGradableCount : 0.8;
        const computedBand = (Math.round((4.0 + percentage * 5.0) * 2) / 2).toFixed(1);
        scaledScore = `Band ${computedBand}`;
        status = "GRADED";
      }
    }

    const submission = await prisma.examSubmission.create({
      data: {
        examId,
        studentId: session.id,
        status,
        rawScore,
        scaledScore,
        timeSpentSeconds: timeSpentSeconds || 0,
        answers: {
          create: answerCreates,
        },
      },
      include: {
        exam: true,
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      status,
      scaledScore,
      rawScore,
    });
  } catch (error) {
    console.error("Exam submission error:", error);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
