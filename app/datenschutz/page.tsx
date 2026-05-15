import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung des Restaurant Alt-Karow.",
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return (
    <section className="section pt-40 bg-paper">
      <div className="container-prose">
        <SectionHeading eyebrow="Rechtliches" title="Datenschutzerklärung" />

        <div className="mt-16 space-y-8 text-ink leading-relaxed">
          <p className="text-ink-soft italic border-l-2 border-gold pl-5 py-1">
            Hinweis: Diese Datenschutzerklärung ist eine Grundvorlage und sollte
            vor Veröffentlichung durch eine fachkundige Person (Anwalt /
            Datenschutzbeauftragter) finalisiert werden.
          </p>

          <div>
            <h2 className="font-serif text-2xl text-ink">
              1. Verantwortlicher
            </h2>
            <p className="mt-3">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              <br />
              {siteConfig.name}
              <br />
              {siteConfig.address.street}, {siteConfig.address.zip}{" "}
              {siteConfig.address.city}
              <br />
              Telefon: {siteConfig.phone}
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">
              2. Erhebung von Zugriffsdaten
            </h2>
            <p className="mt-3">
              Bei jedem Besuch unserer Website erfasst unser Server automatisch
              technische Informationen wie IP-Adresse, Datum und Uhrzeit, die
              aufgerufene Seite, sowie Browser- und Betriebssystemtyp.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse am sicheren und stabilen Betrieb der Website).
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">3. Cookies</h2>
            <p className="mt-3">
              Diese Website setzt nur technisch notwendige Cookies ein, die für
              den Betrieb der Seite erforderlich sind. Tracking- oder
              Werbe-Cookies werden nicht verwendet.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">
              4. Externe Inhalte (Karte)
            </h2>
            <p className="mt-3">
              Auf der Kontakt­seite betten wir eine Karte von OpenStreetMap ein.
              Beim Aufruf werden Daten (u. a. IP-Adresse) an OpenStreetMap
              übertragen. Details:{" "}
              <a
                href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
                target="_blank"
                rel="noreferrer"
                className="link-vintage text-burgundy"
              >
                OpenStreetMap-Datenschutzerklärung
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">
              5. Reservierungen per Telefon
            </h2>
            <p className="mt-3">
              Telefonisch übermittelte Daten (Name, Datum, Personenzahl) werden
              ausschließlich zur Bearbeitung Ihrer Reservierung genutzt und
              nicht an Dritte weitergegeben.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">6. Ihre Rechte</h2>
            <p className="mt-3">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
              Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch
              sowie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
              beschweren.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">7. Kontakt</h2>
            <p className="mt-3">
              Bei Fragen zum Datenschutz erreichen Sie uns unter{" "}
              {siteConfig.phone}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
