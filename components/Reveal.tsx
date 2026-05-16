"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Distance to translate from on enter. Defaults to 28px. */
  offset?: number;
};

/**
 * Sanftes Fade-up beim ersten Sichtbarwerden im Viewport.
 * Respektiert prefers-reduced-motion. Einmaliger Trigger — kein erneutes
 * Verschwinden beim Scrollen nach oben.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  offset = 28,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      // threshold: 0 → triggert sobald 1 px sichtbar ist.
      // Für sehr lange Elemente (z. B. Speisekarte mit allen Sektionen) wäre
      // ein höherer Threshold nie erreichbar gewesen, weil das Element
      // nicht zu 10 % in den Viewport passt → opacity:0 blieb hängen.
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );

    io.observe(el);

    // Failsafe: wenn der Observer aus irgendeinem Grund nach 1.5 s nicht
    // gefeuert hat (z. B. wegen scroll-margin / Anker-Sprung außerhalb des
    // beobachteten Bereichs), zeigen wir den Inhalt trotzdem an.
    const failsafe = window.setTimeout(() => {
      setVisible(true);
      io.disconnect();
    }, 1500);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
        transform: visible ? "translateY(0)" : `translateY(${offset}px)`,
        opacity: visible ? 1 : 0,
      }}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${className}`}
    >
      {children}
    </div>
  );
}
