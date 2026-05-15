import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { OpeningHours } from "@/components/OpeningHours";
import { Ornament } from "@/components/Ornament";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Kontakt & Anfahrt",
  description:
    "Restaurant Alt-Karow, Alt-Karow 2, 13125 Berlin. Reservierungen unter +49 30 94209445. Anfahrt mit öffentlichen Verkehrsmitteln und PKW.",
};

const mapsQuery = encodeURIComponent(
  `${siteConfig.address.street}, ${siteConfig.address.zip} ${siteConfig.address.city}`,
);

export default function KontaktPage() {
  return (
    <>
      <section className="section pt-44 bg-paper">
        <div className="container-prose text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Kontakt"
              title="So erreichen Sie uns"
              description="Wir freuen uns auf Ihren Anruf, Ihre Nachricht oder Ihren spontanen Besuch."
            />
          </Reveal>
        </div>
      </section>

      <section className="section pt-0 bg-paper">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Reveal>
            <div className="card-elevated p-10 sm:p-12 corner-decor h-full">
              <h3
                className="font-serif text-2xl text-ink-strong"
                style={{ fontWeight: 600 }}
              >
                Adresse
              </h3>
              <address className="not-italic mt-4 text-lg leading-relaxed text-ink">
                {siteConfig.address.street}
                <br />
                {siteConfig.address.zip} {siteConfig.address.city}
                <br />
                {siteConfig.address.country}
              </address>

              <Ornament className="my-10" />

              <h3
                className="font-serif text-2xl text-ink-strong"
                style={{ fontWeight: 600 }}
              >
                Telefon
              </h3>
              <p className="mt-4 text-lg">
                <a
                  href={`tel:${siteConfig.phoneHref}`}
                  className="link-vintage text-burgundy font-serif text-xl"
                >
                  {siteConfig.phone}
                </a>
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Reservierungen, Anfragen für Veranstaltungen, allgemeine
                Auskünfte.
              </p>

              <Ornament className="my-10" />

              <h3
                className="font-serif text-2xl text-ink-strong"
                style={{ fontWeight: 600 }}
              >
                Instagram
              </h3>
              <p className="mt-4 text-lg">
                <a
                  href={siteConfig.instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  className="link-vintage text-burgundy font-serif"
                >
                  {siteConfig.instagram.handle}
                </a>
              </p>
              <p className="mt-2 text-sm text-muted italic">
                Einblicke aus der Küche, aktuelle Empfehlungen, kleine
                Neuigkeiten.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="h-full flex flex-col">
              <h3
                className="font-serif text-2xl text-ink-strong mb-6"
                style={{ fontWeight: 600 }}
              >
                Öffnungszeiten
              </h3>
              <div className="bg-paper-deep/50 border border-ink/10 p-8 sm:p-10">
                <OpeningHours />
              </div>
              <p className="mt-6 text-sm text-ink-soft italic">
                Bei Veranstaltungen können die Zeiten abweichen. Wir empfehlen
                für den Wochenend-Abend eine Reservierung im Voraus.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* KONTAKTFORMULAR */}
      <section className="section bg-paper-deep/40 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="container-wide relative">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="eyebrow">Nachricht senden</p>
              <h2
                className="mt-3 font-serif text-3xl sm:text-4xl text-ink-strong"
                style={{ fontWeight: 700 }}
              >
                Schreiben Sie uns direkt
              </h2>
              <div className="mt-6 flex justify-center">
                <Ornament />
              </div>
              <p className="mt-7 text-ink leading-relaxed">
                Eilige Reservierungen am besten telefonisch — für alles andere
                freuen wir uns über Ihre Nachricht. Wir antworten in der Regel
                innerhalb eines Werktages.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="max-w-3xl mx-auto bg-paper p-8 sm:p-12 border border-ink/10 shadow-soft">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ANFAHRT */}
      <section className="section bg-cream-deep relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
        <div className="container-wide relative">
          <Reveal>
            <SectionHeading
              eyebrow="Anfahrt"
              title="So finden Sie uns"
              description="Mitten in Alt-Karow, gut erreichbar mit S-Bahn und Auto."
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Mit der S-Bahn",
                body: "S2 bis Berlin-Karow. Vom Bahnhof gemütliche 4 – 5 Minuten zu Fuß bis zu unserem Haus.",
              },
              {
                title: "Mit dem Auto",
                body: "Parkplätze auf der Straße sind in der Regel direkt vor dem Haus vorhanden — gebührenfrei.",
              },
              {
                title: "Mit dem Bus",
                body: "Buslinien 154 und 158 halten in unmittelbarer Nähe — Haltestelle „Alt-Karow“.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="card-elevated p-9 h-full">
                  <h3
                    className="font-serif text-xl text-ink-strong"
                    style={{ fontWeight: 600 }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-4 text-ink leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-14 text-center">
            <a
              href={`https://maps.google.com/?q=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              In Google Maps öffnen
            </a>
          </Reveal>
        </div>
      </section>

      {/* EINGEBETTETE KARTE */}
      <section className="bg-paper pb-0">
        <div className="w-full h-[420px] sm:h-[520px] relative overflow-hidden border-t border-ink/10">
          <iframe
            title="Standort Restaurant Alt-Karow auf der Karte"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=13.488%2C52.621%2C13.508%2C52.629&layer=mapnik&marker=52.625%2C13.498`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale-[35%]"
          />
        </div>
      </section>
    </>
  );
}
