import { NextResponse } from "next/server";
import {
  checkLimit,
  clientIp,
  hashVisitorId,
  inferCountry,
  inferLanguage,
  isValidEventType,
  parseUA,
  safePagePath,
  safeReferrer,
  safeShortString,
} from "@/lib/analytics/server";
import { ingestEvent } from "@/lib/analytics/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  type?: unknown;
  sessionId?: unknown;
  pagePath?: unknown;
  referrer?: unknown;
  ctaId?: unknown;
  formId?: unknown;
  scrollPct?: unknown;
  durationMs?: unknown;
  meta?: unknown;
}

const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

export async function POST(req: Request) {
  const ip = clientIp(req);

  // Rate-Limit pro IP — Analytics ist high-frequency, aber wir verhindern Spam
  const limit = checkLimit(`track:${ip}`, { windowMs: 60_000, max: 240 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (!isValidEventType(body.type)) {
    return NextResponse.json({ error: "bad-type" }, { status: 400 });
  }
  if (
    typeof body.sessionId !== "string" ||
    !SESSION_ID_RE.test(body.sessionId)
  ) {
    return NextResponse.json({ error: "bad-session" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const visitorId = hashVisitorId(ip, ua);
  const parsed = parseUA(ua);
  const language = inferLanguage(req);
  const country = inferCountry(req);

  const type = body.type as string;
  const sessionId = body.sessionId;
  const pagePath = safePagePath(body.pagePath);
  const referrer = safeReferrer(body.referrer);
  const ctaId = safeShortString(body.ctaId);
  const formId = safeShortString(body.formId);
  const scrollPct =
    typeof body.scrollPct === "number" &&
    body.scrollPct >= 0 &&
    body.scrollPct <= 100
      ? Math.round(body.scrollPct)
      : null;
  const durationMs =
    typeof body.durationMs === "number" &&
    body.durationMs >= 0 &&
    body.durationMs < 24 * 60 * 60 * 1000
      ? Math.round(body.durationMs)
      : null;

  let meta: string | null = null;
  if (body.meta && typeof body.meta === "object") {
    try {
      meta = JSON.stringify(body.meta).slice(0, 500);
    } catch {
      meta = null;
    }
  }

  try {
    ingestEvent({
      type,
      sessionId,
      visitorId,
      pagePath,
      referrer,
      ctaId,
      formId,
      scrollPct,
      durationMs,
      deviceType: parsed.deviceType,
      browser: parsed.browser,
      os: parsed.os,
      language,
      country,
      meta,
    });
  } catch (err) {
    console.error("Analytics ingest failed:", err);
    // 204 zurück — Tracking ist fire-and-forget, Client soll nicht crashen
  }

  return new Response(null, { status: 204 });
}
