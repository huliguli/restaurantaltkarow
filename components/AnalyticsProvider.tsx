"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  readConsent,
  type ConsentState,
} from "@/lib/cookie-consent";
import { events } from "@/lib/analytics-events";

/**
 * GA4-Loader.
 * - Holt die Measurement-ID einmalig vom Server (DB-Setting, vom Admin verwaltet).
 * - Lädt gtag.js NUR wenn Consent gegeben UND ID konfiguriert ist.
 * - Reagiert dynamisch auf Consent-Änderungen (Banner schließen → loaded; Widerruf → loaded bleibt, kein neuer Push).
 * - Sendet bei jeder Route-Änderung einen page_view (Standard-page_view deaktiviert, weil Next.js Client-Side-Navigation kein Reload auslöst).
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const [measurementId, setMeasurementId] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentState | null>(null);

  // Einmaliger Fetch der GA-ID vom Server
  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings/ga", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data.id === "string" && data.id.length > 0) {
          setMeasurementId(data.id);
        }
      })
      .catch(() => {
        /* nicht kritisch — ohne ID einfach kein Tracking */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Consent-State live verfolgen
  useEffect(() => {
    const update = () => setConsent(readConsent());
    update();
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);

  const consented = consent?.categories.analytics === true;
  const enabled = !!measurementId && consented;

  // SPA-Pageviews
  useEffect(() => {
    if (!enabled || !pathname) return;
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;
    events.pageView(pathname, document.title);
  }, [pathname, enabled]);

  if (!enabled) return null;

  return (
    <>
      <Script
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted',
            functionality_storage: 'granted',
            security_storage: 'granted'
          });
          gtag('config', '${measurementId}', {
            anonymize_ip: true,
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
