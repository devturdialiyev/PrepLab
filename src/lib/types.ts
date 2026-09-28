export type Role = "STUDENT" | "TEACHER" | "TRACK_ADMIN" | "SUPER_ADMIN";
export type Track = "IELTS" | "SAT" | "BOTH";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  trackAccess: Track;
  avatar?: string | null;
  targetScore?: string | null;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: Role;
  trackAccess: Track;
  name: string;
  exp?: number;
  iat?: number;
}
