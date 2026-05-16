/**
 * Client-seitiges Tracking.
 * Sendet Events an /api/analytics/track — self-hosted, in unserer SQLite-DB.
 *
 * Funktioniert nur, wenn Consent-Analytics gegeben ist (siehe Tracker.tsx).
 * Aufrufe vor Consent werden stillschweigend verworfen.
 */

import type { EventType, TrackPayload } from "./analytics/types";
import { readConsent } from "./cookie-consent";

const SESSION_KEY = "rak-aid";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 Min Inaktivität → neue Session
const LAST_TOUCH_KEY = "rak-aid-touch";

function genSessionId(): string {
  const arr = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function getOrCreateSessionId(): { id: string; isNew: boolean } {
  if (typeof window === "undefined") return { id: "", isNew: false };
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  const lastTouch = Number(
    window.localStorage.getItem(LAST_TOUCH_KEY) ?? "0",
  );
  const now = Date.now();
  const expired = !lastTouch || now - lastTouch > SESSION_TIMEOUT_MS;

  if (existing && !expired) {
    window.localStorage.setItem(LAST_TOUCH_KEY, String(now));
    return { id: existing, isNew: false };
  }
  const id = genSessionId();
  window.sessionStorage.setItem(SESSION_KEY, id);
  window.localStorage.setItem(LAST_TOUCH_KEY, String(now));
  return { id, isNew: true };
}

function consented(): boolean {
  const c = readConsent();
  return c?.categories.analytics === true;
}

async function send(payload: TrackPayload): Promise<void> {
  if (typeof window === "undefined") return;
  if (!consented()) return;

  try {
    const body = JSON.stringify(payload);
    // navigator.sendBeacon ist für unload-Szenarien wertvoll, aber gibt
    // nur Boolean zurück — wir nutzen fetch mit keepalive für Konsistenz.
    if (navigator.sendBeacon && payload.type === "scroll_depth") {
      navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // fire-and-forget — Tracking darf nie die UX stören
  }
}

function track(type: EventType, params: Partial<TrackPayload> = {}): void {
  if (typeof window === "undefined") return;
  if (!consented()) return;
  const { id: sessionId } = getOrCreateSessionId();
  if (!sessionId) return;
  const path = window.location.pathname + window.location.search;

  send({
    type,
    sessionId,
    pagePath: params.pagePath ?? path,
    referrer: params.referrer,
    ctaId: params.ctaId,
    formId: params.formId,
    scrollPct: params.scrollPct,
    durationMs: params.durationMs,
    meta: params.meta,
  });
}

// ============================================================
// Typisierte Event-Wrapper
// ============================================================
export const events = {
  pageView: () => track("pageview"),
  sessionStart: (referrer?: string) =>
    track("session_start", {
      referrer: referrer || document.referrer || undefined,
    }),

  ctaClick: (ctaId: string, meta?: Record<string, unknown>) =>
    track("cta_click", { ctaId, meta }),

  outboundClick: (
    host: string,
    kind: "phone" | "email" | "instagram" | "maps" | "external",
    meta?: Record<string, unknown>,
  ) =>
    track("outbound_click", {
      ctaId: kind,
      meta: { host, ...(meta ?? {}) },
    }),

  formStart: (formId: string) => track("form_start", { formId }),
  formSubmit: (formId: string, meta?: Record<string, unknown>) =>
    track("form_submit", { formId, meta }),
  formAbandon: (formId: string) => track("form_abandon", { formId }),

  scrollDepth: (percent: 25 | 50 | 75 | 100) =>
    track("scroll_depth", { scrollPct: percent }),
};

// Consent-Mutation aus dem Banner an den Server spiegeln (sofern Analytics-OK
// oder sogar bei Ablehnung — Consent-Records sind Pflichtinformation).
export async function sendConsentDecision(opts: {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  version: string;
}): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}
