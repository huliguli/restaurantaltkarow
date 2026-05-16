import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";
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
            Stand: Mai 2026. Diese Datenschutzerklärung beschreibt, welche
            personenbezogenen Daten wir bei einem Besuch unserer Website
            verarbeiten, zu welchem Zweck, auf welcher Rechtsgrundlage und
            welche Rechte Sie als betroffene Person haben.
          </p>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              1. Verantwortlicher
            </h2>
            <p className="mt-3">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              <br />
              Mijorent GmbH
              <br />
              Vertreten durch: Michael Durnovtsev
              <br />
              Mahlsdorfer Straße 61b, 15366 Hoppegarten
              <br />
              Telefon: {siteConfig.phone}
              <br />
              Handelsregister: HRB 21236 FF, Amtsgericht Frankfurt (Oder)
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              2. Erhebung technischer Zugriffsdaten (Server-Logs)
            </h2>
            <p className="mt-3">
              Bei jedem Aufruf unserer Website erfasst unser Hosting-Server
              automatisch technische Informationen wie anonymisierte IP-Adresse,
              Datum und Uhrzeit der Anfrage, aufgerufene Seite, Browser- und
              Betriebssystemtyp sowie Referrer.
            </p>
            <p className="mt-3">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse am sicheren und stabilen Betrieb der
              Website, Schutz vor Missbrauch).
              <br />
              <strong>Speicherdauer:</strong> 7 Tage, danach automatische Löschung.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              3. Cookies & lokale Speicherung
            </h2>
            <p className="mt-3">
              Wir setzen ausschließlich <strong>technisch notwendige</strong> Cookies
              und ähnliche Technologien ein, die für den Betrieb der Seite
              erforderlich sind — z. B. zur Speicherung Ihrer Cookie-Auswahl
              (im Browser-localStorage) oder für die Sitzungsverwaltung im
              Admin-Bereich. Tracking-Cookies werden ohne Ihre Einwilligung{" "}
              <strong>nicht</strong> gesetzt.
            </p>
            <p className="mt-3 text-sm">
              <strong>Rechtsgrundlage technisch notwendige Cookies:</strong> § 25
              Abs. 2 Nr. 2 TTDSG, Art. 6 Abs. 1 lit. f DSGVO.
            </p>
            <p className="mt-3">
              Sie können Ihre Cookie-Einstellungen jederzeit ändern:{" "}
              <CookieSettingsLink className="link-vintage text-burgundy" />
              .
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              4. Eigene Webanalyse (selbst gehostet, mit Ihrer Einwilligung)
            </h2>
            <p className="mt-3">
              Wenn Sie im Cookie-Banner der Kategorie „Anonyme Statistik"
              zustimmen, erfassen wir aggregierte Nutzungsdaten dieser Website.
              Es kommt <strong>kein externer Anbieter</strong> wie Google
              Analytics, Matomo oder ähnliche zum Einsatz. Die Verarbeitung
              findet ausschließlich auf unserem eigenen Server statt; es werden
              keine Daten an Dritte weitergegeben und keine Daten in Drittländer
              übermittelt.
            </p>

            <h3 className="mt-4 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Welche Daten werden verarbeitet?
            </h3>
            <ul className="mt-3 list-disc list-outside pl-6 space-y-1.5">
              <li>Aufgerufene Seiten und Zeitpunkt der Zugriffe</li>
              <li>Sitzungsdauer und Scrolltiefe (25 / 50 / 75 / 100 %)</li>
              <li>Klicks auf Buttons, Telefonnummer-Links, Social-Media-Links, PDF-Downloads</li>
              <li>Formularinteraktionen (Start, Versand, Abbruch) für Reservierung, Kontaktformular und Buffet-Konfiguratoren</li>
              <li>Geräteklasse (Mobile / Tablet / Desktop), Browser-Familie, Betriebssystem-Familie</li>
              <li>Bevorzugte Browsersprache (z. B. „de"), Länderkennung sofern vom Reverse-Proxy übermittelt</li>
              <li>Verweis-Domain (Referrer) — ohne Pfad oder Query-Parameter</li>
            </ul>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Technische Maßnahmen
            </h3>
            <ul className="mt-3 list-disc list-outside pl-6 space-y-1.5">
              <li>
                Ihre IP-Adresse wird <strong>niemals roh gespeichert</strong>.
                Stattdessen wird sie mit einem geheimen, täglich rotierenden
                Server-Salt zu einer 24-stelligen Hash-Kennung verrechnet
                (SHA-256), die <strong>tagesgebunden</strong> ist und keine
                tageübergreifende Verfolgung ermöglicht.
              </li>
              <li>
                Auswertungen erfolgen ausschließlich aggregiert (Summen, Top-
                Listen, Durchschnitte). Es findet kein Profil-Tracking statt.
              </li>
              <li>
                Es werden <strong>keine Tracking-Cookies</strong> gesetzt.
                Lediglich eine sitzungsbezogene ID wird im Browser-Speicher
                (<code>sessionStorage</code>) Ihres Tabs gehalten, um eine
                Sitzung zusammenhängend auswerten zu können.
              </li>
              <li>
                Die Auswertung lädt erst <strong>nach Ihrer aktiven
                Einwilligung</strong>. Ohne Einwilligung wird kein Tracking-
                Skript aktiv.
              </li>
            </ul>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Zweck der Verarbeitung
            </h3>
            <p className="mt-3">
              Aggregierte Auswertung der Nutzung dieser Website (welche Inhalte
              werden besucht, wie schnell finden Gäste die gesuchten
              Informationen), um Inhalte, Performance und Bedienbarkeit
              kontinuierlich zu verbessern.
            </p>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Rechtsgrundlage
            </h3>
            <p className="mt-3">
              <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung) sowie{" "}
              <strong>§ 25 Abs. 1 TTDSG</strong> für die Speicherung von
              Informationen auf Ihrem Endgerät bzw. den Zugriff darauf. Sie
              können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft
              widerrufen.
            </p>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Empfänger / Auftragsverarbeiter
            </h3>
            <p className="mt-3">
              <strong>Keine.</strong> Sämtliche Analyse-Daten werden auf einem
              Server in Deutschland verarbeitet, der ausschließlich von uns
              betrieben wird. Es findet keine Übermittlung an Dritte und keine
              Drittlandübermittlung statt.
            </p>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Speicherdauer
            </h3>
            <p className="mt-3">
              Roh-Events werden für maximal <strong>90 Tage</strong> aufbewahrt
              und danach automatisch gelöscht. Aggregierte Auswertungen können
              darüber hinaus zu statistischen Zwecken erhalten bleiben — diese
              enthalten dann keinerlei Bezug zu einzelnen Sitzungen mehr.
            </p>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Widerruf
            </h3>
            <p className="mt-3">
              Sie können Ihre Einwilligung jederzeit widerrufen — entweder über
              die <CookieSettingsLink className="link-vintage text-burgundy" /> in
              dieser Erklärung bzw. im Footer, oder indem Sie den{" "}
              <code>localStorage</code> für diese Domain in Ihrem Browser
              löschen. Nach Widerruf wird kein weiterer Event mehr versendet.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              5. Eingebettete Karte (OpenStreetMap)
            </h2>
            <p className="mt-3">
              Auf der Kontaktseite betten wir eine Karte von OpenStreetMap ein.
              Beim Aufruf werden technisch erforderliche Daten (u. a. IP-Adresse)
              an OpenStreetMap übertragen. Details:{" "}
              <a
                href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
                target="_blank"
                rel="noreferrer"
                className="link-vintage text-burgundy"
              >
                Datenschutzerklärung der OpenStreetMap Foundation
              </a>
              .
            </p>
            <p className="mt-3 text-sm">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an der Bereitstellung einer Anfahrtshilfe).
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              6. Reservierungen, Kontakt- und Buffetformulare
            </h2>
            <p className="mt-3">
              Wenn Sie eine Reservierung anfragen, das Kontaktformular nutzen
              oder eine Buffet-Konfiguration einreichen, verarbeiten wir die von
              Ihnen angegebenen Daten (Name, E-Mail, Telefon, ggf. Anlass,
              Personenzahl, Datum, Bemerkungen, Buffet-Auswahl) zur Bearbeitung
              Ihrer Anfrage.
            </p>
            <p className="mt-3">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
              (vorvertragliche Maßnahmen bzw. Vertragsanbahnung).
              <br />
              <strong>Speicherdauer:</strong> Reservierungen werden bis zu 12
              Monate nach Veranstaltungstermin aufbewahrt (interne Statistik,
              Wiedererkennung Stammgäste), danach gelöscht. Bei Buchhaltungs- und
              Aufbewahrungspflichten gelten gesetzliche Fristen (i. d. R. 10
              Jahre für umsatzsteuerrelevante Vorgänge).
              <br />
              <strong>Empfänger:</strong> ausschließlich wir selbst. Die
              E-Mail-Zustellung erfolgt über unseren Mailprovider Strato AG,
              Pascalstraße 10, 10587 Berlin.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              7. Ihre Rechte als betroffene Person
            </h2>
            <p className="mt-3">
              Sie haben unter den Voraussetzungen der Art. 15 ff. DSGVO folgende
              Rechte:
            </p>
            <ul className="mt-3 list-disc list-outside pl-6 space-y-1">
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch (Art. 21 DSGVO)</li>
              <li>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
              <li>
                Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO) — in
                Berlin: Berliner Beauftragte für Datenschutz und
                Informationsfreiheit, Friedrichstr. 219, 10969 Berlin.
              </li>
            </ul>
            <p className="mt-3">
              Anfragen bitte schriftlich oder per E-Mail an die unter Punkt 1
              genannten Kontaktdaten.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink-strong" style={{ fontWeight: 700 }}>
              8. Aktualität dieser Erklärung
            </h2>
            <p className="mt-3">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn
              sich die Rechtslage ändert oder bei Änderungen unserer Dienste.
              Die jeweils aktuelle Fassung ist unter dieser URL abrufbar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
