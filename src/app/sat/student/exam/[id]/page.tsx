"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Send,
  Calculator,
  Bookmark,
  BookOpen,
  CheckCircle2,
  X,
  FileText,
  Eye,
  EyeOff
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
  questions: Question[];
}

interface MockExam {
  id: string;
  title: string;
  track: string;
  durationMinutes: number;
  sections: ExamSection[];
}

export default function SatExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [exam, setExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(32 * 60); // 32 minutes for module
  const [showClock, setShowClock] = useState(true);
  const [showCalc, setShowCalc] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState<string | null>(null);
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
        const firstSec = data.exam.sections[0];
        if (firstSec) setTimeLeft(firstSec.durationMinutes * 60);
      }
    } catch (e) {
      console.error("Failed to load SAT test", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleCalcEval = () => {
    try {
      // Simple sanitized calculator evaluation
      const sanitized = calcInput.replace(/[^0-9+\-*/().]/g, "");
      // eslint-disable-next-line no-eval
      const res = eval(sanitized);
      setCalcResult(String(res));
    } catch {
      setCalcResult("Error");
    }
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
          timeSpentSeconds: 1800 - timeLeft,
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
        Loading Digital SAT Testing Engine...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <p className="text-sm font-semibold mb-3">SAT Examination not found or inaccessible.</p>
        <Link href="/sat/student" className="text-purple-400 text-xs hover:underline">
          Return to SAT Portal
        </Link>
      </div>
    );
  }

  const currentSection = exam.sections[activeSectionIdx] || exam.sections[0];
  const currentQuestions = currentSection?.questions || [];
  const currentQuestion = currentQuestions[activeQuestionIdx] || currentQuestions[0];
  const options: string[] = currentQuestion?.optionsJson ? JSON.parse(currentQuestion.optionsJson) : [];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";
  const isCurrentFlagged = currentQuestion ? Boolean(flagged[currentQuestion.id]) : false;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Official Digital SAT Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 h-14 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/sat/student"
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-px bg-slate-700 hidden sm:block" />
          <div>
            <span className="font-extrabold text-xs sm:text-sm text-slate-100 block leading-tight">
              {currentSection.title}
            </span>
            <span className="text-[10px] text-purple-400 block font-semibold leading-tight">
              {exam.title}
            </span>
          </div>
        </div>

        {/* Center: Timer with Hide/Show toggle */}
        <div className="flex items-center gap-2">
          {showClock ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-purple-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-semibold px-2">Timer Hidden</span>
          )}
          <button
            onClick={() => setShowClock(!showClock)}
            title={showClock ? "Hide Clock" : "Show Clock"}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {showClock ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right Tools: Calculator, Formulas, and Submit */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowCalc(!showCalc)}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 border transition-colors ${
              showCalc
                ? "bg-purple-600 text-white border-purple-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Calculator</span>
          </button>

          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 border transition-colors ${
              showFormulas
                ? "bg-purple-600 text-white border-purple-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reference</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-3.5 py-1 rounded bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </header>

      {/* Main SAT Exam Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Passage or Context */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[500px] max-h-[680px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase text-purple-700 tracking-wider">
              Passage / Context
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Section {activeSectionIdx + 1}
            </span>
          </div>

          <div className="prose prose-slate prose-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-serif text-sm">
            {currentSection.passageText || "Read the question on the right and select or enter the best answer."}
          </div>
        </div>

        {/* Right Pane: Question & Options */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[500px] max-h-[680px] overflow-y-auto flex flex-col justify-between">
          {currentQuestion ? (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                    {activeQuestionIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700">Question {activeQuestionIdx + 1} of {currentQuestions.length}</span>
                </div>

                {/* Bookmark / Flag for Review */}
                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                    isCurrentFlagged
                      ? "bg-amber-50 text-amber-800 border-amber-300 font-bold"
                      : "text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isCurrentFlagged ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span>{isCurrentFlagged ? "Marked for Review" : "Mark for Review"}</span>
                </button>
              </div>

              <div className="font-semibold text-sm text-slate-900 leading-snug mb-5">
                {currentQuestion.questionText}
              </div>

              {/* Multiple Choice Options */}
              {currentQuestion.type === "MULTIPLE_CHOICE" && (
                <div className="space-y-2.5">
                  {options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAnswer === opt
                          ? "bg-purple-50/80 border-purple-400 text-purple-950 font-bold shadow-sm"
                          : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`sat-q-${currentQuestion.id}`}
                        value={opt}
                        checked={selectedAnswer === opt}
                        onChange={() => handleAnswer(currentQuestion.id, opt)}
                        className="mt-0.5 accent-purple-600"
                      />
                      <span className="leading-relaxed">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Student-Produced Response (Math Grid-in) */}
              {currentQuestion.type === "STUDENT_PRODUCED_MATH" && (
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200">
                  <label className="block text-xs font-bold text-purple-900 mb-1.5">
                    Student-Produced Response (Numerical Answer)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter answer (e.g. 38 or 3/4)"
                    value={selectedAnswer}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Answers may be entered as integers, decimals, or proper/improper fractions.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">No questions in this section.</div>
          )}

          {/* Navigation buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              disabled={activeQuestionIdx === 0}
              onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Back
            </button>
            <button
              disabled={activeQuestionIdx === currentQuestions.length - 1}
              onClick={() => setActiveQuestionIdx((prev) => Math.min(currentQuestions.length - 1, prev + 1))}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Question Navigator Footer */}
      <footer className="bg-white border-t border-slate-200 py-2.5 px-4 sticky bottom-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-bold text-slate-500 mr-2 uppercase">Nav:</span>
            {currentQuestions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isFlag = Boolean(flagged[q.id]);
              const isCurrent = activeQuestionIdx === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`w-7 h-7 rounded text-xs font-bold relative flex items-center justify-center transition-all ${
                    isCurrent
                      ? "ring-2 ring-purple-600 ring-offset-1 bg-purple-700 text-white"
                      : isAnswered
                      ? "bg-purple-100 text-purple-900 border border-purple-300"
                      : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                  {isFlag && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-purple-200 border border-purple-300" /> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Flagged
            </span>
          </div>
        </div>
      </footer>

      {/* Calculator Modal */}
      {showCalc && (
        <div className="fixed bottom-16 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-300 p-4 w-72">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-purple-600" />
              On-Screen Calculator
            </span>
            <button onClick={() => setShowCalc(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder="e.g. 6*7 - 4"
              value={calcInput}
              onChange={(e) => setCalcInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-sm text-right text-slate-900"
            />
            {calcResult !== null && (
              <div className="text-right text-base font-extrabold text-purple-700 font-mono mt-1">
                = {calcResult}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1 text-xs font-mono font-semibold">
            {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === "=") handleCalcEval();
                  else setCalcInput((prev) => prev + btn);
                }}
                className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formula Reference Sheet Modal */}
      {showFormulas && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                SAT Math Reference Formulas
              </h3>
              <button onClick={() => setShowFormulas(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-900 block font-sans mb-1">Circles & Geometry</span>
                <div>• Area of circle: A = π r²</div>
                <div>• Circumference: C = 2 π r</div>
                <div>• Volume of cylinder: V = π r² h</div>
                <div>• Volume of sphere: V = (4/3) π r³</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-900 block font-sans mb-1">Triangles</span>
                <div>• Pythagorean Theorem: a² + b² = c²</div>
                <div>• Special Right Triangle (30°-60°-90°): x, x√3, 2x</div>
                <div>• Special Right Triangle (45°-45°-90°): s, s, s√2</div>
                <div>• Area of triangle: A = (1/2) b h</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-900 block font-sans mb-1">Key Principles</span>
                <div>• Sum of interior angles of triangle = 180°</div>
                <div>• Number of degrees in a circle = 360° (or 2π radians)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Success Modal */}
      {submittedResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">Digital SAT Test Submitted!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your test has been automatically graded on the official 1600-point composite scale.
            </p>

            <div className="my-5 p-4 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Composite SAT Score</span>
              <span className="text-3xl font-black text-purple-950 font-mono mt-0.5 block">
                {submittedResult.scaledScore} / 1600
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Raw Score: {submittedResult.rawScore} correct questions
              </span>
            </div>

            <button
              onClick={() => router.push("/sat/student")}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
            >
              Return to SAT Student Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
