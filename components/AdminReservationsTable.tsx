"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  formatDateGerman,
  fromIsoDate,
  isTimeAllowedForDate,
  slotsForDate,
} from "@/lib/reservation-rules";

export type AdminReservation = {
  id: number;
  created_at: string;
  reservation_date: string;
  reservation_time: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  notes: string | null;
  status: "pending" | "confirmed" | "declined" | "change_proposed";
  admin_note: string | null;
  proposed_date: string | null;
  proposed_time: string | null;
  decided_at: string | null;
};

const STATUS_LABEL: Record<AdminReservation["status"], string> = {
  pending: "Offen",
  confirmed: "Bestätigt",
  declined: "Abgelehnt",
  change_proposed: "Alternative vorgeschlagen",
};

const STATUS_STYLE: Record<AdminReservation["status"], string> = {
  pending: "bg-paper-deep text-ink-strong border-gold",
  confirmed: "bg-burgundy text-paper border-burgundy",
  declined: "bg-ink-strong text-paper border-ink-strong",
  change_proposed: "bg-gold/30 text-ink-strong border-gold",
};

type Filter = "all" | "pending" | "decided" | "upcoming";

export function AdminReservationsTable({
  reservations,
}: {
  reservations: AdminReservation[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("pending");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return reservations.filter((r) => {
      if (filter === "pending") return r.status === "pending";
      if (filter === "decided")
        return r.status !== "pending";
      if (filter === "upcoming")
        return r.reservation_date >= todayIso && r.status !== "declined";
      return true;
    });
  }, [reservations, filter]);

  const counts = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return {
      all: reservations.length,
      pending: reservations.filter((r) => r.status === "pending").length,
      decided: reservations.filter((r) => r.status !== "pending").length,
      upcoming: reservations.filter(
        (r) => r.reservation_date >= todayIso && r.status !== "declined",
      ).length,
    };
  }, [reservations]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["pending", `Offen (${counts.pending})`],
            ["upcoming", `Anstehend (${counts.upcoming})`],
            ["decided", `Entschieden (${counts.decided})`],
            ["all", `Alle (${counts.all})`],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm tracking-wide border transition-colors ${
              filter === key
                ? "bg-burgundy border-burgundy text-paper"
                : "bg-paper border-ink/20 text-ink hover:border-burgundy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-soft italic py-12 text-center">
          Keine Reservierungen in dieser Ansicht.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-ink/20 text-left">
                <Th>Datum</Th>
                <Th>Zeit</Th>
                <Th>Pers.</Th>
                <Th>Name</Th>
                <Th>Kontakt</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <ReservationRow
                  key={r.id}
                  reservation={r}
                  isOpen={openId === r.id}
                  onToggle={() =>
                    setOpenId((curr) => (curr === r.id ? null : r.id))
                  }
                  onUpdated={() => router.refresh()}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      className="px-4 py-3 font-sans text-[0.72rem] tracking-[0.18em] uppercase text-muted"
      style={{ fontWeight: 700 }}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-ink ${className}`}>{children}</td>;
}

function ReservationRow({
  reservation: r,
  isOpen,
  onToggle,
  onUpdated,
}: {
  reservation: AdminReservation;
  isOpen: boolean;
  onToggle: () => void;
  onUpdated: () => void;
}) {
  return (
    <>
      <tr className="border-b border-ink/10 hover:bg-paper-deep/40 transition-colors">
        <Td>
          <span className="font-serif">{formatDateGerman(fromIsoDate(r.reservation_date))}</span>
        </Td>
        <Td>
          <span className="font-serif tabular-nums">{r.reservation_time}</span>
        </Td>
        <Td>
          <span className="font-serif tabular-nums">{r.party_size}</span>
        </Td>
        <Td>
          <strong className="text-ink-strong">{r.name}</strong>
        </Td>
        <Td className="text-xs leading-tight">
          <a href={`mailto:${r.email}`} className="link-vintage text-burgundy block">
            {r.email}
          </a>
          {r.phone ? (
            <a href={`tel:${r.phone}`} className="link-vintage text-burgundy block mt-1">
              {r.phone}
            </a>
          ) : null}
        </Td>
        <Td>
          <span
            className={`inline-block px-2 py-0.5 text-[0.7rem] uppercase tracking-wider border ${STATUS_STYLE[r.status]}`}
            style={{ fontWeight: 700 }}
          >
            {STATUS_LABEL[r.status]}
          </span>
        </Td>
        <Td>
          <button
            type="button"
            onClick={onToggle}
            className="text-burgundy text-sm link-vintage"
            style={{ fontWeight: 600 }}
          >
            {isOpen ? "Schließen" : "Details / Bearbeiten"}
          </button>
        </Td>
      </tr>
      {isOpen ? (
        <tr className="border-b border-ink/10 bg-paper-deep/30">
          <td colSpan={7} className="px-4 py-6">
            <ReservationDetails reservation={r} onUpdated={onUpdated} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ReservationDetails({
  reservation: r,
  onUpdated,
}: {
  reservation: AdminReservation;
  onUpdated: () => void;
}) {
  const [adminNote, setAdminNote] = useState("");
  const [proposedTime, setProposedTime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const slots = useMemo(
    () => slotsForDate(r.reservation_date).filter((s) => s !== r.reservation_time),
    [r.reservation_date, r.reservation_time],
  );

  async function callAction(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/admin/reservations/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error ?? "Aktion fehlgeschlagen.");
      return;
    }
    onUpdated();
  }

  function handleConfirm() {
    startTransition(() => {
      callAction({ action: "confirm", adminNote });
    });
  }
  function handleDecline() {
    startTransition(() => {
      callAction({ action: "decline", adminNote });
    });
  }
  function handlePropose() {
    if (!proposedTime) {
      setError("Bitte eine alternative Uhrzeit auswählen.");
      return;
    }
    if (!isTimeAllowedForDate(r.reservation_date, proposedTime)) {
      setError("Diese Uhrzeit liegt außerhalb des Buchungsfensters.");
      return;
    }
    startTransition(() => {
      callAction({ action: "propose", proposedTime, adminNote });
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div>
        <h4 className="label-bright text-ink-strong mb-3">Anfrage</h4>
        <dl className="text-sm space-y-2">
          <Dl k="Eingegangen" v={new Date(r.created_at).toLocaleString("de-DE")} />
          <Dl k="Pers." v={String(r.party_size)} />
          <Dl k="Anmerkung" v={r.notes ?? "—"} />
          {r.decided_at ? (
            <Dl
              k="Entschieden"
              v={new Date(r.decided_at).toLocaleString("de-DE")}
            />
          ) : null}
          {r.admin_note ? <Dl k="Letzter Notiz" v={r.admin_note} /> : null}
          {r.proposed_time ? (
            <Dl
              k="Vorschlag"
              v={`${formatDateGerman(fromIsoDate(r.proposed_date ?? r.reservation_date))} um ${r.proposed_time} Uhr`}
            />
          ) : null}
        </dl>
      </div>

      <div className="lg:col-span-2">
        <h4 className="label-bright text-ink-strong mb-3">Aktion</h4>

        <label className="block mb-4">
          <span className="block text-sm text-ink-strong mb-1.5">
            Notiz an den Gast (optional)
          </span>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={2}
            placeholder={`z. B. „Wir freuen uns auf Sie", „Leider voll an dem Tag" — wird in der E-Mail mitgeschickt.`}
            className="w-full px-3 py-2 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink text-sm"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="btn btn-primary disabled:opacity-60 text-xs"
          >
            Bestätigen + PDF senden
          </button>

          <div className="flex gap-2">
            <select
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
              disabled={pending}
              className="flex-1 px-2 py-2 bg-paper border border-ink/20 text-ink text-sm focus:border-burgundy focus:outline-none"
            >
              <option value="">Alt. Zeit…</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handlePropose}
              disabled={pending}
              className="btn btn-outline disabled:opacity-60 text-xs px-3"
              style={{ padding: "0.6rem 0.9rem" }}
            >
              Vorschlag
            </button>
          </div>

          <button
            type="button"
            onClick={handleDecline}
            disabled={pending}
            className="btn btn-outline disabled:opacity-60 text-xs"
          >
            Ablehnen
          </button>
        </div>

        {error ? (
          <p
            className="p-2 border-l-4 border-burgundy bg-burgundy/5 text-burgundy text-sm"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {pending ? (
          <p className="text-sm text-muted italic">Wird ausgeführt…</p>
        ) : null}
      </div>
    </div>
  );
}

function Dl({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-muted text-xs uppercase tracking-wider pt-0.5">
        {k}
      </dt>
      <dd className="flex-1 text-ink whitespace-pre-wrap break-words">{v}</dd>
    </div>
  );
}
