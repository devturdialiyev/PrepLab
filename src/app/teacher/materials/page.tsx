"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, FileText, Music, Video, Plus, Check, AlertCircle, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import { SessionUser } from "@/lib/types";

interface Material {
  id: string;
  title: string;
  description?: string | null;
  track: "IELTS" | "SAT";
  module: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
  createdAt: string;
  uploadedBy: {
    name: string;
    email: string;
  };
}

export default function TeacherMaterialsPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState<"IELTS" | "SAT">("IELTS");
  const [moduleName, setModuleName] = useState("WRITING");
  const [fileType, setFileType] = useState("PDF");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState("3.2 MB");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meRes, matRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/teacher/materials"),
      ]);
      const meData = await meRes.json();
      const matData = await matRes.json();

      if (meData.authenticated) {
        setSession(meData.user);
        if (meData.user.trackAccess === "SAT") {
          setTrack("SAT");
          setModuleName("MATH");
        }
      }
      if (matData.materials) setMaterials(matData.materials);
    } catch {
      setMessage({ text: "Failed to load study materials", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/teacher/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          track,
          module: moduleName,
          fileType,
          fileUrl: fileUrl || "/materials/sample-document.pdf",
          fileSize,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");

      setMaterials([data.material, ...materials]);
      setShowUploadModal(false);
      setTitle("");
      setDescription("");
      setFileUrl("");
      setMessage({ text: "Study material successfully published!", type: "success" });
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : "Error uploading file", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMaterials = materials.filter(
    (m) => selectedTrack === "ALL" || m.track === selectedTrack
  );

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
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Study Material
          </button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Study Materials & Guides Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish official audio tracks for Listening, reading practice sets, math cheat-sheets, and PDF vocabulary guides.
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
            {message.type === "success" ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            {message.text}
          </div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Track:
          </span>
          {["ALL", "IELTS", "SAT"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTrack(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTrack === t
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {t === "ALL" ? "All Tracks" : `${t} Materials`}
            </button>
          ))}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              Loading materials...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No study materials found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "Upload Study Material" to publish your first guide.</p>
            </div>
          ) : (
            filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        mat.track === "IELTS"
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : "bg-purple-50 text-purple-800 border-purple-200"
                      }`}
                    >
                      {mat.track} • {mat.module}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {mat.fileType}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                    {mat.description || "Official study and preparation resource."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>By {mat.uploadedBy.name}</span>
                  <span className="font-mono">{mat.fileSize || "1.5 MB"}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                Upload New Study Material
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Publish a document, audio recording, or test worksheet for student download.
              </p>

              <form onSubmit={handleUpload} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IELTS Writing Band 8 Sample Essays"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description / Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the material..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Track</label>
                    <select
                      value={track}
                      onChange={(e) => {
                        const tr = e.target.value as "IELTS" | "SAT";
                        setTrack(tr);
                        setModuleName(tr === "IELTS" ? "WRITING" : "MATH");
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    >
                      <option value="IELTS">IELTS Academic</option>
                      <option value="SAT">Digital SAT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Module / Domain</label>
                    <select
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {track === "IELTS" ? (
                        <>
                          <option value="LISTENING">Listening</option>
                          <option value="READING">Reading</option>
                          <option value="WRITING">Writing</option>
                          <option value="SPEAKING">Speaking</option>
                          <option value="GENERAL">General IELTS</option>
                        </>
                      ) : (
                        <>
                          <option value="MATH">Math</option>
                          <option value="READING_WRITING">Reading & Writing</option>
                          <option value="GENERAL">General SAT</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">File Type</label>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="AUDIO">Audio MP3 (Listening)</option>
                      <option value="VIDEO">Video Lecture URL</option>
                      <option value="DOC">Word Document / Worksheet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">File Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 4.5 MB"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">File URL or Path</label>
                  <input
                    type="text"
                    placeholder="/materials/sample-sheet.pdf or audio link"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Publishing..." : "Publish Material"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
