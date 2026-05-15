import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { GalleryGrid } from "@/components/GalleryGrid";
import { ReservationCTA } from "@/components/ReservationCTA";
import { Reveal } from "@/components/Reveal";
import { gallery, galleryCategories } from "@/content/gallery";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Einblicke ins Restaurant Alt-Karow: Innenraum, Terrasse, Speisen, Feierlichkeiten. Eine Auswahl an Bildern unseres Hauses.",
};

export default function GaleriePage() {
  return (
    <>
      <section className="section pt-44 bg-paper">
        <div className="container-prose text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Galerie"
              title="Einblicke in unser Haus"
              description="Bilder sagen oft mehr als Worte. Eine kleine Auswahl, die laufend wächst — wenn Sie noch mehr sehen möchten, folgen Sie uns gerne auf Instagram."
            />
          </Reveal>
        </div>
      </section>

      {galleryCategories.map((cat, catIdx) => {
        const items = gallery.filter((g) => g.category === cat.id);
        return (
          <section
            key={cat.id}
            id={cat.id}
            className={`section pt-0 scroll-mt-28 ${
              catIdx % 2 === 0 ? "bg-paper" : "bg-cream-deep"
            }`}
          >
            <div className="container-wide">
              <Reveal>
                <div className="flex items-baseline gap-5 mb-10">
                  <h2
                    className="font-serif text-3xl sm:text-4xl text-ink-strong"
                    style={{ fontWeight: 700 }}
                  >
                    {cat.label}
                  </h2>
                  <span className="flex-1 h-px bg-ink/20" />
                  <span className="eyebrow">
                    {items.length > 0
                      ? `${items.length} Bild${items.length === 1 ? "" : "er"}`
                      : "in Vorbereitung"}
                  </span>
                </div>
              </Reveal>
              {items.length === 0 ? (
                <Reveal delay={120}>
                  <p className="text-ink-soft italic">
                    Bilder folgen in Kürze. Schauen Sie bald wieder vorbei.
                  </p>
                </Reveal>
              ) : (
                <Reveal delay={120}>
                  <GalleryGrid images={items} />
                </Reveal>
              )}
            </div>
          </section>
        );
      })}

      <ReservationCTA />
    </>
  );
}
