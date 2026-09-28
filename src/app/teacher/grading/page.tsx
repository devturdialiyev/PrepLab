"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, FileText, Star, Send, Award, BookOpen, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { SessionUser } from "@/lib/types";

interface Submission {
  id: string;
  examId: string;
  status: string;
  rawScore?: number | null;
  scaledScore?: string | null;
  submittedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  exam: {
    id: string;
    title: string;
    track: string;
  };
  answers: Array<{
    id: string;
    studentAnswer: string | null;
    question: {
      id: string;
      questionText: string;
      type: string;
    };
  }>;
  evaluation?: {
    bandScore: string;
    generalFeedback: string;
  } | null;
}

export default function TeacherGradingPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Rubric State (IELTS 4 criteria)
  const [taskAchievement, setTaskAchievement] = useState<number>(7.0);
  const [coherence, setCoherence] = useState<number>(7.0);
  const [lexicalResource, setLexicalResource] = useState<number>(7.0);
  const [grammarRange, setGrammarRange] = useState<number>(7.0);
  const [feedback, setFeedback] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const [meRes, gradRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/teacher/grading"),
      ]);
      const meData = await meRes.json();
      const gradData = await gradRes.json();

      if (meData.authenticated) setSession(meData.user);
      if (gradData.submissions) {
        setSubmissions(gradData.submissions);
        if (gradData.submissions.length > 0) {
          setSelectedSub(gradData.submissions[0]);
        }
      }
    } catch {
      setMessage({ text: "Failed to load submissions queue", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Compute calculated overall band score
  const computedBand = (
    Math.round(((taskAchievement + coherence + lexicalResource + grammarRange) / 4) * 2) / 2
  ).toFixed(1);

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/teacher/grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          bandScore: computedBand,
          generalFeedback: feedback,
          criteriaScores: {
            taskAchievement,
            coherence,
            lexicalResource,
            grammarRange,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Grading submission failed");

      setMessage({ text: `Evaluation submitted! Final score: Band ${computedBand}`, type: "success" });
      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSub.id
            ? {
                ...s,
                status: "GRADED",
                scaledScore: `Band ${computedBand}`,
                evaluation: { bandScore: computedBand, generalFeedback: feedback },
              }
            : s
        )
      );
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : "Error submitting evaluation", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {session && <Navbar user={session} activeTrack="TEACHER" />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/teacher"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Teacher Workstation
          </Link>
          <span className="text-xs text-slate-400 font-medium">
            Queue: {submissions.filter((s) => s.status === "SUBMITTED").length} Pending
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Examiner & Faculty Grading Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review student essay submissions, score against official 4-point band rubrics, and provide written feedback.
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2 border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading submissions queue...</div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Grading Queue is Clean</h3>
            <p className="text-xs text-slate-400 mt-1">
              When students submit IELTS Writing essays or mock exams, they will appear here for rubric grading.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Submissions Sidebar Queue */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-2">
                Submissions Roster
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSub(sub);
                      setMessage(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedSub?.id === sub.id
                        ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {sub.exam.track}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.status === "GRADED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {sub.status === "GRADED" ? sub.scaledScore || "Graded" : "Needs Review"}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {sub.student.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {sub.exam.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Submission & Rubric Desk */}
            {selectedSub && (
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Exam Submission</span>
                    <h2 className="text-lg font-bold text-slate-900">{selectedSub.exam.title}</h2>
                    <p className="text-xs text-slate-500">
                      Candidate: <span className="font-semibold text-slate-800">{selectedSub.student.name}</span> ({selectedSub.student.email})
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800">
                    Status: {selectedSub.status}
                  </span>
                </div>

                {/* Student's Essay / Answers */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Student Submission Text</h3>
                  {selectedSub.answers && selectedSub.answers.length > 0 ? (
                    <div className="space-y-4">
                      {selectedSub.answers.map((ans, idx) => (
                        <div key={ans.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-700 block mb-1">
                            Prompt #{idx + 1}: {ans.question.questionText}
                          </span>
                          <div className="text-xs text-slate-900 bg-white p-3 rounded-lg border border-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                            {ans.studentAnswer || "(No answer provided)"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      Full test answers submitted directly.
                    </div>
                  )}
                </div>

                {/* Official 4-Criteria Band Scoring Rubric */}
                <form onSubmit={handleSubmitEvaluation} className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        Official IELTS 4-Criteria Rubric
                      </h3>
                      <p className="text-xs text-slate-500">
                        Adjust criteria scores (0.0 to 9.0) to compute candidate's final band.
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-right">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Computed Band</span>
                      <span className="text-xl font-extrabold text-emerald-950 font-mono">
                        Band {computedBand}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span>Task Achievement / Response</span>
                        <span className="font-bold text-emerald-700">{taskAchievement}</span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="9.0"
                        step="0.5"
                        value={taskAchievement}
                        onChange={(e) => setTaskAchievement(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span>Coherence & Cohesion</span>
                        <span className="font-bold text-emerald-700">{coherence}</span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="9.0"
                        step="0.5"
                        value={coherence}
                        onChange={(e) => setCoherence(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span>Lexical Resource</span>
                        <span className="font-bold text-emerald-700">{lexicalResource}</span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="9.0"
                        step="0.5"
                        value={lexicalResource}
                        onChange={(e) => setLexicalResource(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span>Grammatical Range & Accuracy</span>
                        <span className="font-bold text-emerald-700">{grammarRange}</span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="9.0"
                        step="0.5"
                        value={grammarRange}
                        onChange={(e) => setGrammarRange(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Teacher Feedback Textarea */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Examiner Qualitative Feedback & Advice
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Highlight candidate strengths (e.g. good paragraphing, nuanced vocabulary) and areas to improve before exam day..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submitting ? "Submitting Evaluation..." : "Save & Finalize Evaluation"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
