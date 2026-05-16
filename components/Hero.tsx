import Image from "next/image";
import Link from "next/link";
import { Ornament } from "./Ornament";
import { siteConfig } from "@/lib/siteConfig";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] flex items-center justify-center overflow-hidden">
      <Image
        src="/images/aussenansicht.avif"
        alt="Restaurant Alt-Karow von außen"
        fill
        priority
        sizes="100vw"
        quality={92}
        className="object-cover -z-10 scale-105"
      />

      {/* Mehrlagiges Overlay — Hauptkontrast-Layer für Hero-Text */}
      <div className="absolute inset-0 -z-10 hero-vignette" />

      {/* Zusätzlicher dunkler Multiply-Layer — bringt Bild auf einheitlich
          dunkles Fundament, egal wo Hell-/Dunkelstellen im Foto sind */}
      <div className="absolute inset-0 -z-10 bg-black/35 mix-blend-multiply" />

      {/* Gezielter Kontrastbalken hinter dem Headline-Bereich */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[55%] -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
        }}
      />

      <div className="container-prose text-center pt-32 pb-20 relative z-10">
        <p className="label-bright text-shadow-strong">Berlin · Alt-Karow</p>

        <h1
          className="mt-7 text-display text-paper text-5xl sm:text-6xl md:text-[5rem] lg:text-[5.75rem] text-shadow-strong"
          style={{ fontWeight: 700 }}
        >
          {siteConfig.tagline}
        </h1>

        <div className="mt-10 flex justify-center">
          <Ornament tone="cream" />
        </div>

        <p
          className="mt-8 mx-auto max-w-2xl text-lg sm:text-xl text-paper leading-relaxed text-shadow-strong"
          style={{ fontWeight: 400 }}
        >
          Deutsche Küche mit osteuropäischer Seele — hausgemacht, herzlich
          serviert, in einer Atmosphäre, die wie ein Wiedersehen mit alten
          Freunden wirkt.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`tel:${siteConfig.phoneHref}`}
            className="btn btn-cream"
            data-track="reserve_hero_phone"
          >
            Tisch reservieren
          </a>
          <Link
            href="/speisekarte"
            className="btn btn-outline-light"
            data-track="menu_hero"
          >
            Zur Speisekarte
          </Link>
        </div>

        <p
          className="mt-10 text-[0.95rem] text-paper/95 font-sans tracking-wide text-shadow-strong"
          style={{ fontWeight: 500 }}
        >
          Mittwoch – Samstag · 12:00 – 22:00 &nbsp;·&nbsp; Sonntag · 12:00 –
          18:00
        </p>
      </div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-paper/85 text-[0.65rem] tracking-[0.4em] uppercase animate-float-soft font-sans font-semibold text-shadow-strong">
        ↓ Entdecken
      </div>
    </section>
  );
}
