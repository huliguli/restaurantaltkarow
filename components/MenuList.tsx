import type { MenuSection } from "@/content/menu";
import { Ornament } from "./Ornament";

type Props = {
  sections: MenuSection[];
};

export function MenuList({ sections }: Props) {
  return (
    <div className="space-y-24">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <header className="text-center">
            {section.subtitle ? (
              <p className="eyebrow">{section.subtitle}</p>
            ) : null}
            <h2
              className="mt-3 font-serif text-3xl sm:text-4xl text-ink-strong"
              style={{ fontWeight: 700 }}
            >
              {section.title}
            </h2>
            <div className="mt-6 flex justify-center">
              <Ornament />
            </div>
          </header>

          <ul className="mt-12 max-w-3xl mx-auto space-y-9">
            {section.items.map((item) => (
              <li
                key={item.name}
                className="group transition-colors duration-300"
              >
                <div className="flex items-baseline gap-4">
                  <h3
                    className="font-serif text-xl sm:text-2xl text-ink-strong transition-colors duration-300 group-hover:text-burgundy"
                    style={{ fontWeight: 600 }}
                  >
                    {item.name}
                  </h3>
                  <span
                    aria-hidden
                    className="flex-1 border-b border-dotted border-ink/35 translate-y-[-5px]"
                  />
                  {item.price ? (
                    <span
                      className="font-serif text-lg text-burgundy tabular-nums whitespace-nowrap"
                      style={{ fontWeight: 600 }}
                    >
                      {item.price}
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="mt-2 text-ink leading-relaxed">
                    {item.description}
                  </p>
                ) : null}
                {item.tags && item.tags.length > 0 ? (
                  <p className="mt-3 flex gap-3 flex-wrap">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.7rem] uppercase tracking-[0.22em] font-sans font-bold text-gold"
                      >
                        · {tag} ·
                      </span>
                    ))}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
