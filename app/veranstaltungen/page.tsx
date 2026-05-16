import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { Ornament } from "@/components/Ornament";
import { ReservationCTA } from "@/components/ReservationCTA";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Veranstaltungen & Feiern",
  description:
    "Hochzeiten, Geburtstage, Jubiläen, Firmen- und Familienfeiern im Restaurant Alt-Karow. Hauptraum bis 40, Bankettsaal bis 50, Privatraum bis 12 Personen, Terrasse bis 40 Personen.",
};

const occasions = [
  {
    title: "Hochzeiten",
    body: "Vom standesamtlichen Mittagessen bis zur großen Feier — wir gestalten Ihren Tag mit der Ruhe und Sorgfalt, die er verdient.",
  },
  {
    title: "Geburtstage & Jubiläen",
    body: "Runde Geburtstage, Goldene Hochzeit, Konfirmation, Taufe — wir richten den Rahmen für die Menschen, die Sie eingeladen haben.",
  },
  {
    title: "Firmenfeiern",
    body: "Weihnachtsfeier, Jubiläum, Kundenabend, Mitarbeiterbindung. Diskret, gut organisiert, kulinarisch überzeugend.",
  },
  {
    title: "Trauerfeiern",
    body: "Ein würdiger Ort für den Kreis Ihrer Liebsten. Wir kümmern uns um alles, was uns möglich ist, mit Respekt und Diskretion.",
  },
];

