/**
 * Shared types für Analytics + Consent.
 * Inspiration: wappsite-Architektur (self-hosted, DSGVO-konform).
 */

export const POLICY_VERSION = "2026-05-16";

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  version: string;
  ts: number;
}

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
  version: POLICY_VERSION,
  ts: 0,
};

export type EventType =
  | "pageview"
  | "session_start"
  | "cta_click"
  | "form_start"
  | "form_submit"
  | "form_abandon"
  | "scroll_depth"
  | "outbound_click";

export interface TrackPayload {
  type: EventType;
  sessionId: string;
  pagePath?: string;
  referrer?: string;
  ctaId?: string;
  formId?: string;
  scrollPct?: number;
  durationMs?: number;
  meta?: Record<string, unknown>;
  isNewSession?: boolean;
}

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export interface ParsedUA {
  deviceType: DeviceType;
  browser: string;
  os: string;
}
