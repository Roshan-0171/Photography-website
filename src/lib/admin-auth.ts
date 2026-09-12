import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Authentication for the enquiry admin page.
 *
 * Deliberately small: one password, one signed cookie, no user table and no
 * third-party dependency. The page behind it shows other people's names, email
 * addresses and messages, so the rules are strict —
 *
 *   · disabled entirely unless ADMIN_PASSWORD is set, so an unconfigured
 *     deployment has no login surface at all rather than a guessable one;
 *   · the cookie is signed, not encrypted-nothing: it carries only an expiry,
 *     and a tampered one fails its HMAC;
 *   · httpOnly, so no script can read it; SameSite=Strict, so no other site can
 *     cause an authenticated request; Secure outside development;
 *   · both the password and the signature are compared in constant time.
 */

const COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // a week, so a phone is not a chore

export const isEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

/**
 * Signing key. Falls back to the password so the page works with one variable
 * set, but a dedicated secret is better: rotating it then invalidates every
 * session without changing the password.
 */
const secret = () =>
  process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";

/** Constant time, and length-independent because both sides are hashed first. */
function constantTimeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return constantTimeEqual(candidate, expected);
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export async function createSession(): Promise<void> {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);

  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isSignedIn(): Promise<boolean> {
  if (!isEnabled()) return false;

  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  if (!constantTimeEqual(signature, sign(payload))) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}
