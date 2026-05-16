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
              4. Google Analytics 4 (mit Ihrer Einwilligung)
            </h2>
            <p className="mt-3">
              Wenn Sie im Cookie-Banner der Kategorie „Anonyme Statistik"
              zustimmen, setzen wir <strong>Google Analytics 4 (GA4)</strong> ein,
              einen Webanalysedienst der Google Ireland Limited, Gordon House,
              Barrow Street, Dublin 4, Irland („Google").
            </p>

            <h3 className="mt-4 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Welche Daten werden verarbeitet?
            </h3>
            <ul className="mt-3 list-disc list-outside pl-6 space-y-1.5">
              <li>Aufgerufene Seiten und Zeitpunkt</li>
              <li>Verweildauer und Scrolltiefe</li>
              <li>Klicks auf Buttons, Telefonnummer-Links, Social-Media-Links, PDF-Downloads</li>
              <li>Formularinteraktionen (Start, Versand, Erfolg, Fehler) für Reservierung, Kontaktformular und Buffet-Konfiguratoren</li>
              <li>Geräte- und Browserinformationen (Typ, Auflösungsklasse, Sprache)</li>
              <li>Ungefährer Standort (Land/Region, NICHT Stadt-Ebene, da IP-Anonymisierung aktiv)</li>
              <li>Herkunft der Sitzung (Referrer)</li>
            </ul>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Konfiguration (technische Maßnahmen)
            </h3>
            <ul className="mt-3 list-disc list-outside pl-6 space-y-1.5">
              <li><strong>IP-Anonymisierung</strong> ist aktiviert (<code>anonymize_ip: true</code>) — Ihre IP wird vor der Speicherung gekürzt.</li>
              <li><strong>Google-Signale</strong> (geräteübergreifendes Tracking) sind deaktiviert.</li>
              <li><strong>Personalisierung von Werbung</strong> ist deaktiviert.</li>
              <li>GA4 lädt erst <strong>nach</strong> Ihrer aktiven Zustimmung — vorher wird kein gtag.js-Skript ausgeführt.</li>
            </ul>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Zweck der Verarbeitung
            </h3>
            <p className="mt-3">
              Aggregierte Auswertung der Nutzung unserer Website, um Inhalte,
              Performance und Bedienbarkeit kontinuierlich zu verbessern.
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
              Datenübermittlung in Drittländer
            </h3>
            <p className="mt-3">
              Google verarbeitet die Daten primär auf Servern innerhalb der EU.
              Eine Übermittlung in die USA kann nicht ausgeschlossen werden.
              Google ist nach dem EU-US Data Privacy Framework zertifiziert,
              wodurch ein angemessenes Datenschutzniveau gewährleistet wird
              (Angemessenheitsbeschluss der EU-Kommission vom 10.07.2023).
              Soweit Daten dennoch außerhalb des EU-DPF übermittelt werden,
              stützen wir uns auf Standardvertragsklauseln gemäß Art. 46 Abs. 2
              DSGVO.
            </p>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Speicherdauer
            </h3>
            <p className="mt-3">
              GA4-Ereignisdaten werden in unserem Konto auf eine Aufbewahrungsdauer
              von <strong>2 Monaten</strong> konfiguriert (Standardminimum). Nach
              Ablauf dieser Frist werden ereignisbezogene Daten automatisch
              gelöscht. Aggregierte Berichte können darüber hinaus erhalten bleiben.
            </p>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Widerruf
            </h3>
            <p className="mt-3">
              Sie können Ihre Einwilligung jederzeit widerrufen — entweder über
              die <CookieSettingsLink className="link-vintage text-burgundy" /> in
              dieser Erklärung bzw. im Footer, oder indem Sie Cookies und
              localStorage für diese Domain in Ihrem Browser löschen. Nach
              Widerruf wird GA4 nicht mehr geladen.
            </p>

            <h3 className="mt-5 font-serif text-lg text-ink-strong" style={{ fontWeight: 600 }}>
              Weitere Informationen
            </h3>
            <p className="mt-3">
              Datenschutzerklärung von Google:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="link-vintage text-burgundy"
              >
                policies.google.com/privacy
              </a>
              .
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
