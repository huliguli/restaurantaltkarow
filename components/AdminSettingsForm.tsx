"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialGaId: string | null;
};

type SubmitState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export function AdminSettingsForm({ initialGaId }: Props) {
  const router = useRouter();
  const [gaId, setGaId] = useState(initialGaId ?? "");
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  async function persist(value: string | null) {
    setSubmit({ status: "saving" });
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ga_measurement_id: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmit({
          status: "error",
          message: data?.error ?? "Speichern fehlgeschlagen.",
        });
        return;
      }
      setGaId(data?.ga_measurement_id ?? "");
      setSubmit({
        status: "ok",
        message: value
          ? "Measurement-ID aktualisiert. Im Browser kann sich der Wert bis zu 5 Minuten cachen."
          : "Measurement-ID entfernt — Tracking ist deaktiviert.",
      });
      router.refresh();
    } catch {
      setSubmit({ status: "error", message: "Verbindungsfehler." });
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = gaId.trim();
    persist(trimmed === "" ? null : trimmed);
  }

  function handleClear() {
    if (!confirm("Measurement-ID wirklich entfernen? Tracking pausiert dann komplett."))
      return;
    persist(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <label className="block">
        <span
          className="block text-sm text-ink-strong mb-1.5"
          style={{ fontWeight: 600 }}
        >
          Google Analytics 4 — Measurement-ID
        </span>
        <input
          type="text"
          value={gaId}
          onChange={(e) => setGaId(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          autoComplete="off"
          spellCheck={false}
          className="w-full px-4 py-2.5 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink font-mono tracking-wide"
        />
        <span className="block text-xs italic text-muted mt-2">
          Format: G-XXXXXXXXXX (10 – 16 alphanumerische Zeichen nach „G-"). Zu
          finden in Google Analytics unter „Verwaltung → Datenstreams → Web →
          Stream-Details".
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submit.status === "saving"}
          className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submit.status === "saving" ? "Wird gespeichert…" : "Speichern"}
        </button>
        {initialGaId ? (
          <button
            type="button"
            onClick={handleClear}
            disabled={submit.status === "saving"}
            className="btn btn-outline disabled:opacity-60"
          >
            ID entfernen
          </button>
        ) : null}
      </div>

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
    </form>
  );
}
