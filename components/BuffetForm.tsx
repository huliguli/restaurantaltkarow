"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BEILAGEN,
  BUFFET_META,
  COMMON_HINWEISE,
  DESSERTS,
  EROEFFNUNGSGETRAENKE,
  getVariants,
  HAUPTGERICHTE,
  LARGE_PARTY_THRESHOLD,
  LIMITS,
  requiresLargePartyConfirmation,
  SCHNITTCHEN,
  SUPPEN,
  VORSPEISEN,
  type BuffetType,
  type Variant,
} from "@/content/buffet";
import { events } from "@/lib/analytics-events";

type Props = {
  type: BuffetType;
};

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export function BuffetForm({ type }: Props) {
  const variants = useMemo(() => getVariants(type), [type]);
  const meta = BUFFET_META[type];

  // === Form-State ========================================================
  const [variantId, setVariantId] = useState<string>("");
  const [hauptgerichte, setHauptgerichte] = useState<Record<string, boolean>>({});
  const [hauptOptions, setHauptOptions] = useState<Record<string, string>>({});
  const [beilagen, setBeilagen] = useState<Record<string, boolean>>({});
  const [vorspeisen, setVorspeisen] = useState<Record<string, boolean>>({});
  const [suppen, setSuppen] = useState<Record<string, boolean>>({});
  const [schnittchen, setSchnittchen] = useState<Record<string, boolean>>({});
  const [desserts, setDesserts] = useState<Record<string, boolean>>({});

  // Eröffnungsgetränke (nur Trauerfeier)
  const [getraenke, setGetraenke] = useState<
    Record<string, { selected: boolean; anzahl: string; sub?: string }>
  >({});

  const [bemerkungen, setBemerkungen] = useState("");
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [wann, setWann] = useState("");
  const [personen, setPersonen] = useState("");

  const [website, setWebsite] = useState(""); // Honeypot
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  const [startedTracked, setStartedTracked] = useState(false);
  /**
   * Wenn der Gast eine kleine Buffet-Variante mit > 35 Personen kombiniert,
   * fragen wir nach Bestätigung. `largePartyDialogOpen` steuert das Modal,
   * `largePartyAcknowledged` wird nach Bestätigung kurz auf true gesetzt
   * für genau diesen Submit. Bei jeder Variante-/Personen-Änderung resettet
   * sich die Acknowledgement automatisch (Logik unten via Reset on change).
   */
  const [largePartyDialogOpen, setLargePartyDialogOpen] = useState(false);
  const [largePartyAcknowledged, setLargePartyAcknowledged] = useState(false);

  const formName = type === "feier" ? "buffet_feier" : "buffet_trauer";

  function handleFirstInteraction() {
    if (startedTracked) return;
    setStartedTracked(true);
    events.formStart(formName);
  }

  const selectedVariant: Variant | undefined = variants.find(
    (v) => v.id === variantId,
  );

  const showSection = (key: keyof Variant["hat"]) =>
    selectedVariant?.hat[key] ?? false;

  // === Count-Helpers für Max-Limits ======================================
  const countTrue = (obj: Record<string, boolean>) =>
    Object.values(obj).filter(Boolean).length;

  const countHaupt = countTrue(hauptgerichte);
  const countBeilagen = countTrue(beilagen);
  const countVorspeisen = countTrue(vorspeisen);
  const countSuppen = countTrue(suppen);

  // === Toggle-Helpers mit Limit ==========================================
  function toggleWithLimit(
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    id: string,
    current: Record<string, boolean>,
    limit: number,
  ) {
    const isOn = current[id] ?? false;
    const count = countTrue(current);
    if (!isOn && count >= limit) return; // Limit erreicht
    setter({ ...current, [id]: !isOn });
  }

  // Reset des Large-Party-Acknowledgements bei jeder Änderung von Variante
  // oder Personenzahl — sonst könnte ein „alter" Consent stale weiterwirken.
  function resetLargePartyAcknowledgement() {
    if (largePartyAcknowledged) setLargePartyAcknowledged(false);
  }

  // === Submit ============================================================
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submit.status === "sending") return;

    if (!variantId) {
      setSubmit({ status: "error", message: "Bitte wählen Sie eine Buffet-Variante." });
      return;
    }
    if (!name || !telefon || !email || !wann || !personen) {
      setSubmit({
        status: "error",
        message: `Bitte füllen Sie alle Pflichtfelder im Block „Informationen" aus.`,
      });
      return;
    }

    // Wenn kleine Variante + große Gruppe → Bestätigung anfordern,
    // bevor die Anfrage rausgeht. User muss aktiv „Trotzdem senden" klicken.
    const partyNum = Number(personen);
    if (
      requiresLargePartyConfirmation(variantId, partyNum) &&
      !largePartyAcknowledged
    ) {
      setLargePartyDialogOpen(true);
      return;
    }

    await submitRequest();
  }

  async function submitRequest() {
    setSubmit({ status: "sending" });

    const selected = (obj: Record<string, boolean>, source: { id: string; label: string }[]) =>
      source
        .filter((o) => obj[o.id])
        .map((o) => {
          const sub = hauptOptions[o.id];
          return sub ? `${o.label} (${sub})` : o.label;
        });

    const payload = {
      type,
      variantId,
      variantTitle: selectedVariant?.title ?? "",
      hauptgerichte: selected(hauptgerichte, HAUPTGERICHTE.map(({ id, label }) => ({ id, label }))),
      beilagen: selected(beilagen, BEILAGEN),
      vorspeisen: selected(vorspeisen, VORSPEISEN),
      suppen: selected(suppen, SUPPEN),
      schnittchen: selected(schnittchen, SCHNITTCHEN),
      desserts: selected(desserts, DESSERTS),
      getraenke: type === "trauerfeier"
        ? EROEFFNUNGSGETRAENKE.filter((g) => getraenke[g.id]?.selected).map((g) => ({
            label: g.label,
            anzahl: getraenke[g.id]?.anzahl ?? "",
            sub: getraenke[g.id]?.sub,
          }))
        : [],
      bemerkungen,
      kontakt: { name, telefon, email, wann, personen },
      website, // Honeypot
    };

    try {
      const res = await fetch("/api/buffet-anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Anfrage konnte nicht gesendet werden.");
      events.formSubmit(formName, {
        buffet_type: type,
        variant_id: variantId,
        party_size: Number(personen) || 0,
      });
      setSubmit({
        status: "ok",
        message:
          "Vielen Dank — wir haben Ihre Anfrage erhalten und melden uns telefonisch oder per E-Mail bei Ihnen.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setSubmit({ status: "error", message });
    }
  }

  // === Render ============================================================
  return (
    <form
      onSubmit={handleSubmit}
      onFocus={handleFirstInteraction}
      className="space-y-14"
      noValidate
    >
      {/* === Schritt 1: Variante wählen ==================================*/}
      <fieldset>
        <legend className="label-bright mb-6 block text-ink-strong text-[0.82rem]">
          Schritt 1 — Buffet-Variante wählen
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {variants.map((v) => {
            const active = variantId === v.id;
            return (
              <label
                key={v.id}
                className={`block cursor-pointer card-elevated p-7 transition-all ${
                  active
                    ? "ring-2 ring-burgundy border-burgundy"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={active}
                  onChange={() => {
                    setVariantId(v.id);
                    resetLargePartyAcknowledgement();
                  }}
                  className="sr-only"
                />
                <div className="flex items-baseline justify-between gap-4">
                  <h3
                    className="font-serif text-2xl text-ink-strong"
                    style={{ fontWeight: 700 }}
                  >
                    {v.title}
                  </h3>
                  <span
                    className="font-serif text-burgundy text-lg whitespace-nowrap"
                    style={{ fontWeight: 700 }}
                  >
                    {v.price} <span className="text-sm text-muted">p. P.</span>
                  </span>
                </div>
                <ul className="mt-4 space-y-1.5 text-ink leading-relaxed">
                  {v.includes.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="text-gold mt-2 text-[0.5rem]">◆</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                {v.note ? (
                  <p className="mt-3 text-sm italic text-muted">{v.note}</p>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* === Schritt 2: Konfiguration ==================================== */}
      {selectedVariant ? (
        <fieldset>
          <legend className="label-bright mb-6 block text-ink-strong text-[0.82rem]">
            Schritt 2 — Speisen konfigurieren
          </legend>

          {/* Hauptgerichte */}
          {showSection("hauptgerichte") ? (
            <Section
              title="Hauptgerichte"
              hint={`Bis zu ${LIMITS.hauptgerichte} Gerichte wählen`}
              count={countHaupt}
              max={LIMITS.hauptgerichte}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {HAUPTGERICHTE.map((h) => (
                  <CheckboxItem
                    key={h.id}
                    label={h.label}
                    checked={hauptgerichte[h.id] ?? false}
                    onChange={() =>
                      toggleWithLimit(
                        setHauptgerichte,
                        h.id,
                        hauptgerichte,
                        LIMITS.hauptgerichte,
                      )
                    }
                    disabled={
                      !(hauptgerichte[h.id] ?? false) &&
                      countHaupt >= LIMITS.hauptgerichte
                    }
                    subOptions={h.options}
                    subValue={hauptOptions[h.id] ?? ""}
                    onSubChange={(val) =>
                      setHauptOptions({ ...hauptOptions, [h.id]: val })
                    }
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {/* Beilagen */}
          {showSection("beilagen") ? (
            <Section
              title="Beilagen"
              hint={`Bis zu ${LIMITS.beilagen} Beilagen wählen`}
              count={countBeilagen}
              max={LIMITS.beilagen}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {BEILAGEN.map((b) => (
                  <CheckboxItem
                    key={b.id}
                    label={b.label}
                    checked={beilagen[b.id] ?? false}
                    onChange={() =>
                      toggleWithLimit(setBeilagen, b.id, beilagen, LIMITS.beilagen)
                    }
                    disabled={
                      !(beilagen[b.id] ?? false) && countBeilagen >= LIMITS.beilagen
                    }
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {/* Vorspeisen */}
          {showSection("vorspeisen") ? (
            <Section
              title="Vorspeisen"
              hint={`Bis zu ${LIMITS.vorspeisen} Vorspeisen wählen`}
              count={countVorspeisen}
              max={LIMITS.vorspeisen}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {VORSPEISEN.map((v) => (
                  <CheckboxItem
                    key={v.id}
                    label={v.label}
                    hint={v.hint}
                    checked={vorspeisen[v.id] ?? false}
                    onChange={() =>
                      toggleWithLimit(
                        setVorspeisen,
                        v.id,
                        vorspeisen,
                        LIMITS.vorspeisen,
                      )
                    }
                    disabled={
                      !(vorspeisen[v.id] ?? false) && countVorspeisen >= LIMITS.vorspeisen
                    }
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {/* Suppen */}
          {showSection("suppen") ? (
            <Section
              title="Suppen"
              hint={`Bis zu ${LIMITS.suppen} Suppen wählen`}
              count={countSuppen}
              max={LIMITS.suppen}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {SUPPEN.map((s) => (
                  <CheckboxItem
                    key={s.id}
                    label={s.label}
                    checked={suppen[s.id] ?? false}
                    onChange={() =>
                      toggleWithLimit(setSuppen, s.id, suppen, LIMITS.suppen)
                    }
                    disabled={!(suppen[s.id] ?? false) && countSuppen >= LIMITS.suppen}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {/* Schnittchen */}
          {showSection("schnittchen") ? (
            <Section title="Schnittchen" hint="Auswahl nach Wunsch">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {SCHNITTCHEN.map((s) => (
                  <CheckboxItem
                    key={s.id}
                    label={s.label}
                    checked={schnittchen[s.id] ?? false}
                    onChange={() =>
                      setSchnittchen({ ...schnittchen, [s.id]: !schnittchen[s.id] })
                    }
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {/* Desserts */}
          {showSection("dessert") ? (
            <Section title="Kuchenstück / Dessert" hint="pro Person">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                {DESSERTS.map((d) => (
                  <CheckboxItem
                    key={d.id}
                    label={d.label}
                    checked={desserts[d.id] ?? false}
                    onChange={() => setDesserts({ ...desserts, [d.id]: !desserts[d.id] })}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {/* Eröffnungsgetränke — nur Trauerfeier */}
          {type === "trauerfeier" ? (
            <Section
              title="Eröffnungsgetränke"
              hint="Optional. Alle Getränke können auch à la carte als Flasche bestellt werden."
            >
              <div className="space-y-4">
                {EROEFFNUNGSGETRAENKE.map((g) => {
                  const state = getraenke[g.id] ?? { selected: false, anzahl: "" };
                  return (
                    <div
                      key={g.id}
                      className="flex flex-wrap items-center gap-4 border-b border-ink/12 pb-3"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-[14rem]">
                        <input
                          type="checkbox"
                          checked={state.selected}
                          onChange={() =>
                            setGetraenke({
                              ...getraenke,
                              [g.id]: { ...state, selected: !state.selected },
                            })
                          }
                          className="w-4 h-4 accent-burgundy"
                        />
                        <span className="font-serif text-ink-strong">
                          {g.label}
                        </span>
                        <span className="text-sm text-muted">
                          {g.pricePerUnit} {g.unit}
                        </span>
                      </label>
                      {state.selected && g.subOptions ? (
                        <div className="flex gap-3 text-sm">
                          {g.subOptions.map((s) => (
                            <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name={`sub-${g.id}`}
                                value={s}
                                checked={state.sub === s}
                                onChange={() =>
                                  setGetraenke({
                                    ...getraenke,
                                    [g.id]: { ...state, sub: s },
                                  })
                                }
                                className="accent-burgundy"
                              />
                              <span className="text-ink">{s}</span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                      {state.selected ? (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-muted">Anzahl:</label>
                          <input
                            type="number"
                            min={1}
                            value={state.anzahl}
                            onChange={(e) =>
                              setGetraenke({
                                ...getraenke,
                                [g.id]: { ...state, anzahl: e.target.value },
                              })
                            }
                            className="w-20 px-3 py-1.5 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none"
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {/* Bemerkungen */}
          <Section title="Bemerkungen" hint="Allergien, Sonderwünsche, Anlass">
            <textarea
              value={bemerkungen}
              onChange={(e) => setBemerkungen(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink"
              placeholder="z. B. vegetarische Alternativen, Allergien, besondere Wünsche…"
            />
          </Section>
        </fieldset>
      ) : null}

      {/* === Schritt 3: Informationen =================================== */}
      {selectedVariant ? (
        <fieldset>
          <legend className="label-bright mb-6 block text-ink-strong text-[0.82rem]">
            Schritt 3 — Ihre Kontaktdaten
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Field
              label="Name"
              required
              value={name}
              onChange={setName}
              autoComplete="name"
            />
            <Field
              label="Telefon"
              required
              type="tel"
              value={telefon}
              onChange={setTelefon}
              autoComplete="tel"
            />
            <Field
              label="E-Mail"
              required
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              label="Wann ist die Veranstaltung?"
              required
              type="date"
              value={wann}
              onChange={setWann}
            />
            <Field
              label="Personenanzahl"
              required
              type="number"
              value={personen}
              onChange={(v) => {
                setPersonen(v);
                resetLargePartyAcknowledgement();
              }}
              hint="Buffet ab 20 Personen"
            />
          </div>

          {/* Honeypot — versteckt für Menschen, Bots tappen rein */}
          <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden>
            <label>
              Website (bitte freilassen)
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>
        </fieldset>
      ) : null}

      {/* === Hinweise ==================================================== */}
      <aside className="border-l-4 border-gold bg-paper-deep/50 p-6 text-sm text-ink-soft space-y-2">
        {COMMON_HINWEISE.map((h) => (
          <p key={h}>{h}</p>
        ))}
      </aside>

      {/* === Submit ====================================================== */}
      {selectedVariant ? (
        <div className="flex flex-col items-start gap-4">
          <button
            type="submit"
            disabled={submit.status === "sending"}
            className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submit.status === "sending"
              ? "Wird gesendet…"
              : `${meta.emailSubject} senden`}
          </button>

          {submit.status === "ok" ? (
            <p
              className="p-4 border-l-4 border-gold bg-paper-deep/60 text-ink-strong"
              role="status"
            >
              {submit.message}
            </p>
          ) : null}
          {submit.status === "error" ? (
            <p
              className="p-4 border-l-4 border-burgundy bg-burgundy/5 text-burgundy"
              role="alert"
            >
              {submit.message}
            </p>
          ) : null}

          <p className="text-xs text-muted">
            Mit dem Absenden willigen Sie ein, dass wir Ihre Angaben zur
            Bearbeitung Ihrer Anfrage verarbeiten. Details siehe{" "}
            <a href="/datenschutz" className="link-vintage text-burgundy">
              Datenschutz
            </a>
            .
          </p>
        </div>
      ) : null}

      {largePartyDialogOpen ? (
        <LargePartyDialog
          partySize={Number(personen) || 0}
          variantTitle={selectedVariant?.title ?? ""}
          onCancel={() => setLargePartyDialogOpen(false)}
          onConfirm={() => {
            setLargePartyAcknowledged(true);
            setLargePartyDialogOpen(false);
            // Acknowledged ist jetzt true → erneuter submitRequest läuft durch
            void submitRequest();
          }}
        />
      ) : null}
    </form>
  );
}

// ============================================================
// Bestätigungs-Dialog bei großen Gruppen mit kleinem Buffet
//
// Wird via React-Portal direkt in document.body gemountet — das ist nötig,
// weil `position: fixed` sonst relativ zum nächsten transformierten
// Ancestor positioniert würde (der <Reveal>-Wrapper hat translateY).
// Mit Portal: echtes Viewport-Fullscreen, Backdrop bedeckt alles.
// ============================================================
function LargePartyDialog({
  partySize,
  variantTitle,
  onCancel,
  onConfirm,
}: {
  partySize: number;
  variantTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Body-Scroll während Modal-Anzeige sperren
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Escape-Taste schließt
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="large-party-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <button
        type="button"
        aria-label="Schließen"
        onClick={onCancel}
        className="absolute inset-0 w-full h-full bg-wood/85 backdrop-blur-md cursor-default"
      />
      <div className="relative max-w-lg w-full bg-paper border border-gold/55 shadow-warm p-8 sm:p-10 corner-decor animate-[fade-in_220ms_ease-out]">
        <p className="label-bright text-burgundy text-[0.78rem]">Hinweis</p>
        <h3
          id="large-party-title"
          className="mt-3 font-serif text-2xl sm:text-3xl text-ink-strong"
          style={{ fontWeight: 700 }}
        >
          Gruppengröße & Buffet-Variante
        </h3>
        <p className="mt-5 text-ink leading-relaxed">
          Sie haben{" "}
          <strong className="text-ink-strong">
            {partySize} Personen
          </strong>{" "}
          mit der Variante <em>{variantTitle}</em> kombiniert. Diese Variante ist
          aus unserer Erfahrung auf kleinere Anlässe (bis etwa{" "}
          {LARGE_PARTY_THRESHOLD} Personen) ausgelegt. Bei größeren
          Gesellschaften empfehlen wir Ihnen eine umfangreichere Variante
          (Buffet 3 oder 4), damit wir alle Gäste in der gewohnten Qualität
          bewirten können.
        </p>
        <p className="mt-4 text-ink-soft leading-relaxed text-sm">
          Sie können Ihre Anfrage gerne trotzdem senden — wir besprechen die
          Details dann persönlich mit Ihnen und finden gemeinsam die passende
          Lösung.
        </p>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Variante ändern
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary">
            Trotzdem senden
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ============================================================
// Hilfskomponenten
// ============================================================

function Section({
  title,
  hint,
  count,
  max,
  children,
}: {
  title: string;
  hint?: string;
  count?: number;
  max?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 pt-8 border-t border-ink/12">
      <header className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <h4
          className="font-serif text-2xl text-ink-strong"
          style={{ fontWeight: 700 }}
        >
          {title}
        </h4>
        <div className="flex items-baseline gap-3 text-sm">
          {hint ? <span className="text-muted italic">{hint}</span> : null}
          {typeof count === "number" && typeof max === "number" ? (
            <span
              className={`tabular-nums font-sans tracking-wide ${
                count === max ? "text-burgundy font-semibold" : "text-muted"
              }`}
            >
              {count} / {max}
            </span>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function CheckboxItem({
  label,
  hint,
  checked,
  disabled,
  onChange,
  subOptions,
  subValue,
  onSubChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  subOptions?: string[];
  subValue?: string;
  onSubChange?: (value: string) => void;
}) {
  return (
    <div>
      <label
        className={`flex items-start gap-3 cursor-pointer group ${
          disabled ? "opacity-45 cursor-not-allowed" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="mt-1 w-4 h-4 accent-burgundy shrink-0"
        />
        <span>
          <span className="text-ink-strong leading-snug">{label}</span>
          {hint ? (
            <span className="block text-xs italic text-muted mt-0.5">{hint}</span>
          ) : null}
        </span>
      </label>
      {checked && subOptions && onSubChange ? (
        <div className="mt-2 ml-7 flex gap-4 text-sm">
          {subOptions.map((o) => (
            <label key={o} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`sub-${label}`}
                value={o}
                checked={subValue === o}
                onChange={() => onSubChange(o)}
                className="accent-burgundy"
              />
              <span className="text-ink">{o}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  hint,
  autoComplete,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-ink-strong mb-1.5">
        {label}
        {required ? <span className="text-burgundy"> *</span> : null}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full px-4 py-2.5 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink"
      />
      {hint ? (
        <span className="block text-xs italic text-muted mt-1">{hint}</span>
      ) : null}
    </label>
  );
}
