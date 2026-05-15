import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { Ornament } from "@/components/Ornament";
import { OpeningHours } from "@/components/OpeningHours";
import { ReservationCTA } from "@/components/ReservationCTA";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/siteConfig";
import { menu } from "@/content/menu";

export default function HomePage() {
  const teaserItems = menu
    .flatMap((s) => s.items.map((i) => ({ ...i, section: s.title })))
    .slice(0, 4);

  return (
    <>
      <Hero />

      {/* === ÜBER UNS === */}
      <section className="section bg-paper relative">
        {/* Subtile Trennung von oben */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-wood/8 to-transparent pointer-events-none" />

        <div className="container-wide grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative">
          <Reveal className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              <div className="relative aspect-[4/5] image-elegant rounded-sm shadow-warm corner-decor">
                <Image
                  src="/images/essensbereich.avif"
                  alt="Eingedeckte Tische im Hauptraum"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              {/* Zitat-Plakette über dem Bild */}
              <div className="hidden md:block absolute -bottom-10 -right-10 bg-paper border border-ink/15 px-7 py-6 shadow-warm max-w-[18rem]">
                <p
                  className="font-serif italic text-lg text-burgundy leading-snug"
                  style={{ fontWeight: 500 }}
                >
                  „Alte Freunde sind herzlich willkommen — und neue Gäste lernen
                  wir gerne kennen."
                </p>
                <div className="mt-3 h-px w-10 bg-gold" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-7 order-1 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow="Über uns"
              title="Das Restaurant in Ihrer Nachbarschaft"
            />
            <div className="mt-9 space-y-6 text-lg text-ink leading-relaxed">
              <p>
                Seit vielen Jahren ist das{" "}
                <strong
                  className="text-ink-strong"
                  style={{ fontWeight: 700 }}
                >
                  Alt-Karow
                </strong>{" "}
                ein Stück Heimat im Norden Berlins — ein Ort, an dem hausgemachte
                Küche, herzliche Gastfreundschaft und gemütliche Atmosphäre
                selbstverständlich zusammengehören.
              </p>
              <p>
                Wir kochen, was wir lieben: deutsche Klassiker, sorgfältig
                interpretiert, ergänzt um Lieblingsgerichte aus Osteuropa. Vom
                Borschtsch über die Königsberger Klopse bis zum Beef Stroganoff
                — alles entsteht in unserer Küche aus frischen Zutaten, mit Zeit
                und Sorgfalt.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/speisekarte" className="btn btn-primary">
                Speisekarte ansehen
              </Link>
              <Link href="/veranstaltungen" className="btn btn-outline">
                Feiern bei uns
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === SPEISEKARTE TEASER === */}
      <section className="section bg-cream-deep relative overflow-hidden">
        {/* Dekorative oberkante */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="container-wide relative">
          <Reveal>
            <SectionHeading
              eyebrow="Aus unserer Küche"
              title="Eine kleine Auswahl"
              description="Hausgemacht, ehrlich, satt machend. Die vollständige Speisekarte mit allen Vorspeisen, Hauptgerichten und Desserts finden Sie auf der nächsten Seite."
            />
          </Reveal>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-12 max-w-4xl mx-auto">
            {teaserItems.map((item, idx) => (
              <Reveal key={item.name} delay={idx * 100}>
                <article className="group relative pl-7 border-l-2 border-gold/50 transition-colors duration-500 hover:border-burgundy">
                  <p className="eyebrow">{item.section}</p>
                  <h3
                    className="mt-3 font-serif text-2xl text-ink-strong"
                    style={{ fontWeight: 700 }}
                  >
                    {item.name}
                  </h3>
                  {item.description ? (
                    <p className="mt-3 text-ink leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}
                  {item.price ? (
                    <p
                      className="mt-4 font-serif text-burgundy text-lg"
                      style={{ fontWeight: 600 }}
                    >
                      {item.price}
                    </p>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={150} className="mt-20 text-center">
            <Link href="/speisekarte" className="btn btn-outline">
              Komplette Speisekarte
            </Link>
          </Reveal>
        </div>
      </section>

      {/* === VERANSTALTUNGEN === */}
      <section className="section bg-wood text-cream relative overflow-hidden">
        {/* Subtiles warmes Glühen oben rechts */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(176,138,62,0.5) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-14 items-center relative">
          <Reveal>
            <SectionHeading
              align="left"
              tone="light"
              eyebrow="Feiern bei uns"
              title="Räume für Ihre besonderen Anlässe"
            />
            <p
              className="mt-9 text-lg text-paper leading-relaxed"
              style={{
                fontWeight: 400,
                textShadow: "0 2px 14px rgba(0,0,0,0.45)",
              }}
            >
              Hochzeiten, Geburtstage, Jubiläen, Firmenfeiern, Trauerfeiern oder
              eine ausgelassene Familienrunde — gerne richten wir Ihre
              Feierlichkeit aus. Vom intimen Privatraum bis zum großen Bankett
              auf der Terrasse: bei uns finden Sie den passenden Rahmen.
            </p>
            <Link
              href="/veranstaltungen"
              className="btn btn-outline-light mt-10"
            >
              Räume & Anfragen
            </Link>
          </Reveal>

          <Reveal delay={140}>
            <ul className="grid grid-cols-2 gap-5">
              {siteConfig.rooms.map((room) => (
                <li
                  key={room.name}
                  className="card-dark p-7 relative"
                >
                  <p className="label-bright text-[0.72rem]">
                    {room.capacity}
                  </p>
                  <h3
                    className="mt-4 font-serif text-2xl sm:text-[1.65rem] text-paper"
                    style={{ fontWeight: 700 }}
                  >
                    {room.name}
                  </h3>
                  <span
                    aria-hidden
                    className="absolute top-3 right-3 w-7 h-7 border-t border-r border-gold/55"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* === ÖFFNUNGSZEITEN === */}
      <section className="section bg-paper relative">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Öffnungszeiten"
              title="Wann wir für Sie da sind"
              description="An Montagen und Dienstagen ist unsere Küche geschlossen — auf Anfrage öffnen wir das Haus aber gerne für Ihre private Veranstaltung."
            />
          </Reveal>
          <Reveal delay={120}>
            <div className="bg-paper-deep/60 border border-ink/10 p-8 sm:p-10 corner-decor">
              <OpeningHours />
            </div>
          </Reveal>
        </div>
      </section>

      <ReservationCTA />
    </>
  );
}
