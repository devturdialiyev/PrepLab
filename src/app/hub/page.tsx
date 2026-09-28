import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Sparkles,
  Layers,
  Shield,
  GraduationCap
} from "lucide-react";

export default async function CentralHubPage() {
  const user = await getSession();
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch summary counts for IELTS & SAT
  const [ieltsExams, satExams, ieltsMaterials, satMaterials, recentSubmissions] = await Promise.all([
    prisma.mockExam.findMany({
      where: { track: "IELTS", isPublished: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.mockExam.findMany({
      where: { track: "SAT", isPublished: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.studyMaterial.count({ where: { track: "IELTS" } }),
    prisma.studyMaterial.count({ where: { track: "SAT" } }),
    prisma.examSubmission.findMany({
      where: { studentId: user.id },
      include: { exam: true },
      take: 5,
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const hasIelts = user.trackAccess === "IELTS" || user.trackAccess === "BOTH" || user.role === "SUPER_ADMIN";
  const hasSat = user.trackAccess === "SAT" || user.trackAccess === "BOTH" || user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} activeTrack="HUB" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Unified Learning Switchboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user.name}
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                {user.trackAccess === "BOTH"
                  ? "You have full dual-track enrollment. Switch between IELTS Academic and Digital SAT prep effortlessly below."
                  : `Your account is configured for ${user.trackAccess} preparation. You can access all modules and mock tests.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user.role === "SUPER_ADMIN" && (
                <Link
                  href="/super-admin"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Shield className="w-4 h-4" />
                  Super Admin Panel
                </Link>
              )}
              {user.role === "TEACHER" && (
                <Link
                  href="/teacher"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <GraduationCap className="w-4 h-4" />
                  Teacher Workstation
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Dual Track Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* IELTS Card */}
          <div
            className={`rounded-2xl border-2 transition-all p-6 sm:p-7 flex flex-col justify-between ${
              hasIelts
                ? "bg-white border-sky-200 shadow-md hover:border-sky-400"
                : "bg-slate-100/80 border-slate-200 opacity-60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-sky-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    hasIelts
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "bg-slate-200 text-slate-600 border-slate-300"
                  }`}
                >
                  {hasIelts ? "Enrolled & Active" : "Locked / Upgrade"}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">IELTS Academic Preparation</h2>
              <p className="text-xs text-slate-500 mt-1">
                4-skill testing system: Listening, Reading, Writing, Speaking. Target: 0.0 - 9.0 Band.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100">
                  <span className="text-[11px] font-semibold text-sky-800 uppercase block">Mock Tests</span>
                  <span className="text-xl font-extrabold text-sky-950 mt-0.5 block">{ieltsExams.length} Available</span>
                </div>
                <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100">
                  <span className="text-[11px] font-semibold text-sky-800 uppercase block">Study Guides</span>
                  <span className="text-xl font-extrabold text-sky-950 mt-0.5 block">{ieltsMaterials} Uploads</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Featured Mock Exams:</span>
                {ieltsExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-medium text-slate-800 truncate">{exam.title}</span>
                    <span className="text-[11px] text-slate-500 ml-2 whitespace-nowrap">{exam.durationMinutes} mins</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              {hasIelts ? (
                <Link
                  href="/ielts/student"
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-600/20"
                >
                  Enter IELTS Student Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-500 font-semibold text-sm cursor-not-allowed"
                >
                  Enroll in IELTS Track to Access
                </button>
              )}
            </div>
          </div>

          {/* SAT Card */}
          <div
            className={`rounded-2xl border-2 transition-all p-6 sm:p-7 flex flex-col justify-between ${
              hasSat
                ? "bg-white border-purple-200 shadow-md hover:border-purple-400"
                : "bg-slate-100/80 border-slate-200 opacity-60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-purple-600/20">
                  <Award className="w-6 h-6" />
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    hasSat
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-slate-200 text-slate-600 border-slate-300"
                  }`}
                >
                  {hasSat ? "Enrolled & Active" : "Locked / Upgrade"}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">Digital SAT Preparation</h2>
              <p className="text-xs text-slate-500 mt-1">
                Reading & Writing + Math timed simulation with on-screen calculator. Target: 400 - 1600.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100">
                  <span className="text-[11px] font-semibold text-purple-800 uppercase block">Mock Tests</span>
                  <span className="text-xl font-extrabold text-purple-950 mt-0.5 block">{satExams.length} Available</span>
                </div>
                <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100">
                  <span className="text-[11px] font-semibold text-purple-800 uppercase block">Question Bank</span>
                  <span className="text-xl font-extrabold text-purple-950 mt-0.5 block">{satMaterials} Guides</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Featured Mock Exams:</span>
                {satExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-medium text-slate-800 truncate">{exam.title}</span>
                    <span className="text-[11px] text-slate-500 ml-2 whitespace-nowrap">{exam.durationMinutes} mins</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              {hasSat ? (
                <Link
                  href="/sat/student"
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
                >
                  Enter Digital SAT Student Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-500 font-semibold text-sm cursor-not-allowed"
                >
                  Enroll in SAT Track to Access
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Performance & Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Your Exam Submissions & Scores
              </h3>
              <p className="text-xs text-slate-500">Track your band scores and composite SAT results</p>
            </div>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No mock tests submitted yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Launch a mock exam in either IELTS or SAT above to start benchmarking your score!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs block">{sub.exam.title}</span>
                    <span className="text-[11px] text-slate-400">
                      Submitted on {new Date(sub.submittedAt).toLocaleDateString()} • {sub.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {sub.scaledScore || "Pending Review"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
