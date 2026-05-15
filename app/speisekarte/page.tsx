import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { MenuList } from "@/components/MenuList";
import { ReservationCTA } from "@/components/ReservationCTA";
import { Reveal } from "@/components/Reveal";
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
              description="Hausgemacht, regional eingekauft, mit Zeit zubereitet. Saisonale Empfehlungen und Tagesgerichte finden Sie zusätzlich an der Tafel im Restaurant."
            />
          </Reveal>
        </div>
      </section>

      <section className="section pt-0 bg-paper">
        <div className="container-wide">
          <Reveal>
            <nav
              aria-label="Speisekarte-Abschnitte"
              className="mb-20 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-sans tracking-[0.22em] uppercase text-ink-strong"
              style={{ fontWeight: 700 }}
            >
              {menu.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="link-vintage">
                  {s.title}
                </a>
              ))}
            </nav>
          </Reveal>
          <Reveal delay={120}>
            <MenuList sections={menu} />
          </Reveal>
        </div>
      </section>

      <section className="section pt-0 bg-paper">
        <div className="container-prose text-center text-sm text-ink-soft">
          <p>
            Hinweis zu Allergenen und Zusatzstoffen: Bitte sprechen Sie uns
            gerne im Restaurant an — wir beraten Sie individuell.
          </p>
          <p className="mt-2">
            Preisangaben in Euro inkl. gesetzlicher MwSt. Änderungen vorbehalten.
          </p>
        </div>
      </section>

      <ReservationCTA />
    </>
  );
}
