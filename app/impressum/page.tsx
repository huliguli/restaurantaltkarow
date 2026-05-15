import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum des Restaurant Alt-Karow.",
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <section className="section pt-40 bg-paper">
      <div className="container-prose">
        <SectionHeading eyebrow="Rechtliches" title="Impressum" />

        <div className="prose mt-16 space-y-8 text-ink leading-relaxed">
          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Angaben gemäß § 5 DDG
            </h2>
            <p className="mt-3">
              Mijorent GmbH
              <br />
              Mahlsdorfer Straße 61b
              <br />
              15366 Hoppegarten
              <br />
              Deutschland
            </p>
            <p className="mt-3">
              <strong>Vertretungsberechtigter Geschäftsführer:</strong>
              <br />
              Michael Durnovtsev
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Handelsregister
            </h2>
            <p className="mt-3">
              Eingetragen im Handelsregister
              <br />
              Registergericht: Amtsgericht Frankfurt (Oder)
              <br />
              Registernummer: HRB 21236 FF
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Umsatzsteuer-ID
            </h2>
            <p className="mt-3">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
              auf Anfrage.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Kontakt
            </h2>
            <p className="mt-3">
              Restaurant Alt-Karow
              <br />
              {siteConfig.address.street}
              <br />
              {siteConfig.address.zip} {siteConfig.address.city}
              <br />
              Telefon:{" "}
              <a
                href={`tel:${siteConfig.phoneHref}`}
                className="link-vintage text-burgundy"
              >
                {siteConfig.phone}
              </a>
              <br />
              Instagram:{" "}
              <a
                href={siteConfig.instagram.url}
                target="_blank"
                rel="noreferrer"
                className="link-vintage text-burgundy"
              >
                {siteConfig.instagram.handle}
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p className="mt-3">
              Michael Durnovtsev
              <br />
              Mijorent GmbH
              <br />
              Mahlsdorfer Straße 61b, 15366 Hoppegarten
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Streitbeilegung
            </h2>
            <p className="mt-3">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noreferrer"
                className="link-vintage text-burgundy"
              >
                ec.europa.eu/consumers/odr
              </a>
              . Wir sind nicht bereit oder verpflichtet, an einem
              Streit­beilegungs­verfahren vor einer
              Verbraucher­schlichtungsstelle teilzunehmen.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Haftung für Inhalte
            </h2>
            <p className="mt-3">
              Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter
              sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen
              Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Haftung für Links
            </h2>
            <p className="mt-3">
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Für diese fremden
              Inhalte können wir keine Gewähr übernehmen. Für die Inhalte der
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
              der Seiten verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              Urheberrecht
            </h2>
            <p className="mt-3">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht.
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
