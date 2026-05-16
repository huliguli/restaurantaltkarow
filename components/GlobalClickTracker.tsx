"use client";

import { useEffect } from "react";
import { events } from "@/lib/analytics-events";

/**
 * Globaler Click-Listener — fängt per Event-Delegation alle <a>-Klicks ab
 * und feuert je nach Linktyp das passende Analytics-Event.
 *
 * Vorteile:
 *  - Single Source of Truth fürs Outbound-Tracking
 *  - keine onClick-Spaghetti in jeder Komponente
 *  - neue Links werden automatisch mitgetrackt (z. B. wenn eine neue
 *    Telefon-Verlinkung später irgendwo eingefügt wird)
 *
 * Zusätzliche Event-Quellen:
 *  - `data-track="cta_label"` auf einem Element → cta_click mit Label
 *  - PDF-Downloads → pdf_download (auto-detected via .pdf-Pfad)
 */
export function GlobalClickTracker() {
  useEffect(() => {
    const ownHost = window.location.hostname;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest("a") as HTMLAnchorElement | null;
      const trackableEl = target.closest("[data-track]") as HTMLElement | null;
      const location = window.location.pathname;

      // 1) Data-Track-Attribut auf beliebigen Elementen
      if (trackableEl) {
        const label = trackableEl.dataset.track;
        if (label) events.cta(label, location);
      }

      if (!link) return;
      const href = link.getAttribute("href");
      if (!href) return;

      if (href.startsWith("tel:")) {
        events.phoneClick(location);
        return;
      }
      if (href.startsWith("mailto:")) {
        events.emailClick(location);
        return;
      }

      // PDF-Download
      if (
        href.toLowerCase().endsWith(".pdf") ||
        link.hasAttribute("download")
      ) {
        const file = href.split("/").pop() ?? href;
        events.pdfDownload(file, location);
        // weiterlaufen — könnte auch external sein
      }

      // Externe Links (inkl. Maps, Instagram)
      let externalHost: string | null = null;
      try {
        const url = new URL(href, window.location.origin);
        if (url.hostname && url.hostname !== ownHost) {
          externalHost = url.hostname.toLowerCase();
        }
      } catch {
        /* relative URL — kein external */
      }

      if (externalHost) {
        if (externalHost.includes("instagram.com")) {
          events.instagramClick(location);
        } else if (
          externalHost.includes("google.com") &&
          href.includes("maps")
        ) {
          events.mapsClick(location);
        } else if (
          externalHost.includes("openstreetmap") ||
          externalHost.includes("maps")
        ) {
          events.mapsClick(location);
        } else {
          events.externalLinkClick(externalHost, location);
        }
      }
    };

    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, []);

  return null;
}
