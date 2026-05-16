import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { MenuList } from "@/components/MenuList";
import { ReservationCTA } from "@/components/ReservationCTA";
import { Reveal } from "@/components/Reveal";
import { Ornament } from "@/components/Ornament";
import { menu } from "@/content/menu";

export const metadata: Metadata = {
  title: "Speisekarte",
  description:
    "Die Speisekarte des Restaurant Alt-Karow — deutsche Küche und osteuropäische Klassiker, hausgemacht. Borschtsch, Königsberger Klopse, Beef Stroganoff und mehr.",
};

export default function SpeisekartePage() {
  return (
    <>
      <section className="section pt-44 bg-paper">
        <div className="container-prose text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Speisekarte"
              title="Was bei uns auf den Tisch kommt"
              description="Hausgemacht, regional eingekauft, mit Zeit zubereitet. Saisonale Empfehlungen und Tagesgerichte zusätzlich an der Tafel im Restaurant."
            />
          </Reveal>
        </div>
      </section>

      {/* === PDF-DOWNLOAD === */}
      <section className="section pt-0 bg-paper">
        <div className="container-wide">
          <Reveal>
            <div className="max-w-3xl mx-auto card-elevated p-8 sm:p-12 text-center">
              <p className="eyebrow">Aktuelle Karte</p>
              <h2
                className="mt-3 font-serif text-3xl sm:text-4xl text-ink-strong"
                style={{ fontWeight: 700 }}
              >
                Komplette Speisekarte als PDF
              </h2>
              <div className="mt-6 flex justify-center">
                <Ornament />
              </div>
              <p className="mt-7 text-ink leading-relaxed">
                Die vollständige Karte mit allen Vor- und Hauptgerichten,
                Beilagen, Suppen, Desserts, Getränken und saisonalen Specials
                steht als PDF zum Anschauen und Herunterladen bereit.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <a
                  href="/dokumente/speisekarte.pdf"
                  target="_blank"
                  rel="noopener"
                  className="btn btn-primary"
                >
                  Speisekarte ansehen
                </a>
                <a
                  href="/dokumente/speisekarte.pdf"
                  download
                  className="btn btn-outline"
                >
                  PDF herunterladen
                </a>
              </div>
              <p className="mt-6 text-xs italic text-muted">
                Öffnet im Browser oder als Download.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === SPEISEKARTE === */}
      <section className="section bg-cream-deep relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="container-wide">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">Unsere Karte</p>
              <h2
                className="mt-3 font-serif text-3xl sm:text-4xl text-ink-strong"
                style={{ fontWeight: 700 }}
              >
                Hausgemachte Spezialitäten
              </h2>
              <div className="mt-6 flex justify-center">
                <Ornament />
              </div>
              <p className="mt-7 text-ink leading-relaxed">
                Deutsche Küche, veredelt durch feine osteuropäische Einflüsse —
                alles aus eigener Küche, mit Zeit und frischen Zutaten zubereitet.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <nav
              aria-label="Speisekarte-Abschnitte"
              className="mb-16 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-sans tracking-[0.22em] uppercase text-ink-strong"
              style={{ fontWeight: 700 }}
            >
              {menu.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="link-vintage">
                  {s.title}
                </a>
              ))}
            </nav>
          </Reveal>

          {/* MenuList ist sehr lang — kein Reveal-Wrapper, sonst hängt der
              Inhalt bei IntersectionObserver-Edge-Cases auf opacity:0. */}
          <MenuList sections={menu} />
        </div>
      </section>

      <section className="section pt-0 bg-cream-deep">
        <div className="container-prose text-center text-sm text-ink-soft">
          <p>
            Hinweis zu Allergenen und Zusatzstoffen: Bitte sprechen Sie uns
            gerne im Restaurant an — wir beraten Sie individuell.
          </p>
          <p className="mt-2">
            Preisangaben in Euro inkl. gesetzlicher MwSt. Änderungen vorbehalten.
            Verbindlich ist die aktuelle Karte im Restaurant.
          </p>
        </div>
      </section>

      <ReservationCTA />
    </>
  );
}
