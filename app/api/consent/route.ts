import { NextResponse } from "next/server";
import {
  checkLimit,
  clientIp,
  hashIp,
  hashVisitorId,
} from "@/lib/analytics/server";
import { recordConsent } from "@/lib/analytics/db";
import { POLICY_VERSION } from "@/lib/analytics/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  analytics?: unknown;
  marketing?: unknown;
  functional?: unknown;
  version?: unknown;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = checkLimit(`consent:${ip}`, { windowMs: 60_000, max: 30 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const visitorId = hashVisitorId(ip, ua);

  try {
    recordConsent({
      visitorId,
      analytics: body.analytics === true,
      marketing: body.marketing === true,
      functional: body.functional === true,
      policyVersion:
        typeof body.version === "string" ? body.version : POLICY_VERSION,
      ipHash: hashIp(ip),
      userAgent: ua.slice(0, 200) || null,
    });
  } catch (err) {
    console.error("Consent persist failed:", err);
  }

  return new Response(null, { status: 204 });
}
