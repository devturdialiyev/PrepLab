import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
  GraduationCap,
  UploadCloud,
  FileCheck,
  BookOpen,
  Award,
  Layers,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText
} from "lucide-react";

export default async function TeacherDashboard() {
  const user = await getSession();
  if (!user || (user.role !== "TEACHER" && user.role !== "SUPER_ADMIN")) {
    redirect("/auth/login");
  }

  const trackFilter = user.role === "SUPER_ADMIN" || user.trackAccess === "BOTH" ? {} : { track: user.trackAccess };

  const [myMaterialsCount, pendingSubmissions, recentMaterials] = await Promise.all([
    prisma.studyMaterial.count({ where: { uploadedById: user.id } }),
    prisma.examSubmission.findMany({
      where: {
        status: "SUBMITTED",
        ...(user.role === "TEACHER" && user.trackAccess !== "BOTH" ? { exam: { track: user.trackAccess } } : {}),
      },
      include: {
        student: { select: { name: true, email: true } },
        exam: { select: { title: true, track: true } },
      },
      take: 5,
      orderBy: { submittedAt: "desc" },
    }),
    prisma.studyMaterial.findMany({
      where: trackFilter,
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} activeTrack="TEACHER" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/60 text-emerald-200 text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty Instruction & Evaluation Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Teacher Workstation
          </h1>
          <p className="text-emerald-200 text-xs sm:text-sm mt-1 max-w-xl">
            Upload course materials, listening audios, reading worksheets, and grade student mock exam submissions.
          </p>
        </div>

        {/* Quick Actions & KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Tracks</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {user.trackAccess}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {user.trackAccess === "BOTH" ? "IELTS & SAT Faculty" : `${user.trackAccess} Specialist`}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Authorized to publish content & evaluate submissions for your track.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">My Uploads</span>
                <UploadCloud className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {myMaterialsCount} Files
              </div>
              <p className="text-xs text-slate-500 mt-1">
                PDF guides, audio tracks, and question worksheets.
              </p>
            </div>
            <Link
              href="/teacher/materials"
              className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              Manage Study Materials <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Grading Backlog</span>
                <FileCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {pendingSubmissions.length} Submissions
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Awaiting teacher essay rubric or speaking audio evaluation.
              </p>
            </div>
            <Link
              href="/teacher/grading"
              className="mt-4 text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
            >
              Open Grading Desk <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2-Column: Pending Submissions & Recent Study Materials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Pending Submissions */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Awaiting Teacher Grading</h3>
                <p className="text-xs text-slate-500">Student essays and exams requiring rubric review</p>
              </div>
              <Link
                href="/teacher/grading"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Go to Grading Desk →
              </Link>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">All submissions are up to date!</p>
                <p className="text-[11px] text-slate-400">New mock test submissions will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{sub.exam.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Candidate: {sub.student.name} • {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      href="/teacher/grading"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition-colors"
                    >
                      Grade Now
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Study Materials */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Recent Study Materials</h3>
              <Link
                href="/teacher/materials"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Upload File +
              </Link>
            </div>

            <div className="space-y-3">
              {recentMaterials.map((mat) => (
                <div key={mat.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <div className="font-semibold text-slate-900 text-xs truncate">{mat.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {mat.track} • {mat.module} • {mat.fileType}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {mat.fileSize || "1.2 MB"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
