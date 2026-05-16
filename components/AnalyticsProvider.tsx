"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  CONSENT_EVENT,
  readConsent,
} from "@/lib/cookie-consent";
import { events, getOrCreateSessionId } from "@/lib/analytics-events";

/**
 * Self-hosted Analytics-Provider — kein externer Service.
 *
 * - Wartet auf Consent (analytics).
 * - Beim ersten Consent: feuert session_start mit Referrer.
 * - Bei jedem Pathname-Change: feuert pageview.
 *
 * Tracking-Endpoint: POST /api/analytics/track
 * Daten landen in der lokalen SQLite-DB.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    function maybeTrack() {
      const c = readConsent();
      if (!c?.categories.analytics) return;

      // Session_start einmal pro Tab
      if (!sessionStartedRef.current) {
        const { isNew } = getOrCreateSessionId();
        if (isNew) {
          events.sessionStart(
            typeof document !== "undefined" ? document.referrer : undefined,
          );
        }
        sessionStartedRef.current = true;
      }

      // Pageview nur, wenn pathname sich geändert hat (vermeidet Doppel-Events)
      if (pathname && pathname !== lastTrackedPathRef.current) {
        lastTrackedPathRef.current = pathname;
        events.pageView();
      }
    }

    maybeTrack();
    window.addEventListener(CONSENT_EVENT, maybeTrack);
    return () => window.removeEventListener(CONSENT_EVENT, maybeTrack);
  }, [pathname]);

  return null;
}
