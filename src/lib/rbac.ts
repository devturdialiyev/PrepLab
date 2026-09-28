import { Role, Track, SessionUser } from "./types";

export function canAccessTrack(user: SessionUser | null, track: "IELTS" | "SAT"): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  return user.trackAccess === "BOTH" || user.trackAccess === track;
}

export function isTeacher(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.role === "TEACHER" || user.role === "SUPER_ADMIN";
}

export function isTrackAdmin(user: SessionUser | null, track?: "IELTS" | "SAT"): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "TRACK_ADMIN") {
    if (!track) return true;
    return user.trackAccess === "BOTH" || user.trackAccess === track;
  }
  return false;
}

export function isSuperAdmin(user: SessionUser | null): boolean {
  return user?.role === "SUPER_ADMIN";
}
