import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { AuthUser } from "./jwt";

export function unauthorized(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const uid = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const role = request.headers.get("x-user-role");
  if (!uid || !email || !role) {
    return null;
  }

  return { uid, email, role };
}

export function requireAuth(request: NextRequest): AuthUser | NextResponse {
  const user = getAuthUser(request);
  if (!user) {
    return unauthorized("Authentication required");
  }
  return user;
}

export function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): AuthUser | NextResponse {
  const user = getAuthUser(request);
  if (!user) {
    return unauthorized("Authentication required");
  }

  if (!allowedRoles.includes(user.role)) {
    return forbidden("Insufficient permissions");
  }

  return user;
}
