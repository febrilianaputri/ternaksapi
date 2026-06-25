import { NextResponse } from "next/server";
import { AUTH_COOKIE_OPTIONS } from "@/lib/jwt";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logout berhasil" });

  response.cookies.set({
    name: AUTH_COOKIE_OPTIONS.name,
    value: "",
    httpOnly: AUTH_COOKIE_OPTIONS.httpOnly,
    secure: AUTH_COOKIE_OPTIONS.secure,
    sameSite: AUTH_COOKIE_OPTIONS.sameSite,
    path: AUTH_COOKIE_OPTIONS.path,
    maxAge: 0,
  });

  return response;
}
