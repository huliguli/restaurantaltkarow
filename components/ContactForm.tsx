"use client";

import { useState } from "react";
import { events } from "@/lib/analytics-events";

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

const ANLAESSE = [
  "Allgemeine Anfrage",
  "Reservierung",
  "Veranstaltung / Feier",
  "Catering",
  "Sonstiges",
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [anlass, setAnlass] = useState<string>(ANLAESSE[0]);
  const [nachricht, setNachricht] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  const [startedTracked, setStartedTracked] = useState(false);

  function handleFirstInteraction() {
    if (startedTracked) return;
    setStartedTracked(true);
    events.formStart("contact");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submit.status === "sending") return;

    if (!name || !email || !nachricht) {
      events.formError("contact", "missing_required");
      setSubmit({
        status: "error",
        message:
          "Bitte füllen Sie Name, E-Mail und Nachricht aus — alles andere ist optional.",
      });
      return;
    }

    events.formSubmit("contact");
    setSubmit({ status: "sending" });

    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          telefon,
          anlass,
          nachricht,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Versand fehlgeschlagen.");
      events.formSuccess("contact");
      events.contactRequested(anlass);
      setSubmit({
        status: "ok",
        message:
          "Vielen Dank — wir haben Ihre Nachricht erhalten und melden uns so schnell wie möglich.",
      });
      // Form zurücksetzen
      setName("");
      setEmail("");
      setTelefon("");
      setAnlass(ANLAESSE[0]);
      setNachricht("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler.";
      events.formError("contact", message);
      setSubmit({ status: "error", message });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={handleFirstInteraction}
      className="space-y-6"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
        />
        <Field
          label="Telefon"
          type="tel"
          value={telefon}
          onChange={setTelefon}
          autoComplete="tel"
          hint="optional, beschleunigt aber eine Antwort"
        />
        <label className="block">
          <span className="block text-sm text-ink-strong mb-1.5">Anlass</span>
          <select
            value={anlass}
            onChange={(e) => setAnlass(e.target.value)}
            className="w-full px-4 py-2.5 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink"
          >
            {ANLAESSE.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="block text-sm text-ink-strong mb-1.5">
          Nachricht <span className="text-burgundy">*</span>
        </span>
        <textarea
          value={nachricht}
          onChange={(e) => setNachricht(e.target.value)}
          rows={6}
          required
          className="w-full px-4 py-3 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink leading-relaxed"
          placeholder="Was können wir für Sie tun?"
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

      <div className="flex flex-col items-start gap-4">
        <button
          type="submit"
          disabled={submit.status === "sending"}
          className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submit.status === "sending" ? "Wird gesendet…" : "Nachricht senden"}
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
