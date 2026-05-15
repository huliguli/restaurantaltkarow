import { NextResponse, type NextRequest } from "next/server";
import { sendMail } from "@/lib/mailer";
import { createReservation } from "@/lib/reservations";
import {
  isDateAllowed,
  isTimeAllowedForDate,
} from "@/lib/reservation-rules";
import {
  internalNewReservationMail,
  pendingGuestMail,
} from "@/lib/reservation-mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  dateIso: string;
  time: string;
  partySize: number;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  /** Honeypot */
  website?: string;
};

export async function POST(req: NextRequest) {
  let p: Payload;
  try {
    p = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Honeypot — Bot
  if (p.website && p.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // === Validierung =====================================================
  if (!p.dateIso || !/^\d{4}-\d{2}-\d{2}$/.test(p.dateIso)) {
    return NextResponse.json({ error: "Ungültiges Datum." }, { status: 400 });
  }
  if (!isDateAllowed(p.dateIso)) {
    return NextResponse.json(
      {
        error:
          "Das gewählte Datum ist nicht möglich (geschlossen oder zu kurzfristig).",
      },
      { status: 400 },
    );
  }
  if (!p.time || !/^\d{2}:\d{2}$/.test(p.time) || !isTimeAllowedForDate(p.dateIso, p.time)) {
    return NextResponse.json(
      { error: "Ungültige Uhrzeit für das gewählte Datum." },
      { status: 400 },
    );
  }
  if (!p.name?.trim() || !p.email?.trim()) {
    return NextResponse.json(
      { error: "Bitte Name und E-Mail angeben." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
    return NextResponse.json(
      { error: "Bitte eine gültige E-Mail-Adresse angeben." },
      { status: 400 },
    );
  }
  const partySize = Number(p.partySize);
  if (!Number.isFinite(partySize) || partySize < 1 || partySize > 80) {
    return NextResponse.json(
      { error: "Personenanzahl bitte zwischen 1 und 80." },
      { status: 400 },
    );
  }

  // === Speichern ========================================================
  const reservation = createReservation({
    date: p.dateIso,
    time: p.time,
    name: p.name.trim(),
    email: p.email.trim(),
    phone: p.phone?.trim() || undefined,
    partySize,
    notes: p.notes?.trim() || undefined,
  });

  // === Mails ============================================================
  // 1) Eingangsbestätigung an Gast
  // 2) Interne Benachrichtigung ans Restaurant
  // Wenn Mail-Versand scheitert, ist die Reservierung trotzdem gespeichert —
  // wir loggen und antworten dem User, dass er telefonisch nachhaken kann.
  try {
    const guest = pendingGuestMail(reservation);
    await sendMail({
      to: reservation.email,
      subject: guest.subject,
      text: guest.text,
      html: guest.html,
    });

    const internal = internalNewReservationMail(reservation);
    await sendMail({
      subject: internal.subject,
      text: internal.text,
      html: internal.html,
      replyTo: reservation.email,
    });
  } catch (err) {
    console.error("Mail-Versand bei Reservierung fehlgeschlagen:", err);
    // Reservierung steht trotzdem in der DB — Admin sieht sie
    return NextResponse.json(
      {
        ok: true,
        warning:
          "Ihre Anfrage wurde gespeichert, der automatische Versand der Eingangsbestätigung hat allerdings nicht geklappt. Wir melden uns trotzdem zeitnah.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true });
}
