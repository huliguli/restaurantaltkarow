import { Ornament } from "./Ornament";
import { siteConfig } from "@/lib/siteConfig";

export function ReservationCTA() {
  return (
    <section className="section bg-burgundy text-paper relative overflow-hidden">
      {/* Dezente Vignette + Lichtakzent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-55"
        style={{
          background:
            "radial-gradient(circle at 70% 20%, rgba(216,185,116,0.28), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(0,0,0,0.6), transparent 55%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-soft/45 to-transparent" />

      <div className="container-prose text-center relative z-10">
        <p className="label-bright text-shadow-strong">Reservierung</p>
        <h2
          className="mt-5 text-display text-4xl sm:text-5xl md:text-[3.5rem] text-paper"
          style={{ fontWeight: 700, textShadow: "0 3px 18px rgba(0,0,0,0.4)" }}
        >
          Ein Platz für Sie an unserer Tafel
        </h2>
        <div className="mt-7 flex justify-center">
          <Ornament tone="cream" />
        </div>
        <p
          className="mt-8 text-lg leading-relaxed text-paper max-w-xl mx-auto"
          style={{ fontWeight: 400, textShadow: "0 2px 14px rgba(0,0,0,0.35)" }}
        >
          Wir empfehlen eine Reservierung — besonders an Wochenenden und für
          Gruppen. Rufen Sie uns an, wir freuen uns auf Ihren Besuch.
        </p>
        <div className="mt-11 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`tel:${siteConfig.phoneHref}`}
            className="btn btn-cream"
            data-track="reserve_cta_phone"
          >
            {siteConfig.phone}
          </a>
          <a
            href={siteConfig.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-light"
            data-track="instagram_cta"
          >
            Auf Instagram folgen
          </a>
        </div>
      </div>
    </section>
  );
}
