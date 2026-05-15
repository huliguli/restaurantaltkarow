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
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
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
