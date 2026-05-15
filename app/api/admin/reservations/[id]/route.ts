import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getReservationById,
  updateReservationStatus,
} from "@/lib/reservations";
import { sendMail } from "@/lib/mailer";
import {
  confirmedGuestMail,
  declinedGuestMail,
  proposedGuestMail,
} from "@/lib/reservation-mail";
import { buildReservationPdf } from "@/lib/reservation-pdf";
import { isTimeAllowedForDate } from "@/lib/reservation-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action =
  | { action: "confirm"; adminNote?: string }
  | { action: "decline"; adminNote?: string }
  | { action: "propose"; proposedTime: string; adminNote?: string };

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  // === Auth ============================================================
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id: idParam } = await ctx.params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
  }

  const reservation = getReservationById(id);
  if (!reservation) {
    return NextResponse.json(
      { error: "Reservierung nicht gefunden." },
      { status: 404 },
    );
  }

  let body: Action;
  try {
    body = (await req.json()) as Action;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // === CONFIRM =========================================================
  if (body.action === "confirm") {
    const updated = updateReservationStatus(id, {
      status: "confirmed",
      admin_note: body.adminNote ?? null,
    });
    if (!updated) {
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
    }

    try {
      const mail = confirmedGuestMail(updated);
      const pdfBytes = await buildReservationPdf(updated);
      await sendMail({
        to: updated.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        attachments: [
          {
            filename: `Reservierungsbestaetigung-${String(updated.id).padStart(5, "0")}.pdf`,
            content: pdfBytes,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (err) {
      console.error("Bestätigungs-Mail fehlgeschlagen:", err);
      return NextResponse.json(
        { ok: true, warning: "Status aktualisiert, aber Mail-Versand fehlgeschlagen." },
        { status: 200 },
      );
    }
    return NextResponse.json({ ok: true, reservation: updated });
  }

  // === DECLINE =========================================================
  if (body.action === "decline") {
    const updated = updateReservationStatus(id, {
      status: "declined",
      admin_note: body.adminNote ?? null,
    });
    if (!updated) {
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
    }
    try {
      const mail = declinedGuestMail(updated, body.adminNote);
      await sendMail({
        to: updated.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
    } catch (err) {
      console.error("Absage-Mail fehlgeschlagen:", err);
      return NextResponse.json(
        { ok: true, warning: "Status aktualisiert, aber Mail-Versand fehlgeschlagen." },
        { status: 200 },
      );
    }
    return NextResponse.json({ ok: true, reservation: updated });
  }

  // === PROPOSE =========================================================
  if (body.action === "propose") {
    if (!body.proposedTime || !/^\d{2}:\d{2}$/.test(body.proposedTime)) {
      return NextResponse.json(
        { error: "Bitte gültige Alternativzeit angeben." },
        { status: 400 },
      );
    }
    if (!isTimeAllowedForDate(reservation.reservation_date, body.proposedTime)) {
      return NextResponse.json(
        {
          error:
            "Die Alternativzeit liegt außerhalb der Öffnungszeiten / des erlaubten Buchungsfensters.",
        },
        { status: 400 },
      );
    }

    const updated = updateReservationStatus(id, {
      status: "change_proposed",
      admin_note: body.adminNote ?? null,
      proposed_date: reservation.reservation_date,
      proposed_time: body.proposedTime,
    });
    if (!updated) {
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
    }
    try {
      const mail = proposedGuestMail(updated, body.proposedTime, body.adminNote);
      await sendMail({
        to: updated.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
    } catch (err) {
      console.error("Vorschlags-Mail fehlgeschlagen:", err);
      return NextResponse.json(
        { ok: true, warning: "Status aktualisiert, aber Mail-Versand fehlgeschlagen." },
        { status: 200 },
      );
    }
    return NextResponse.json({ ok: true, reservation: updated });
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
}