export default function VeranstaltungenPage() {
  return (
    <>
      <section className="section pt-44 bg-paper">
        <div className="container-prose text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Veranstaltungen"
              title="Ihr Anlass — unser Haus"
              description="Vier Räume für unterschiedliche Anlässe, eine Küche für alle. Sprechen Sie uns an, wir gestalten Ihre Feier individuell."
            />
          </Reveal>
        </div>
      </section>

      {/* RÄUME */}
      <section className="section pt-0 bg-paper">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-7">
            {siteConfig.rooms.map((room, i) => (
              <Reveal key={room.name} delay={i * 90}>
                <article className="card-elevated relative overflow-hidden h-full flex flex-col">
                  {room.image ? (
                    <div className="relative aspect-[16/10] image-elegant">
                      <Image
                        src={room.image}
                        alt={room.alt}
                        fill
                        sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(180deg, transparent 50%, rgba(15,8,4,0.45) 100%)",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] bg-cream-deep flex items-center justify-center">
                      <span className="font-serif italic text-muted text-lg">
                        Foto folgt
                      </span>
                    </div>
                  )}
                  <div className="p-7 sm:p-8 flex-1 flex flex-col">
                    <p
                      className="text-burgundy uppercase tracking-[0.24em] text-[0.72rem]"
                      style={{ fontWeight: 700 }}
                    >
                      {room.capacity}
                    </p>
                    <h3
                      className="mt-3 font-serif text-3xl text-ink-strong"
                      style={{ fontWeight: 700 }}
                    >
                      {room.name}
                    </h3>
                  </div>
                  <span
                    aria-hidden
                    className="absolute top-4 right-4 w-7 h-7 border-t border-r border-gold/65 z-10"
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ANLÄSSE */}
      <section className="section bg-cream-deep relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
        <div className="container-wide relative">
          <Reveal>
            <SectionHeading
              eyebrow="Anlässe"
              title="Wofür wir gerne unsere Türen öffnen"
            />
          </Reveal>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {occasions.map((o, i) => (
              <Reveal key={o.title} delay={i * 100}>
                <div className="pl-7 border-l-2 border-gold/50 hover:border-burgundy transition-colors duration-500">
                  <h3
                    className="font-serif text-2xl text-ink-strong"
                    style={{ fontWeight: 700 }}
                  >
                    {o.title}
                  </h3>
                  <p className="mt-4 text-ink leading-relaxed text-lg">
                    {o.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BUFFET-KONFIGURATOR-TEASER */}
      <section className="section bg-paper relative">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              eyebrow="Buffet-Konfigurator"
              title="Stellen Sie Ihr Buffet zusammen"
              description="Wählen Sie Ihre Buffet-Variante und Speisen — online oder als PDF zum Ausdrucken. Wir richten Ihre Feier nach Ihren Vorstellungen aus."
            />
          </Reveal>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-7 max-w-5xl mx-auto">
            <Reveal>
              <article className="card-elevated p-9 h-full flex flex-col">
                <p className="eyebrow">Geburtstage · Hochzeiten · Jubiläen</p>
                <h3
                  className="mt-3 font-serif text-3xl text-ink-strong"
                  style={{ fontWeight: 700 }}
                >
                  Feier-Buffet
                </h3>
                <p className="mt-4 text-ink leading-relaxed">
                  Drei Varianten ab 26,90 € pro Person. Hauptgerichte, Suppen,
                  Beilagen, Vorspeisen, Desserts — frei kombinierbar nach Ihrem
                  Geschmack. Buffet ab 20 Personen.
                </p>
                <div className="mt-auto pt-8 flex flex-wrap gap-3">
                  <Link
                    href="/veranstaltungen/feierbuffet"
                    className="btn btn-primary"
                  >
                    Online konfigurieren
                  </Link>
                  <a
                    href="/dokumente/feierbuffet.pdf"
                    download
                    className="btn btn-outline"
                  >
                    PDF herunterladen
                  </a>
                </div>
              </article>
            </Reveal>

            <Reveal delay={140}>
              <article className="card-elevated p-9 h-full flex flex-col">
                <p className="eyebrow">Trauerfeiern</p>
                <h3
                  className="mt-3 font-serif text-3xl text-ink-strong"
                  style={{ fontWeight: 700 }}
                >
                  Trauerfeier-Buffet
                </h3>
                <p className="mt-4 text-ink leading-relaxed">
                  Vier Varianten ab 18,50 € pro Person. Diskret, würdig, mit
                  Eröffnungsgetränken auf Wunsch. Wir nehmen Ihnen die
                  Organisation in dieser Zeit ab.
                </p>
                <div className="mt-auto pt-8 flex flex-wrap gap-3">
                  <Link
                    href="/veranstaltungen/trauerfeierbuffet"
                    className="btn btn-primary"
                  >
                    Online konfigurieren
                  </Link>
                  <a
                    href="/dokumente/trauerfeierbuffet.pdf"
                    download
                    className="btn btn-outline"
                  >
                    PDF herunterladen
                  </a>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BILD + TEXT */}
      <section className="section bg-cream-deep">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div className="relative aspect-[4/3] image-elegant rounded-sm shadow-warm corner-decor">
              <Image
                src="/images/essensbereich.avif"
                alt="Eingedeckte Tische bereit für eine Feier"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={130}>
            <SectionHeading
              align="left"
              eyebrow="Catering & Service"
              title="Wir kümmern uns um alles"
            />
            <ul className="mt-9 space-y-4 text-ink text-lg leading-relaxed">
              {[
                "Individuelle Menüabsprache vorab",
                "Hausgemachte Speisen — auch in größerer Menge",
                "Getränkebegleitung nach Wunsch",
                "Tafelbestuhlung, Tischwäsche, Tischkarten",
                "Auch montags und dienstags möglich (auf Anfrage)",
                "Auf Wunsch Catering außer Haus",
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <span className="text-gold mt-2 text-xs">◆</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-12">
              <Ornament />
              <p
                className="mt-6 font-serif italic text-xl text-burgundy text-center"
                style={{ fontWeight: 600 }}
              >
                Für eine unverbindliche Anfrage rufen Sie uns einfach an.
              </p>
              <div className="mt-7 flex justify-center">
                <a
                  href={`tel:${siteConfig.phoneHref}`}
                  className="btn btn-primary"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ReservationCTA />
    </>
  );
}
