"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, BookOpen, Award, Shield, User, RefreshCw, LayoutDashboard } from "lucide-react";
import { SessionUser } from "@/lib/types";

interface NavbarProps {
  user: SessionUser;
  activeTrack?: "IELTS" | "SAT" | "HUB" | "ADMIN" | "TEACHER";
}

export default function Navbar({ user, activeTrack = "HUB" }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  const isDual = user.trackAccess === "BOTH" || user.role === "SUPER_ADMIN";

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Active Context */}
        <div className="flex items-center gap-6">
          <Link href={user.role === "SUPER_ADMIN" ? "/super-admin" : "/hub"} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
              A
            </div>
            <div>
              <span className="font-bold text-slate-900 leading-tight block text-base">ApexPrep</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block -mt-0.5">
                {activeTrack === "IELTS" && "IELTS Academic Portal"}
                {activeTrack === "SAT" && "Digital SAT Portal"}
                {activeTrack === "ADMIN" && "Super Admin Central"}
                {activeTrack === "TEACHER" && "Teacher Workstation"}
                {activeTrack === "HUB" && "Unified Central Hub"}
              </span>
            </div>
          </Link>

          {/* Track Switcher for Dual Users */}
          {isDual && (
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <Link
                href="/ielts/student"
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTrack === "IELTS"
                    ? "bg-white text-sky-700 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                IELTS
              </Link>
              <Link
                href="/sat/student"
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTrack === "SAT"
                    ? "bg-white text-purple-700 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-purple-600" />
                SAT
              </Link>
              <Link
                href="/hub"
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeTrack === "HUB"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                Hub
              </Link>
            </div>
          )}
        </div>

        {/* Right: Quick Links, User Badge & Logout */}
        <div className="flex items-center gap-3">
          {/* Super Admin Quick Link */}
          {user.role === "SUPER_ADMIN" && activeTrack !== "ADMIN" && (
            <Link
              href="/super-admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              Super Admin
            </Link>
          )}

          {/* Teacher Quick Link */}
          {(user.role === "TEACHER" || user.role === "SUPER_ADMIN") && activeTrack !== "TEACHER" && (
            <Link
              href="/teacher"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
              Teacher Desk
            </Link>
          )}

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-500 block leading-tight capitalize">
                {user.role.toLowerCase().replace("_", " ")} ({user.trackAccess})
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
