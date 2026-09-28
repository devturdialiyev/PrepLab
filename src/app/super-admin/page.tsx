import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
  Shield,
  Users,
  BookOpen,
  Award,
  Layers,
  FileCheck,
  TrendingUp,
  Settings,
  ArrowRight,
  UserPlus,
  BarChart3
} from "lucide-react";

export default async function SuperAdminDashboard() {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  // Fetch Ecosystem Metrics
  const [
    totalUsers,
    studentsCount,
    teachersCount,
    adminsCount,
    ieltsMaterials,
    satMaterials,
    ieltsExams,
    satExams,
    totalSubmissions,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: { in: ["TRACK_ADMIN", "SUPER_ADMIN"] } } }),
    prisma.studyMaterial.count({ where: { track: "IELTS" } }),
    prisma.studyMaterial.count({ where: { track: "SAT" } }),
    prisma.mockExam.count({ where: { track: "IELTS" } }),
    prisma.mockExam.count({ where: { track: "SAT" } }),
    prisma.examSubmission.count(),
    prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, trackAccess: true, createdAt: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} activeTrack="ADMIN" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              <span>Super Administrator Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ecosystem Control & Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Global oversight across IELTS Academic, Digital SAT, teacher rosters, and student cohorts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/users"
              className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-semibold text-xs transition-all shadow-md shadow-purple-700/20 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage All Users & Roles
            </Link>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Accounts</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalUsers}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {studentsCount} Students • {teachersCount} Teachers
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase">IELTS Curriculum</span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{ieltsExams} Mock Tests</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {ieltsMaterials} Study Guides & Audio Files
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase">SAT Curriculum</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{satExams} Mock Tests</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {satMaterials} Question Banks & Guides
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Submissions</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalSubmissions} Exams Taken</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Across both IELTS and SAT tracks
            </div>
          </div>
        </div>

        {/* Track Admin Quick Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <h3 className="font-bold text-slate-900 text-base">IELTS Admin Operations</h3>
              </div>
              <p className="text-xs text-slate-500">
                Manage IELTS curricula, examiners, essay grading queues, and band scoring analytics.
              </p>
            </div>
            <Link
              href="/admin/ielts"
              className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs border border-sky-200 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              Open IELTS Admin <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <h3 className="font-bold text-slate-900 text-base">SAT Admin Operations</h3>
              </div>
              <p className="text-xs text-slate-500">
                Manage SAT curricula, instructors, question releases, and 1600-point scale benchmarks.
              </p>
            </div>
            <Link
              href="/admin/sat"
              className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              Open SAT Admin <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* User Roster Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">User Directory Snapshot</h3>
              <p className="text-xs text-slate-500">Recent accounts and their permission tiers</p>
            </div>
            <Link
              href="/super-admin/users"
              className="text-xs font-bold text-purple-700 hover:text-purple-800"
            >
              View Full User Manager →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Track Access</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.trackAccess === "BOTH"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : u.trackAccess === "IELTS"
                            ? "bg-sky-50 text-sky-800 border-sky-200"
                            : "bg-purple-50 text-purple-800 border-purple-200"
                        }`}
                      >
                        {u.trackAccess}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
