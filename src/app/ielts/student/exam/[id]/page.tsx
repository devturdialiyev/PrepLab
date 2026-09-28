"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Send,
  BookOpen,
  FileEdit,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2
} from "lucide-react";

interface Question {
  id: string;
  order: number;
  type: string;
  questionText: string;
  optionsJson?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
}

interface ExamSection {
  id: string;
  sectionType: string;
  title: string;
  durationMinutes: number;
  passageText?: string | null;
  audioUrl?: string | null;
  questions: Question[];
}

interface MockExam {
  id: string;
  title: string;
  track: string;
  durationMinutes: number;
  sections: ExamSection[];
}

export default function IeltsExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [exam, setExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    status: string;
    scaledScore: string;
    rawScore: number;
  } | null>(null);

  useEffect(() => {
    fetchExam();
  }, [params.id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExam = async () => {
    try {
      const res = await fetch(`/api/exams/${params.id}`);
      const data = await res.json();
      if (data.exam) {
        setExam(data.exam);
        setTimeLeft(data.exam.durationMinutes * 60);
      }
    } catch (e) {
      console.error("Failed to load exam", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!exam) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          answers,
          timeSpentSeconds: exam.durationMinutes * 60 - timeLeft,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmittedResult(data);
    } catch (e) {
      alert("Error submitting exam: " + (e instanceof Error ? e.message : "Network error"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        Loading IELTS Examination Environment...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <p className="text-sm font-semibold mb-3">Examination not found or inaccessible.</p>
        <Link href="/ielts/student" className="text-sky-400 text-xs hover:underline">
          Return to IELTS Portal
        </Link>
      </div>
    );
  }

  const currentSection = exam.sections[activeSectionIdx] || exam.sections[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Official IELTS Test Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 h-14 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/ielts/student"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-px bg-slate-700 hidden sm:block" />
          <span className="font-bold text-sm tracking-tight truncate max-w-xs sm:max-w-md">
            {exam.title}
          </span>
        </div>

        {/* Section Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          {exam.sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => setActiveSectionIdx(idx)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeSectionIdx === idx
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sec.sectionType}
            </button>
          ))}
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-sky-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </header>

      {/* Main Examination View (Split Screen) */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Passage or Listening Audio Player */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[550px] max-h-[750px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold text-sky-800 uppercase tracking-wider">
              {currentSection.title}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Module {activeSectionIdx + 1} of {exam.sections.length}
            </span>
          </div>

          {currentSection.sectionType === "LISTENING" && (
            <div className="mb-6 p-4 rounded-xl bg-sky-50 border border-sky-200">
              <div className="flex items-center gap-2 mb-2 text-sky-900 font-bold text-xs">
                <Volume2 className="w-4 h-4 text-sky-600" />
                Listening Audio Player (Official Test Recording)
              </div>
              <audio controls className="w-full mt-2">
                <source src={currentSection.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} type="audio/mpeg" />
                Your browser does not support audio.
              </audio>
            </div>
          )}

          <div className="prose prose-slate prose-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-serif text-sm">
            {currentSection.passageText || "Please proceed to answer the questions in the right-hand panel."}
          </div>
        </div>

        {/* Right Pane: Interactive Question Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[550px] max-h-[750px] overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase">
                Questions & Answers
              </span>
              <span className="text-xs text-slate-400">
                {currentSection.questions.length} Items
              </span>
            </div>

            <div className="space-y-6">
              {currentSection.questions.map((q, idx) => {
                const options: string[] = q.optionsJson ? JSON.parse(q.optionsJson) : [];
                const currentVal = answers[q.id] || "";

                if (q.type === "ESSAY") {
                  const wordsCount = currentVal.trim() ? currentVal.trim().split(/\s+/).length : 0;
                  return (
                    <div key={q.id} className="space-y-3">
                      <div className="font-semibold text-xs text-slate-900 leading-snug">
                        Question {idx + 1}: {q.questionText}
                      </div>

                      <div className="relative">
                        <textarea
                          rows={14}
                          value={currentVal}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder="Compose your academic essay response here. Aim for at least 250 words with organized paragraphs and clear examples..."
                          className="w-full p-4 text-xs font-sans border border-slate-200 rounded-xl text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <div className="absolute bottom-3 right-3 text-[11px] font-mono font-bold bg-white/90 px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                          Word Count: <span className={wordsCount >= 250 ? "text-emerald-600 font-extrabold" : "text-amber-600"}>{wordsCount}</span> / 250
                        </div>
                      </div>
                    </div>
                  );
                }

                if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE_NOT_GIVEN") {
                  return (
                    <div key={q.id} className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-semibold text-xs text-slate-900">
                        Item {idx + 1}: {q.questionText}
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {options.map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-all ${
                              currentVal === opt
                                ? "bg-sky-50 border-sky-300 font-bold text-sky-900"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={opt}
                              checked={currentVal === opt}
                              onChange={() => handleAnswerChange(q.id, opt)}
                              className="accent-sky-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              disabled={activeSectionIdx === 0}
              onClick={() => setActiveSectionIdx((prev) => Math.max(0, prev - 1))}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              ← Previous Module
            </button>
            <button
              disabled={activeSectionIdx === exam.sections.length - 1}
              onClick={() => setActiveSectionIdx((prev) => Math.min(exam.sections.length - 1, prev + 1))}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40"
            >
              Next Module →
            </button>
          </div>
        </div>
      </main>

      {/* Submission Success Modal */}
      {submittedResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">IELTS Mock Submitted!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your test answers have been saved to your academic record.
            </p>

            <div className="my-5 p-4 rounded-xl bg-sky-50 border border-sky-100">
              <span className="text-[11px] font-bold text-sky-800 uppercase block">Score Status</span>
              <span className="text-2xl font-black text-sky-950 font-mono mt-0.5 block">
                {submittedResult.scaledScore}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                {submittedResult.status === "SUBMITTED"
                  ? "Writing Task 2 is queued for certified teacher evaluation."
                  : "Auto-graded listening & reading."}
              </span>
            </div>

            <button
              onClick={() => router.push("/ielts/student")}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Return to IELTS Student Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
