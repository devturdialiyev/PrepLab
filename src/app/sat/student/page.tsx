import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
  Award,
  Calculator,
  BookOpen,
  ArrowRight,
  Clock,
  Download,
  FileCheck,
  TrendingUp,
  BrainCircuit,
  FileText
} from "lucide-react";

export default async function SatStudentPortal() {
  const user = await getSession();
  if (!user) {
    redirect("/auth/login");
  }

  // Check SAT track permission
  if (user.role === "STUDENT" && user.trackAccess !== "SAT" && user.trackAccess !== "BOTH") {
    redirect("/hub");
  }

  // Fetch SAT exams, materials, and student submissions
  const [exams, materials, mySubmissions] = await Promise.all([
    prisma.mockExam.findMany({
      where: { track: "SAT", isPublished: true },
      include: {
        sections: {
          select: { id: true, title: true, sectionType: true, durationMinutes: true },
        },
      },
    }),
    prisma.studyMaterial.findMany({
      where: { track: "SAT" },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.examSubmission.findMany({
      where: { studentId: user.id, exam: { track: "SAT" } },
      include: {
        exam: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} activeTrack="SAT" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/80 border border-purple-600/60 text-purple-200 text-xs font-semibold mb-3">
                <Award className="w-3.5 h-3.5" />
                <span>Digital SAT Preparation Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Digital SAT Candidate Hub
              </h1>
              <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
                Master the Reading & Writing and Math modules with adaptive timing, built-in graphing tools, and score predictions.
              </p>
            </div>

            <div className="bg-purple-900/80 border border-purple-700/60 rounded-xl p-4 text-center sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                Target Composite
              </span>
              <span className="text-2xl font-black text-white font-mono block mt-0.5">
                {user.targetScore || "1550 / 1600"}
              </span>
              <span className="text-[11px] text-purple-300">99th Percentile Benchmark</span>
            </div>
          </div>
        </div>

        {/* 2 Core Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Score Range: 200 - 800
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Reading & Writing (RW)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Two 32-minute modules covering short passages with 1 question per passage.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li>• Craft and Structure (words in context, text structure, cross-text)</li>
              <li>• Information and Ideas (central ideas, command of evidence)</li>
              <li>• Standard English Conventions (boundaries, form and structure)</li>
              <li>• Expression of Ideas (rhetorical synthesis, transitions)</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Score Range: 200 - 800
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Math (Calculator Active)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Two 35-minute modules. Multiple-choice and Student-Produced Responses.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li>• Algebra (linear equations, systems, inequalities)</li>
              <li>• Advanced Math (nonlinear equations, quadratics, functions)</li>
              <li>• Problem-Solving & Data Analysis (percentages, ratios, scatterplots)</li>
              <li>• Geometry & Trigonometry (area, volume, right triangles, unit circle)</li>
            </ul>
          </div>
        </div>

        {/* Practice Tests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Digital SAT Practice Tests</h2>
              <p className="text-xs text-slate-500">Official format with on-screen calculator and formula reference</p>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {exams.length} Practice Tests
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {exam.examType}
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.durationMinutes} mins
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{exam.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {exam.description || "Digital SAT practice test with auto-scoring."}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{exam.sections.length} Tested Modules</span>
                    <span>•</span>
                    <span>Score Scale: 400 - 1600</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60">
                  <Link
                    href={`/sat/student/exam/${exam.id}`}
                    className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Launch Digital SAT Simulator
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column: Question Banks & SAT Score History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">SAT Question Banks & Formulas</h3>
            <p className="text-xs text-slate-500 mb-4">Official PDF guides and formula sheets for high-scorers</p>

            <div className="space-y-3">
              {materials.map((mat) => (
                <div key={mat.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{mat.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {mat.module} • {mat.fileType} • {mat.fileSize || "1.8 MB"}
                    </p>
                  </div>
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white border border-slate-200 text-purple-600 hover:text-purple-700 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">My SAT Score History</h3>
            <p className="text-xs text-slate-500 mb-4">Composite scores evaluated on the 400-1600 scale</p>

            {mySubmissions.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-600">No SAT practice tests completed yet</p>
                <p className="text-[11px] text-slate-400">Launch a test above to record your 1600 benchmark score!</p>
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
                    </div>
                    <span className="text-sm font-extrabold text-purple-900 font-mono">
                      {sub.scaledScore} / 1600
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
