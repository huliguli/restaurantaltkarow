import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Ornament } from "@/components/Ornament";
import { Reveal } from "@/components/Reveal";
import { ReservationForm } from "@/components/ReservationForm";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Tisch reservieren",
  description:
    "Reservieren Sie online einen Tisch im Restaurant Alt-Karow. Mi–So, 12:00 – 22:00 (So bis 18:00). Bestätigung per E-Mail.",
};

export default function ReservierenPage() {
  return (
    <>
      <section className="section pt-44 bg-paper">
        <div className="container-prose text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Reservierung"
              title="Tisch online reservieren"
              description="Wählen Sie Datum und Uhrzeit, geben Sie Ihre Kontaktdaten ein — wir bestätigen Ihre Reservierung per E-Mail. Telefonisch sind wir natürlich weiterhin unter +49 30 94209445 erreichbar."
            />
          </Reveal>
        </div>
      </section>

      <section className="section pt-0 bg-paper">
        <div className="container-wide">
          <Reveal>
            <div className="max-w-3xl mx-auto bg-paper-deep/30 p-8 sm:p-12 border border-ink/10 shadow-soft">
              <ReservationForm />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-cream-deep relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="container-prose relative">
          <Reveal>
            <div className="text-center max-w-xl mx-auto">
              <p className="eyebrow">Hinweise</p>
              <h2
                className="mt-3 font-serif text-2xl sm:text-3xl text-ink-strong"
                style={{ fontWeight: 700 }}
              >
                Gut zu wissen
              </h2>
              <div className="mt-6 flex justify-center">
                <Ornament />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-10 max-w-2xl mx-auto space-y-4 text-ink leading-relaxed">
              <li className="flex gap-3 items-start">
                <span className="text-gold mt-2 text-xs">◆</span>
                <span>
                  Reservierungen sind ab 2 Öffnungstagen Vorlauf möglich. Spontane
                  Anfragen davor bitte telefonisch unter{" "}
                  <a
                    href={`tel:${siteConfig.phoneHref}`}
                    className="link-vintage text-burgundy font-serif"
                    style={{ fontWeight: 600 }}
                  >
                    {siteConfig.phone}
                  </a>
                  .
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-gold mt-2 text-xs">◆</span>
                <span>
                  Letzte Reservierung Mi – Sa bis 20:00 Uhr, sonntags bis 16:00
                  Uhr — damit unsere Küche Sie noch in Ruhe versorgen kann.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-gold mt-2 text-xs">◆</span>
                <span>
                  Montags und dienstags ist unsere Küche geschlossen. Für private
                  Veranstaltungen an diesen Tagen sprechen Sie uns gerne an.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-gold mt-2 text-xs">◆</span>
                <span>
                  <strong className="text-ink-strong">
                    Ihre Reservierung ist erst gültig, wenn Sie unsere
                    Bestätigungs-E-Mail erhalten haben.
                  </strong>{" "}
                  Wir prüfen jede Anfrage persönlich und melden uns in der Regel
                  innerhalb weniger Stunden.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-gold mt-2 text-xs">◆</span>
                <span>
                  Bei größeren Gruppen (ab 10 Personen) oder besonderen
                  Anlässen rufen Sie uns am besten direkt an — wir besprechen
                  dann die Details persönlich.
                </span>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
