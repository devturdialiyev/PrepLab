"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, BookOpen, GraduationCap, Award, ArrowRight, UserCheck, Lock, Mail } from "lucide-react";

const DEMO_PERSONAS = [
  {
    tier: "Super Admin",
    role: "Full Platform Control",
    name: "Dr. Alexander Cross",
    email: "superadmin@edu.com",
    badge: "Master Access",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    borderHover: "hover:border-purple-400",
  },
  {
    tier: "Track Admin",
    role: "IELTS Platform Admin",
    name: "Eleanor Vance",
    email: "ielts.admin@edu.com",
    badge: "IELTS Lead",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    borderHover: "hover:border-sky-400",
  },
  {
    tier: "Track Admin",
    role: "SAT Platform Admin",
    name: "Marcus Holloway",
    email: "sat.admin@edu.com",
    badge: "SAT Lead",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    borderHover: "hover:border-indigo-400",
  },
  {
    tier: "Teacher",
    role: "IELTS Teacher & Examiner",
    name: "Sarah Jenkins",
    email: "ielts.teacher@edu.com",
    badge: "IELTS Faculty",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    borderHover: "hover:border-blue-400",
  },
  {
    tier: "Teacher",
    role: "SAT Math & RW Specialist",
    name: "David Chen",
    email: "sat.teacher@edu.com",
    badge: "SAT Faculty",
    badgeColor: "bg-violet-100 text-violet-800 border-violet-200",
    borderHover: "hover:border-violet-400",
  },
  {
    tier: "Teacher",
    role: "Dual Track Instructor",
    name: "Prof. Rachel Green",
    email: "dual.teacher@edu.com",
    badge: "Both Tracks",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    borderHover: "hover:border-emerald-400",
  },
  {
    tier: "Student",
    role: "IELTS-Only Candidate",
    name: "Amina Al-Mansoor (Target: Band 8)",
    email: "ielts.student@edu.com",
    badge: "IELTS Only",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    borderHover: "hover:border-sky-400",
  },
  {
    tier: "Student",
    role: "SAT-Only Candidate",
    name: "Liam O'Connor (Target: 1550)",
    email: "sat.student@edu.com",
    badge: "SAT Only",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    borderHover: "hover:border-indigo-400",
  },
  {
    tier: "Student",
    role: "Dual Student (IELTS + SAT)",
    name: "Sofia Rodriguez (Target: 7.5 & 1500)",
    email: "dual.student@edu.com",
    badge: "Dual Student",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    borderHover: "hover:border-amber-400",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (overrideEmail?: string) => {
    const targetEmail = overrideEmail || email;
    if (!targetEmail) {
      setError("Please enter your email or select a demo account.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: password || "Password123!" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectUrl || "/hub");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const selectPersona = (pEmail: string) => {
    setEmail(pEmail);
    setPassword("Password123!");
    handleLogin(pEmail);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-3">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Role-Based Multi-Tenant Access Control</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            ApexPrep Unified Portal
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Sign in to your standardized preparation portal. Select any of the 4 panel tiers below to instantly test the environment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Direct Login Form */}
          <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400" />
              Account Login
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Default password for all test accounts is <code className="text-sky-300 font-mono">Password123!</code>
            </p>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-rose-950/60 border border-rose-700/60 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ielts.student@edu.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/20 disabled:opacity-60"
              >
                {loading ? "Authenticating..." : "Sign In to Portal"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* 1-Click Persona Selector */}
          <div className="lg:col-span-7 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Instant 1-Click Role Testing
                </h2>
                <p className="text-xs text-slate-400">
                  Select any persona to immediately sign in and inspect that panel tier
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {DEMO_PERSONAS.map((persona) => (
                <button
                  key={persona.email}
                  onClick={() => selectPersona(persona.email)}
                  disabled={loading}
                  className={`text-left p-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-900 transition-all ${persona.borderHover} group relative`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {persona.tier}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${persona.badgeColor}`}
                    >
                      {persona.badge}
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors">
                    {persona.name}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {persona.role}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate mt-1">
                    {persona.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
