import Link from "next/link";
import { Ornament } from "./Ornament";
import { CookieSettingsLink } from "./CookieSettingsLink";
import { siteConfig } from "@/lib/siteConfig";

export function Footer() {
  return (
    <footer className="relative bg-wood text-paper overflow-hidden">
      {/* Gold-Hairline am Top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent" />

      <div className="container-wide pt-20 pb-12 relative">
        <Ornament tone="gold" />
        <h3
          className="mt-7 text-center font-serif text-4xl sm:text-5xl text-paper tracking-tight"
          style={{ fontWeight: 700 }}
        >
          {siteConfig.name}
        </h3>
        <p className="mt-4 text-center label-bright">{siteConfig.tagline}</p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-12 text-[0.97rem]">
          {/* === ADRESSE === */}
          <div>
            <h4 className="label-bright mb-5 pb-3 relative">
              Adresse
              <span className="absolute left-0 bottom-0 w-12 h-px bg-gold-soft" />
            </h4>
            <address
              className="not-italic leading-relaxed text-paper"
              style={{ fontWeight: 400 }}
            >
              {siteConfig.address.street}
              <br />
              {siteConfig.address.zip} {siteConfig.address.city}
              <br />
              {siteConfig.address.country}
            </address>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `${siteConfig.address.street}, ${siteConfig.address.zip} ${siteConfig.address.city}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="link-vintage mt-5 inline-block text-gold-soft font-sans font-semibold tracking-wide text-sm"
            >
              Anfahrt planen →
            </a>
          </div>

          {/* === RESERVIERUNG === */}
          <div>
            <h4 className="label-bright mb-5 pb-3 relative">
              Reservierung
              <span className="absolute left-0 bottom-0 w-12 h-px bg-gold-soft" />
            </h4>
            <p className="text-paper" style={{ fontWeight: 400 }}>
              Telefon:{" "}
              <a
                href={`tel:${siteConfig.phoneHref}`}
                className="link-vintage text-gold-soft font-serif"
                style={{ fontWeight: 600 }}
              >
                {siteConfig.phone}
              </a>
            </p>
            <p className="mt-2 text-paper" style={{ fontWeight: 400 }}>
              Instagram:{" "}
              <a
                href={siteConfig.instagram.url}
                target="_blank"
                rel="noreferrer"
                className="link-vintage text-gold-soft font-serif"
                style={{ fontWeight: 600 }}
              >
                {siteConfig.instagram.handle}
              </a>
            </p>
            <p
              className="mt-4 text-cream-soft leading-relaxed text-sm"
              style={{ fontWeight: 400 }}
            >
              Für Feierlichkeiten und Gruppen ab 10 Personen empfehlen wir eine
              Reservierung im Voraus.
            </p>
          </div>

          {/* === ÖFFNUNGSZEITEN === */}
          <div>
            <h4 className="label-bright mb-5 pb-3 relative">
              Öffnungszeiten
              <span className="absolute left-0 bottom-0 w-12 h-px bg-gold-soft" />
            </h4>
            <ul className="space-y-2">
              {siteConfig.hours.map((h) => (
                <li
                  key={h.day}
                  className="flex justify-between gap-4 border-b border-paper/15 pb-2 text-paper"
                  style={{ fontWeight: 400 }}
                >
                  <span>{h.day}</span>
                  <span
                    className="text-gold-soft font-serif tabular-nums"
                    style={{ fontWeight: 600 }}
                  >
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-paper/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-soft">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte
            vorbehalten.
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            <Link href="/impressum" className="link-vintage hover:text-paper">
              Impressum
            </Link>
            <Link href="/datenschutz" className="link-vintage hover:text-paper">
              Datenschutz
            </Link>
            <CookieSettingsLink className="link-vintage hover:text-paper">
              Cookie-Einstellungen
            </CookieSettingsLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
