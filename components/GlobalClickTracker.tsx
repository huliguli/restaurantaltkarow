"use client";

import { useEffect } from "react";
import { events } from "@/lib/analytics-events";

/**
 * Event-Delegation für alle Klicks im Body.
 *
 *  - `data-track="cta_id"` auf einem Element → cta_click mit der ID
 *  - tel:-Link    → outbound_click(kind=phone)
 *  - mailto:-Link → outbound_click(kind=email)
 *  - instagram    → outbound_click(kind=instagram)
 *  - maps         → outbound_click(kind=maps)
 *  - PDF/Download → cta_click(`pdf:filename`)
 *  - andere externe Links → outbound_click(kind=external)
 */
export function GlobalClickTracker() {
  useEffect(() => {
    const ownHost = window.location.hostname;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const trackableEl = target.closest("[data-track]") as HTMLElement | null;
      const link = target.closest("a") as HTMLAnchorElement | null;

      if (trackableEl?.dataset.track) {
        events.ctaClick(trackableEl.dataset.track);
      }

      if (!link) return;
      const href = link.getAttribute("href");
      if (!href) return;

      if (href.startsWith("tel:")) {
        events.outboundClick(href.replace("tel:", "").slice(0, 40), "phone");
        return;
      }
      if (href.startsWith("mailto:")) {
        events.outboundClick(
          href.replace("mailto:", "").split("?")[0].slice(0, 60),
          "email",
        );
        return;
      }

      if (href.toLowerCase().endsWith(".pdf") || link.hasAttribute("download")) {
        const file = href.split("/").pop() ?? href;
        events.ctaClick(`pdf:${file.slice(0, 50)}`);
      }

      let externalHost: string | null = null;
      try {
        const url = new URL(href, window.location.origin);
        if (url.hostname && url.hostname !== ownHost) {
          externalHost = url.hostname.toLowerCase();
        }
      } catch {
        /* relative */
      }

      if (externalHost) {
        if (externalHost.includes("instagram.com")) {
          events.outboundClick(externalHost, "instagram");
        } else if (
          externalHost.includes("google.com") &&
          href.includes("maps")
        ) {
          events.outboundClick(externalHost, "maps");
        } else if (externalHost.includes("openstreetmap")) {
          events.outboundClick(externalHost, "maps");
        } else {
          events.outboundClick(externalHost, "external");
        }
      }
    };

    document.addEventListener("click", handler, { capture: true });
    return () =>
      document.removeEventListener("click", handler, { capture: true });
  }, []);

  return null;
}
