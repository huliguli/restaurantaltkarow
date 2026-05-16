"use client";

import { useMemo, useState } from "react";
import {
  earliestAllowedDate,
  formatDateGerman,
  fromIsoDate,
  isClosedDay,
  nextAllowedDates,
  slotsForDate,
  toIsoDate,
} from "@/lib/reservation-rules";
import { events } from "@/lib/analytics-events";

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export function ReservationForm() {
  // Maximal 60 Tage in die Zukunft anbieten (genug Spielraum, nicht zu lang)
  const [dateIso, setDateIso] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [partySize, setPartySize] = useState<string>("2");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  const [startedTracked, setStartedTracked] = useState(false);

  function handleFirstInteraction() {
    if (startedTracked) return;
    setStartedTracked(true);
    events.formStart("reservation");
  }

  const earliest = useMemo(() => earliestAllowedDate(), []);
  // Max-Datum: heute + 90 Tage
  const max = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d;
  }, []);

  const earliestIso = toIsoDate(earliest);
  const maxIso = toIsoDate(max);

  const slots = useMemo(() => (dateIso ? slotsForDate(dateIso) : []), [dateIso]);

  const dateInvalid = useMemo(() => {
    if (!dateIso) return null;
    const d = fromIsoDate(dateIso);
    if (isClosedDay(d))
      return "Montags und dienstags ist unsere Küche geschlossen. Bitte wählen Sie Mi–So.";
    if (d.getTime() < earliest.getTime())
      return `Wir bitten um mindestens zwei Öffnungstage Vorlauf — frühestens ${formatDateGerman(earliest)}.`;
    return null;
  }, [dateIso, earliest]);

  // Schnellauswahl: nächste 7 erlaubten Tage
  const quickPickDates = useMemo(() => nextAllowedDates(7), []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submit.status === "sending") return;

    if (!dateIso || !time) {
      setSubmit({ status: "error", message: "Bitte Datum und Uhrzeit wählen." });
      return;
    }
    if (dateInvalid) {
      setSubmit({ status: "error", message: dateInvalid });
      return;
    }
    if (!name || !email) {
      setSubmit({ status: "error", message: "Bitte Name und E-Mail angeben." });
      return;
    }
    const ps = Number(partySize);
    if (!Number.isFinite(ps) || ps < 1 || ps > 80) {
      setSubmit({ status: "error", message: "Personenanzahl bitte zwischen 1 und 80." });
      return;
    }

    setSubmit({ status: "sending" });

    try {
      const res = await fetch("/api/reservieren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateIso,
          time,
          partySize: ps,
          name,
          email,
          phone,
          notes,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Reservierung konnte nicht gesendet werden.");
      events.formSubmit("reservation", {
        party_size: ps,
        reservation_date: dateIso,
        reservation_time: time,
      });
      setSubmit({
        status: "ok",
        message:
          "Vielen Dank — wir haben Ihre Reservierungsanfrage erhalten. Eine verbindliche Bestätigung erhalten Sie in Kürze per E-Mail.",
      });
      // Form zurücksetzen
      setDateIso("");
      setTime("");
      setPartySize("2");
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setSubmit({ status: "error", message });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={handleFirstInteraction}
      className="space-y-10"
      noValidate
    >
      {/* === Schritt 1: Datum & Uhrzeit ================================= */}
      <fieldset>
        <legend className="label-bright mb-5 block text-ink-strong text-[0.82rem]">
          Schritt 1 — Datum & Uhrzeit
        </legend>

        {/* Schnellauswahl */}
        <p className="text-sm text-ink-soft mb-3">
          Schnellauswahl (nächste verfügbare Tage):
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {quickPickDates.map((d) => {
            const iso = toIsoDate(d);
            const active = iso === dateIso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => {
                  setDateIso(iso);
                  setTime("");
                }}
                className={`px-4 py-2 text-sm border tracking-wide transition-colors ${
                  active
                    ? "bg-burgundy border-burgundy text-paper"
                    : "bg-paper border-ink/20 text-ink hover:border-burgundy"
                }`}
              >
                <span className="font-serif">
                  {d.toLocaleDateString("de-DE", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <label className="block">
            <span className="block text-sm text-ink-strong mb-1.5">
              Datum <span className="text-burgundy">*</span>
            </span>
            <input
              type="date"
              value={dateIso}
              min={earliestIso}
              max={maxIso}
              onChange={(e) => {
                setDateIso(e.target.value);
                setTime("");
              }}
              className="w-full px-4 py-2.5 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink"
            />
            {dateInvalid ? (
              <span className="block text-sm text-burgundy mt-1.5">
                {dateInvalid}
              </span>
            ) : (
              <span className="block text-xs italic text-muted mt-1">
                Mi – So. Frühestens {formatDateGerman(earliest)}.
              </span>
            )}
          </label>

          <label className="block">
            <span className="block text-sm text-ink-strong mb-1.5">
              Uhrzeit <span className="text-burgundy">*</span>
            </span>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!dateIso || !!dateInvalid || slots.length === 0}
              className="w-full px-4 py-2.5 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink disabled:opacity-50"
            >
              <option value="">— bitte wählen —</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s} Uhr
                </option>
              ))}
            </select>
            <span className="block text-xs italic text-muted mt-1">
              Letzte Reservierung Mi–Sa bis 20:00, So bis 16:00.
            </span>
          </label>
        </div>
      </fieldset>

      {/* === Schritt 2: Anzahl Personen + Kontakt ======================= */}
      <fieldset>
        <legend className="label-bright mb-5 block text-ink-strong text-[0.82rem]">
          Schritt 2 — Ihre Daten
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <Field
            label="Personenanzahl"
            required
            type="number"
            value={partySize}
            onChange={setPartySize}
            hint="1 – 80 Personen"
          />
          <Field
            label="Name"
            required
            value={name}
            onChange={setName}
            autoComplete="name"
          />
          <Field
            label="E-Mail"
            required
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            hint="Die Bestätigung erhalten Sie hierhin"
          />
          <Field
            label="Telefon"
            type="tel"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
            hint="optional, für Rückfragen"
          />
        </div>
        <label className="block mt-5">
          <span className="block text-sm text-ink-strong mb-1.5">
            Anmerkungen <span className="text-muted text-xs">(optional)</span>
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink"
            placeholder="z. B. Geburtstag, Allergien, Kinderhochstuhl, Tisch am Fenster…"
          />
        </label>

        {/* Honeypot */}
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

      {/* === Hinweis ==================================================== */}
      <aside className="border-l-4 border-gold bg-paper-deep/50 p-6 text-sm text-ink leading-relaxed">
        <p>
          <strong className="text-ink-strong">Wichtig:</strong> Ihre
          Reservierung ist <em>noch nicht bestätigt</em>, wenn Sie das Formular
          absenden. Wir prüfen jede Anfrage persönlich und schicken Ihnen eine
          Bestätigung (oder Alternativvorschlag) per E-Mail — meist innerhalb
          weniger Stunden während unserer Öffnungszeiten.
        </p>
      </aside>

      {/* === Submit ==================================================== */}
      <div className="flex flex-col items-start gap-4">
        <button
          type="submit"
          disabled={submit.status === "sending"}
          className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submit.status === "sending" ? "Wird gesendet…" : "Reservierung anfragen"}
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
          Bearbeitung Ihrer Reservierung verarbeiten. Details siehe{" "}
          <a href="/datenschutz" className="link-vintage text-burgundy">
            Datenschutz
          </a>
          .
        </p>
      </div>
    </form>
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
