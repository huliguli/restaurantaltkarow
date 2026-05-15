import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

/**
 * Minimaler Single-Admin-Auth:
 *
 * - Login: POST mit username + password
 *   → username muss === process.env.ADMIN_USERNAME sein
 *   → password wird via bcrypt gegen ADMIN_PASSWORD_HASH geprüft
 *   → bei Erfolg: signed Cookie "admin_session" gesetzt
 *
 * - Session-Cookie: "<base64url payload>.<hmac>"
 *   payload = { sub: <username>, exp: <unix-ms> }
 *   hmac    = HMAC-SHA256(payload, ADMIN_SESSION_SECRET)
 *
 * - Bei jedem Aufruf einer Admin-Page/-API: getAdminSession() prüft
 *   Cookie-Existenz, Signatur, Ablaufzeit. Bei Fehler → null.
 */

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_HOURS = 24;

type SessionPayload = {
  sub: string;
  exp: number;
};

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET ist nicht gesetzt oder zu kurz (mind. 16 Zeichen).",
    );
  }
  return s;
}

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(s: string): Buffer {
  let p = s.replace(/-/g, "+").replace(/_/g, "/");
  while (p.length % 4 !== 0) p += "=";
  return Buffer.from(p, "base64");
}

function sign(payload: SessionPayload): string {
  const secret = getSecret();
  const json = JSON.stringify(payload);
  const encoded = base64UrlEncode(Buffer.from(json, "utf8"));
  const hmac = createHmac("sha256", secret).update(encoded).digest();
  return `${encoded}.${base64UrlEncode(hmac)}`;
}

function verify(token: string): SessionPayload | null {
  const secret = getSecret();
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = createHmac("sha256", secret).update(encoded).digest();
  let actual: Buffer;
  try {
    actual = base64UrlDecode(signature);
  } catch {
    return null;
  }
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encoded).toString("utf8"));
  } catch {
    return null;
  }
  if (!payload?.sub || !payload?.exp) return null;
  if (payload.exp < Date.now()) return null;
  return payload;
}

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !expectedHash) {
    throw new Error(
      "ADMIN_USERNAME oder ADMIN_PASSWORD_HASH ist nicht gesetzt.",
    );
  }
  if (username !== expectedUser) {
    // Trotzdem bcrypt-Vergleich laufen lassen, um Timing-Angriffe zu erschweren
    await bcrypt.compare(password, expectedHash);
    return false;
  }
  return bcrypt.compare(password, expectedHash);
}

export async function setSessionCookie(username: string): Promise<void> {
  const exp = Date.now() + SESSION_MAX_AGE_HOURS * 60 * 60 * 1000;
  const token = sign({ sub: username, exp });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_HOURS * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  return verify(cookie.value);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
