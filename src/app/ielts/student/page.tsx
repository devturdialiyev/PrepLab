import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
  BookOpen,
  Headphones,
  FileEdit,
  Mic,
  ArrowRight,
  Clock,
  Award,
  Download,
  CheckCircle2,
  TrendingUp,
  FileText
} from "lucide-react";

export default async function IeltsStudentPortal() {
  const user = await getSession();
  if (!user) {
    redirect("/auth/login");
  }

  // Check IELTS track permission
  if (user.role === "STUDENT" && user.trackAccess !== "IELTS" && user.trackAccess !== "BOTH") {
    redirect("/hub");
  }

  // Fetch IELTS exams, materials, and student's recent submissions
  const [exams, materials, mySubmissions] = await Promise.all([
    prisma.mockExam.findMany({
      where: { track: "IELTS", isPublished: true },
      include: {
        sections: {
          select: { id: true, title: true, sectionType: true, durationMinutes: true },
        },
      },
    }),
    prisma.studyMaterial.findMany({
      where: { track: "IELTS" },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.examSubmission.findMany({
      where: { studentId: user.id, exam: { track: "IELTS" } },
      include: {
        exam: true,
        evaluation: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} activeTrack="IELTS" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Banner */}
        <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-800/80 border border-sky-600/60 text-sky-200 text-xs font-semibold mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>IELTS Academic Preparation Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Academic IELTS Candidate Hub
              </h1>
              <p className="text-sky-200 text-xs sm:text-sm mt-1 max-w-xl">
                Prepare across all 4 key disciplines. Take timed mock exams and receive rubric feedback from certified examiners.
              </p>
            </div>

            <div className="bg-sky-900/80 border border-sky-700/60 rounded-xl p-4 text-center sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                Target Score
              </span>
              <span className="text-2xl font-black text-white font-mono block mt-0.5">
                {user.targetScore || "Band 8.0"}
              </span>
              <span className="text-[11px] text-sky-300">C1 Academic Proficiency</span>
            </div>
          </div>
        </div>

        {/* 4 Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1. Listening</h3>
            <p className="text-xs text-slate-500 mt-1">
              4 sections, 40 items. British, Australian & North American accent training.
            </p>
            <span className="inline-block mt-3 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              30 Mins + 10 Mins Transfer
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">2. Academic Reading</h3>
            <p className="text-xs text-slate-500 mt-1">
              3 long academic passages. Skimming, scanning, and True/False/Not Given mastery.
            </p>
            <span className="inline-block mt-3 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              60 Mins • 40 Questions
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold mb-3">
              <FileEdit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3. Academic Writing</h3>
            <p className="text-xs text-slate-500 mt-1">
              Task 1 visual summary (150 words) + Task 2 discursive essay (250 words).
            </p>
            <span className="inline-block mt-3 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              60 Mins • Examiner Rubrics
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold mb-3">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">4. Speaking Interview</h3>
            <p className="text-xs text-slate-500 mt-1">
              Part 1 introduction, Part 2 cue-card monologue, Part 3 abstract discussion.
            </p>
            <span className="inline-block mt-3 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              11 - 14 Mins • Fluency & Coherence
            </span>
          </div>
        </div>

        {/* Mock Exams List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Available IELTS Mock Exams</h2>
              <p className="text-xs text-slate-500">Official simulated test environments with timed conditions</p>
            </div>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              {exams.length} Practice Tests
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {exam.examType}
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.durationMinutes} mins
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{exam.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {exam.description || "Full 4-skill official mock simulation."}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{exam.sections.length} Tested Modules</span>
                    <span>•</span>
                    <span>Official Band Rubrics</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60">
                  <Link
                    href={`/ielts/student/exam/${exam.id}`}
                    className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Start IELTS Mock Exam
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column: Study Materials & Student Submission History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Study Guides */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Study Guides & Listening Audios</h3>
            <p className="text-xs text-slate-500 mb-4">Official downloadable resources published by IELTS examiners</p>

            <div className="space-y-3">
              {materials.map((mat) => (
                <div key={mat.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{mat.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {mat.module} • {mat.fileType} • {mat.fileSize || "2.1 MB"}
                    </p>
                  </div>
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white border border-slate-200 text-sky-600 hover:text-sky-700 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Submission History */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">My IELTS Score History</h3>
            <p className="text-xs text-slate-500 mb-4">Recent band scores and examiner review notes</p>

            {mySubmissions.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-600">No IELTS tests taken yet</p>
                <p className="text-[11px] text-slate-400">Your completed mock tests will be recorded here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {mySubmissions.map((sub) => (
                  <div key={sub.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs">{sub.exam.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(sub.submittedAt).toLocaleDateString()} • {sub.status}
                      </p>
                      {sub.evaluation && (
                        <p className="text-[11px] text-emerald-700 mt-1 italic">
                          "{sub.evaluation.generalFeedback}"
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-extrabold text-sky-900 font-mono">
                      {sub.scaledScore || "Pending Review"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
