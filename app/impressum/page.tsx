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
          <p className="text-ink-soft italic border-l-2 border-gold pl-5 py-1">
            Hinweis: Die folgenden Angaben sind Platzhalter und müssen vor
            Veröffentlichung durch den Betreiber finalisiert werden (insbesondere
            verantwortliche Person, USt-IdNr., Aufsichtsbehörde).
          </p>

          <div>
            <h2 className="font-serif text-2xl text-ink">
              Angaben gemäß § 5 DDG
            </h2>
            <p className="mt-3">
              {siteConfig.name}
              <br />
              {siteConfig.address.street}
              <br />
              {siteConfig.address.zip} {siteConfig.address.city}
              <br />
              {siteConfig.address.country}
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">Kontakt</h2>
            <p className="mt-3">
              Telefon: {siteConfig.phone}
              <br />
              Instagram: {siteConfig.instagram.handle}
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">
              Verantwortlich für den Inhalt
            </h2>
            <p className="mt-3">[Name der Geschäftsleitung einfügen]</p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">
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
              Streit­beilegungs­verfahren vor einer Verbraucher­schlichtungsstelle
              teilzunehmen.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">Haftungshinweis</h2>
            <p className="mt-3">
              Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              können wir jedoch keine Gewähr übernehmen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
