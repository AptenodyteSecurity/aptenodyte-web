import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stop-gap auth for the hidden `/studio` blog editor. This is intentionally
 * simple — a single shared password from the environment, plus an HMAC-signed
 * session cookie. Replace it with real accounts when the database is live.
 */

export const STUDIO_COOKIE = "apt_studio";

/** Session lifetime in seconds (7 days). */
const SESSION_TTL = 60 * 60 * 24 * 7;

function password(): string | undefined {
  return process.env.BLOG_STUDIO_PASSWORD;
}

function secret(): string | undefined {
  return process.env.BLOG_STUDIO_SECRET;
}

export function isStudioConfigured(): boolean {
  return Boolean(password() && secret());
}

function sign(payload: string): string {
  return createHmac("sha256", secret() as string)
    .update(payload)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function checkPassword(candidate: string): boolean {
  const expected = password();
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

/** `<expiryEpochSeconds>.<signature>` */
export function createSessionToken(now = Date.now()): string {
  const expiry = Math.floor(now / 1000) + SESSION_TTL;
  return `${expiry}.${sign(String(expiry))}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !isStudioConfigured()) return false;

  const [expiryRaw, signature] = token.split(".");
  if (!expiryRaw || !signature) return false;

  const expiry = Number(expiryRaw);
  if (!Number.isFinite(expiry) || expiry * 1000 < Date.now()) return false;

  return safeEqual(signature, sign(expiryRaw));
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/studio",
  maxAge: SESSION_TTL,
} as const;
