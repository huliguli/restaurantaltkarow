import { createHash } from "node:crypto";
import type { DeviceType, ParsedUA } from "./types";

/**
 * Visitor-Identität ohne IP-Speicherung.
 *
 * visitorId = sha256(secret + UTC-Date + ip + ua-Prefix).slice(0, 24)
 *   → Tages-rotierender Salt: keine cross-day-Korrelation möglich
 *   → IP wird NIE roh gespeichert
 *   → UA gekürzt, mit Salt vermischt
 */

function sessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET fehlt oder zu kurz — Analytics-Hashing nicht möglich.",
    );
  }
  return s;
}

function dailySalt(now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${sessionSecret()}:visitor:${date}`)
    .digest("hex")
    .slice(0, 24);
}

export function hashVisitorId(ip: string, ua: string, now?: Date): string {
  const salt = dailySalt(now);
  const uaPrefix = (ua || "").slice(0, 80);
  return createHash("sha256")
    .update(`${salt}:${ip || "unknown"}:${uaPrefix}`)
    .digest("hex")
    .slice(0, 24);
}

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${sessionSecret()}:ip:${ip}`)
    .digest("hex")
    .slice(0, 24);
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

/* ============================================================
 *  UA-Parsing — abhängigkeitsfrei
 * ============================================================ */

export function parseUA(ua: string): ParsedUA {
  const u = (ua || "").toLowerCase();

  let deviceType: DeviceType = "desktop";
  if (/ipad|tablet|playbook|silk(?!.*mobile)/.test(u)) deviceType = "tablet";
  else if (
    /mobile|iphone|ipod|android(?!.*tablet)|blackberry|windows phone/.test(u)
  )
    deviceType = "mobile";
  else if (!u) deviceType = "unknown";

  let browser = "Unbekannt";
  if (/edg\//.test(u)) browser = "Edge";
  else if (/opr\/|opera/.test(u)) browser = "Opera";
  else if (/chrome\//.test(u) && !/chromium/.test(u)) browser = "Chrome";
  else if (/firefox\//.test(u)) browser = "Firefox";
  else if (/safari\//.test(u) && /version\//.test(u)) browser = "Safari";
  else if (/msie|trident/.test(u)) browser = "Internet Explorer";
  else if (/samsungbrowser/.test(u)) browser = "Samsung Internet";

  let os = "Unbekannt";
  if (/windows nt/.test(u)) os = "Windows";
  else if (/mac os x/.test(u) && !/iphone|ipad|ipod/.test(u)) os = "macOS";
  else if (/iphone|ipad|ipod/.test(u)) os = "iOS";
  else if (/android/.test(u)) os = "Android";
  else if (/linux/.test(u)) os = "Linux";
  else if (/cros/.test(u)) os = "ChromeOS";

  return { deviceType, browser, os };
}

/* ============================================================
 *  Country / Locale — DSGVO-safe (kein IP-Geo)
 *  - Cloudflare/IONOS-Country-Header wenn verfügbar
 *  - Sonst Accept-Language-Prefix (z. B. "de")
 * ============================================================ */

export function inferCountry(req: Request): string | null {
  const cf = req.headers.get("cf-ipcountry");
  if (cf && cf.length === 2 && cf !== "XX") return cf.toUpperCase();
  const x = req.headers.get("x-vercel-ip-country");
  if (x && x.length === 2) return x.toUpperCase();
  return null;
}

export function inferLanguage(req: Request): string | null {
  const al = req.headers.get("accept-language");
  if (!al) return null;
  const tag = al.split(",")[0]?.trim();
  if (!tag) return null;
  return tag.slice(0, 2).toLowerCase();
}

/* ============================================================
 *  Validatoren
 * ============================================================ */

const PAGE_PATH_RE = /^\/[A-Za-z0-9\-_/.@%~]{0,200}$/;

export function safePagePath(p: unknown): string | null {
  if (typeof p !== "string" || !p) return null;
  if (!PAGE_PATH_RE.test(p)) return null;
  return p.split("?")[0]?.slice(0, 200) ?? null;
}

export function safeReferrer(r: unknown): string | null {
  if (typeof r !== "string" || !r) return null;
  try {
    const u = new URL(r);
    return u.host.toLowerCase().slice(0, 100);
  } catch {
    return null;
  }
}

export function safeShortString(s: unknown, maxLen = 64): string | null {
  if (typeof s !== "string") return null;
  const cleaned = s.replace(/[^\w\-./:@]/g, "").slice(0, maxLen);
  return cleaned || null;
}

export function isValidEventType(t: unknown): boolean {
  return (
    typeof t === "string" &&
    [
      "pageview",
      "session_start",
      "cta_click",
      "form_start",
      "form_submit",
      "form_abandon",
      "scroll_depth",
      "outbound_click",
    ].includes(t)
  );
}

/* ============================================================
 *  Rate-Limit (in-memory, per Server-Prozess)
 *  Reicht für Single-Node-Setup. Verhindert Event-Spam pro IP.
 * ============================================================ */

type Bucket = { count: number; reset: number };
const limitBuckets = new Map<string, Bucket>();

export function checkLimit(
  key: string,
  opts: { windowMs: number; max: number },
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const cur = limitBuckets.get(key);
  if (!cur || cur.reset <= now) {
    limitBuckets.set(key, { count: 1, reset: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1 };
  }
  if (cur.count >= opts.max) {
    return { allowed: false, remaining: 0 };
  }
  cur.count += 1;
  return { allowed: true, remaining: opts.max - cur.count };
}

// Cleanup alle 5 Minuten, damit die Map nicht wächst
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of limitBuckets) {
      if (b.reset <= now) limitBuckets.delete(k);
    }
  }, 5 * 60 * 1000).unref?.();
}
