"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { events } from "@/lib/analytics-events";

const MILESTONES: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];

/**
 * Trackt Scroll-Tiefe pro Seite. Pro Schwelle (25/50/75/100 %) wird
 * exakt einmal ein scroll_depth-Event gefeuert. Bei Routenwechsel wird
 * der State zurückgesetzt.
 *
 * Effizient: nutzt passive scroll-Listener mit requestAnimationFrame-Throttle.
 */
export function ScrollDepthTracker() {
  const pathname = usePathname();
  const sentRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    sentRef.current = new Set();
    // initial check (manche Seiten sind kürzer als Viewport → 100 % sofort)
    measure();

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        measure();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    function measure() {
      const doc = document.documentElement;
      const viewport = window.innerHeight;
      const scrolled = window.scrollY + viewport;
      const total = doc.scrollHeight;
      if (total <= viewport) {
        // Seite passt komplett ins Fenster — voll erfasst
        markIfNew(100);
        return;
      }
      const percent = Math.min(100, Math.round((scrolled / total) * 100));
      for (const m of MILESTONES) {
        if (percent >= m) markIfNew(m);
      }
    }

    function markIfNew(percent: 25 | 50 | 75 | 100) {
      if (sentRef.current.has(percent)) return;
      sentRef.current.add(percent);
      events.scrollDepth(percent);
    }
  }, [pathname]);

  return null;
}
