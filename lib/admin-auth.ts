import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) return null;
  return secret;
}

function sign(value: string): string | null {
  const secret = getSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(): { token: string; expiresAt: number } | null {
  const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `admin:${expiresAt}`;
  const signature = sign(payload);
  if (!signature) return null;
  const token = Buffer.from(`${payload}:${signature}`).toString("base64url");
  return { token, expiresAt };
}

export function verifySessionToken(token: string): boolean {
  try {
    if (!getSecret()) return false;
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon <= 0) return false;
    const payload = decoded.slice(0, lastColon);
    const signature = decoded.slice(lastColon + 1);
    if (!payload || !signature) return false;
    const expected = sign(payload);
    if (!expected || expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"))) {
      return false;
    }
    const [, expiresStr] = payload.split(":");
    const expiresAt = parseInt(expiresStr, 10);
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

export function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  let value = match?.[1]?.trim();
  if (!value) return null;
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function isAdminAuthenticated(request: Request): boolean {
  const token = getSessionFromRequest(request);
  if (!token) return false;
  return verifySessionToken(token);
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

/** Use when reading cookie value from Next.js cookies().get(name)?.value */
export function parseCookieToken(rawValue: string | undefined): string | null {
  if (!rawValue || typeof rawValue !== "string") return null;
  let trimmed = rawValue.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    trimmed = trimmed.slice(1, -1);
  }
  if (!trimmed) return null;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function getCookieOptions(expiresAt: number): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.floor((expiresAt - Date.now()) / 1000),
    path: "/",
  };
}

export function validateCredentials(username: string | null, password: string): boolean {
  const envPassword = process.env.ADMIN_PASSWORD;
  const envUsername = process.env.ADMIN_USERNAME;
  if (!envPassword) return false;
  if (envUsername !== undefined && envUsername !== null && envUsername !== "") {
    return username === envUsername && password === envPassword;
  }
  return password === envPassword;
}
