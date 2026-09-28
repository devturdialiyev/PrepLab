import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Award, Users, FileCheck, Layers, ArrowRight, BookOpen, Calculator } from "lucide-react";

export default async function SatAdminPage() {
  const user = await getSession();
  if (!user || (user.role !== "TRACK_ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/auth/login");
  }

  // Ensure SAT track access
  if (user.role === "TRACK_ADMIN" && user.trackAccess !== "SAT" && user.trackAccess !== "BOTH") {
    redirect("/admin/ielts");
  }

  // Fetch SAT stats
  const [satStudents, satTeachers, exams, materials, totalSubmissions] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", trackAccess: { in: ["SAT", "BOTH"] } } }),
    prisma.user.findMany({
      where: { role: "TEACHER", trackAccess: { in: ["SAT", "BOTH"] } },
      select: { id: true, name: true, email: true },
    }),
    prisma.mockExam.findMany({
      where: { track: "SAT" },
      include: {
        _count: { select: { sections: true, submissions: true } },
      },
    }),
    prisma.studyMaterial.findMany({
      where: { track: "SAT" },
      include: { uploadedBy: true },
      take: 5,
    }),
    prisma.examSubmission.count({
      where: { exam: { track: "SAT" } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} activeTrack="SAT" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/60 border border-purple-600/60 text-purple-200 text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Digital SAT Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Digital SAT Operations
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
            Supervise Math & RW question banks, configure adaptive testing parameters, and track 1600-point benchmarks.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Enrolled Candidates</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{satStudents}</div>
            <span className="text-[11px] text-purple-600 font-medium">SAT & Dual Students</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase block">SAT Faculty Instructors</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{satTeachers.length}</div>
            <span className="text-[11px] text-slate-500">Math & RW Masters</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Published Practice Tests</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{exams.length}</div>
            <span className="text-[11px] text-slate-500">Full Digital SAT Simulations</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Total SAT Attempts</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{totalSubmissions}</div>
            <span className="text-[11px] text-slate-500">Calculated on 400-1600 Scale</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mock Exams List */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Digital SAT Practice Tests</h3>
              <span className="text-xs font-medium text-slate-500">{exams.length} Active Tests</span>
            </div>

            <div className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <div key={exam.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{exam.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {exam.durationMinutes} mins • {exam._count.sections} Modules • {exam._count.submissions} Submissions
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Live
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SAT Faculty Roster */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">SAT Faculty Roster</h3>
            <div className="space-y-3">
              {satTeachers.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{t.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{t.email}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
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
