import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { Role, Track } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      trackAccess: user.trackAccess as Track,
    });

    // Determine redirect destination based on role and track
    let redirectUrl = "/hub";
    if (user.role === "SUPER_ADMIN") {
      redirectUrl = "/super-admin";
    } else if (user.role === "TRACK_ADMIN") {
      redirectUrl = user.trackAccess === "SAT" ? "/admin/sat" : "/admin/ielts";
    } else if (user.role === "TEACHER") {
      redirectUrl = "/teacher";
    } else if (user.role === "STUDENT") {
      if (user.trackAccess === "IELTS") redirectUrl = "/ielts/student";
      else if (user.trackAccess === "SAT") redirectUrl = "/sat/student";
      else redirectUrl = "/hub";
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        trackAccess: user.trackAccess,
      },
      redirectUrl,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication" },
      { status: 500 }
    );
  }
}
