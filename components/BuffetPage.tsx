import { SectionHeading } from "@/components/SectionHeading";
import { Ornament } from "@/components/Ornament";
import { Reveal } from "@/components/Reveal";
import { BuffetForm } from "@/components/BuffetForm";
import { BUFFET_META, type BuffetType } from "@/content/buffet";

type Props = {
  type: BuffetType;
};

/**
 * Wiederverwendbare Page-Komponente für beide Buffet-Konfiguratoren.
 * Die Seiten /veranstaltungen/feierbuffet und /trauerfeierbuffet sind
 * dünne Wrapper, die hier nur den Typ reinreichen.
 */
export function BuffetPage({ type }: Props) {
  const meta = BUFFET_META[type];
  const back = type === "feier" ? "Feier" : "Trauerfeier";

  return (
    <>
      <section className="section pt-44 bg-paper">
        <div className="container-prose text-center">
          <Reveal>
            <SectionHeading
              eyebrow={`Konfigurator · ${back}`}
              title={meta.title}
              description={meta.intro}
            />
          </Reveal>
        </div>
      </section>

      {/* Zwei Wege — digital oder analog */}
      <section className="section pt-0 bg-paper">
        <div className="container-wide">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <article className="card-elevated p-8">
                <p className="eyebrow">Variante A</p>
                <h2
                  className="mt-3 font-serif text-2xl text-ink-strong"
                  style={{ fontWeight: 700 }}
                >
                  Direkt auf der Website ausfüllen
                </h2>
                <p className="mt-3 text-ink leading-relaxed">
                  Wählen Sie weiter unten Variante und Speisen, geben Sie Ihre
                  Kontaktdaten ein, klicken auf <em>Senden</em>. Wir erhalten
                  Ihre Konfiguration sofort per E-Mail und melden uns zur
                  Abstimmung.
                </p>
              </article>

              <article className="card-elevated p-8">
                <p className="eyebrow">Variante B</p>
                <h2
                  className="mt-3 font-serif text-2xl text-ink-strong"
                  style={{ fontWeight: 700 }}
                >
                  Als PDF herunterladen, ausdrucken, im Restaurant abgeben
                </h2>
                <p className="mt-3 text-ink leading-relaxed">
                  Klassisch von Hand. Laden Sie das Konfigurationsblatt
                  herunter, füllen Sie es in Ruhe aus und geben Sie es bei
                  Ihrem Besuch ab — wir unterschreiben gemeinsam.
                </p>
                <a
                  href={meta.pdfPath}
                  download
                  className="btn btn-outline mt-6"
                >
                  PDF herunterladen
                </a>
              </article>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === Konfigurator === */}
      <section className="section bg-cream-deep relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="container-wide relative">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">Online-Konfigurator</p>
              <h2
                className="mt-3 font-serif text-3xl sm:text-4xl text-ink-strong"
                style={{ fontWeight: 700 }}
              >
                Ihre Anfrage in drei Schritten
              </h2>
              <div className="mt-6 flex justify-center">
                <Ornament />
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="max-w-5xl mx-auto bg-paper p-8 sm:p-12 border border-ink/10 shadow-soft">
              <BuffetForm type={type} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
