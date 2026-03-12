import { NextResponse } from "next/server";
import { getCookieName } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${getCookieName()}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
  );
  return response;
}
