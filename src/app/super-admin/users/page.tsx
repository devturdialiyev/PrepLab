"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, Shield, Check, RefreshCw, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { SessionUser, Role, Track } from "@/lib/types";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: Role;
  trackAccess: Track;
  targetScore?: string | null;
  createdAt: string;
  _count: {
    submissions: number;
    uploadedMaterials: number;
  };
}

export default function UsersManagementPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterTrack, setFilterTrack] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSessionAndUsers();
  }, []);

  const fetchSessionAndUsers = async () => {
    setLoading(true);
    try {
      const [meRes, usersRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admin/users"),
      ]);
      const meData = await meRes.json();
      const usersData = await usersRes.json();

      if (meData.authenticated) setSession(meData.user);
      if (usersData.users) setUsers(usersData.users);
    } catch {
      setMessage({ text: "Failed to load user directory", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (userId: string, updates: { role?: Role; trackAccess?: Track }) => {
    setUpdatingId(userId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );
      setMessage({ text: "User privileges updated successfully!", type: "success" });
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : "Error updating user", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    const matchesTrack = filterTrack === "ALL" || u.trackAccess === filterTrack;
    return matchesSearch && matchesRole && matchesTrack;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {session && <Navbar user={session} activeTrack="ADMIN" />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/super-admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Super Admin Command Center
          </Link>
          <span className="text-xs text-slate-400 font-medium">Total: {users.length} Users</span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Access & Role Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grant or revoke student enrollments, teacher permissions, track admin statuses, or Super Admin control.
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

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="TEACHER">Teachers</option>
              <option value="TRACK_ADMIN">Track Admins</option>
              <option value="SUPER_ADMIN">Super Admins</option>
            </select>

            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Tracks</option>
              <option value="IELTS">IELTS Track</option>
              <option value="SAT">SAT Track</option>
              <option value="BOTH">Both (Dual Track)</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Target Score</th>
                  <th className="py-3 px-4">Role Assignment</th>
                  <th className="py-3 px-4">Track Access</th>
                  <th className="py-3 px-4">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No users match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {u.targetScore || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          disabled={updatingId === u.id}
                          value={u.role}
                          onChange={(e) =>
                            handleUpdate(u.id, { role: e.target.value as Role })
                          }
                          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                          <option value="TRACK_ADMIN">TRACK_ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          disabled={updatingId === u.id}
                          value={u.trackAccess}
                          onChange={(e) =>
                            handleUpdate(u.id, { trackAccess: e.target.value as Track })
                          }
                          className={`border rounded-md px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 disabled:opacity-50 ${
                            u.trackAccess === "BOTH"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : u.trackAccess === "IELTS"
                              ? "bg-sky-50 text-sky-800 border-sky-200"
                              : "bg-purple-50 text-purple-800 border-purple-200"
                          }`}
                        >
                          <option value="IELTS">IELTS</option>
                          <option value="SAT">SAT</option>
                          <option value="BOTH">BOTH (Dual Access)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {u._count.submissions} Exams • {u._count.uploadedMaterials} Materials
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
