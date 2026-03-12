import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getCookieName,
  getCookieOptions,
  validateCredentials,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    const username =
      typeof body.username === "string" ? body.username : null;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const session = createSessionToken();
    if (!session) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const opts = getCookieOptions(session.expiresAt);
    const cookieParts = [
      `${getCookieName()}=${encodeURIComponent(session.token)}`,
      "HttpOnly",
      `Path=${opts.path}`,
      `Max-Age=${opts.maxAge}`,
      `SameSite=${opts.sameSite}`,
    ];
    if (opts.secure) cookieParts.push("Secure");

    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", cookieParts.join("; "));
    return response;
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
