import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Shield, Users, CheckCircle2, Layers, Award } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-md">
              A
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">ApexPrep</span>
              <span className="text-xs text-sky-600 block font-semibold -mt-1">IELTS & SAT Ecosystem</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Sign In to Portal
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold mb-6">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Two Specialized Exam Tracks • 4 Dedicated Panel Tiers</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              One Unified Ecosystem for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700">
                IELTS Academic
              </span>{" "}
              &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-700">
                Digital SAT
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Engineered with dedicated test simulation engines, teacher grading desks, and independent platform administration with a centralized Super Admin control center.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/login"
                className="px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 shadow-md transition-all flex items-center gap-2"
              >
                Launch Any Panel (Demo Personas)
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* The 2 Specialized Tracks */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Two Specialized Platforms
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Each test track runs in its own dedicated, purpose-built preparation environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* IELTS Card */}
            <div className="bg-white rounded-2xl border-2 border-sky-100 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-0 opacity-70" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-xl mb-5 shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">IELTS Academic Prep</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Complete 4-skill testing system with official band score criteria (0 to 9.0).
                </p>

                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Listening engine with speed-controlled audio playback</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Split-screen Academic Reading with text highlighting</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Writing Task 1 & 2 live word counter & essay submission</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>In-browser Speaking recorder with cue card timer</span>
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                    Band 0.0 - 9.0
                  </span>
                  <Link
                    href="/auth/login"
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
                  >
                    Enter IELTS Portal <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* SAT Card */}
            <div className="bg-white rounded-2xl border-2 border-purple-100 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-0 opacity-70" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl mb-5 shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Digital SAT Prep</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Simulation mirroring College Board Digital SAT interface and 1600-point scoring.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Reading & Writing and Math timed adaptive section simulators</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Built-in scientific calculator drawer & math formula sheet</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Question strikethrough, bookmarking/flagging, and grid nav</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Instant 400-1600 scale scoring with solution explanations</span>
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                    Score 400 - 1600
                  </span>
                  <Link
                    href="/auth/login"
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                  >
                    Enter SAT Portal <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Panel Tiers Breakdown */}
        <section className="py-16 bg-slate-100/70 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                The 4 Dedicated Panel Tiers
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Tailored workflows for students, instructors, and platform leadership.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">1. Student Panel</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  IELTS-only, SAT-only, or Dual-access students. Dual students enjoy a unified dashboard with quick-switching.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">2. Teacher Panel</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Upload study materials (PDF, audio, video), create questions, and grade student submissions with IELTS rubrics.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">3. Track Admin Panel</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Independent curriculum and faculty control for IELTS directors and SAT deans with track-specific metrics.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">4. Super Admin Panel</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Master control across both IELTS and SAT, RBAC user role & track assignments, billing tiers, and analytics.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ApexPrep Dual Academic Platform. Built with Next.js, Prisma, and Tailwind CSS.
        </div>
      </footer>
    </div>
  );
}
