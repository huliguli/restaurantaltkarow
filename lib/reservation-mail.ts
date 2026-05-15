/**
 * Mail-Templates für Reservierungen.
 * Vier Anlässe:
 *   - pending   : Eingangsbestätigung an den Gast (noch nicht verbindlich)
 *   - confirmed : verbindliche Bestätigung an den Gast (mit PDF-Anhang)
 *   - declined  : Absage an den Gast
 *   - proposed  : Alternativtermin-Vorschlag an den Gast
 *
 * Plus eine interne Mail an das Restaurant bei jeder neuen Anfrage.
 */

import { siteConfig } from "./siteConfig";
import { formatDateGerman, fromIsoDate } from "./reservation-rules";
import type { ReservationRow } from "./db";

function escape(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SIGNATURE_TEXT = `

Herzliche Grüße
${siteConfig.name}
${siteConfig.address.street}, ${siteConfig.address.zip} ${siteConfig.address.city}
${siteConfig.phone}`;

const SIGNATURE_HTML = `
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #c19a3a; color: #34281c; font-size: 14px; line-height: 1.6;">
    <p style="margin: 0;"><strong>${escape(siteConfig.name)}</strong></p>
    <p style="margin: 4px 0 0;">${escape(siteConfig.address.street)} · ${escape(siteConfig.address.zip)} ${escape(siteConfig.address.city)}</p>
    <p style="margin: 4px 0 0;">
      Telefon: <a href="tel:${escape(siteConfig.phoneHref)}" style="color: #6e1f24;">${escape(siteConfig.phone)}</a>
    </p>
  </div>
`;

function wrapHtml(inner: string): string {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 640px; color: #15120c; line-height: 1.65;">
      ${inner}
      ${SIGNATURE_HTML}
    </div>
  `;
}

function fmtDateTime(date: string, time: string): string {
  return `${formatDateGerman(fromIsoDate(date))} um ${time} Uhr`;
}

// ============================================================
// PENDING — Eingangsbestätigung an den Gast
// ============================================================

export function pendingGuestMail(r: ReservationRow) {
  const subject = `Ihre Reservierungsanfrage im Restaurant Alt-Karow`;
  const dt = fmtDateTime(r.reservation_date, r.reservation_time);
  const text = `Liebe(r) ${r.name},

vielen Dank für Ihre Reservierungsanfrage im Restaurant Alt-Karow.

Wir haben folgende Anfrage erhalten:

  Datum & Uhrzeit:  ${dt}
  Personenanzahl:   ${r.party_size}
${r.notes ? `  Anmerkung:        ${r.notes}\n` : ""}

WICHTIG: Diese E-Mail ist NOCH KEINE verbindliche Bestätigung. Wir prüfen
jede Anfrage persönlich und melden uns in der Regel innerhalb weniger
Stunden — entweder mit einer endgültigen Bestätigung, einem
Alternativvorschlag oder, falls wir leider nichts machen können, mit
einer Absage.

Vielen Dank für Ihre Geduld.${SIGNATURE_TEXT}`;

  const html = wrapHtml(`
    <h2 style="color: #6e1f24; font-weight: 700; margin-top: 0;">Ihre Reservierungsanfrage</h2>
    <p>Liebe(r) ${escape(r.name)},</p>
    <p>vielen Dank für Ihre Reservierungsanfrage im Restaurant Alt-Karow.</p>
    <p>Wir haben folgende Anfrage erhalten:</p>
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Datum &amp; Uhrzeit</td><td><strong>${escape(dt)}</strong></td></tr>
      <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Personenanzahl</td><td><strong>${r.party_size}</strong></td></tr>
      ${r.notes ? `<tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Anmerkung</td><td>${escape(r.notes)}</td></tr>` : ""}
    </table>
    <div style="margin: 24px 0; padding: 16px 20px; border-left: 4px solid #c19a3a; background: #faf6e8;">
      <p style="margin: 0;"><strong>Wichtig:</strong> Diese E-Mail ist noch <em>keine</em> verbindliche Bestätigung. Wir prüfen jede Anfrage persönlich und melden uns in der Regel innerhalb weniger Stunden — entweder mit einer endgültigen Bestätigung, einem Alternativvorschlag oder, falls wir leider nichts machen können, mit einer Absage.</p>
    </div>
    <p>Vielen Dank für Ihre Geduld.</p>
  `);
  return { subject, text, html };
}

// ============================================================
// CONFIRMED — verbindliche Bestätigung (PDF kommt als Attachment dazu)
// ============================================================

export function confirmedGuestMail(r: ReservationRow) {
  const subject = `Reservierung bestätigt — ${formatDateGerman(fromIsoDate(r.reservation_date))} im Restaurant Alt-Karow`;
  const dt = fmtDateTime(r.reservation_date, r.reservation_time);
  const text = `Liebe(r) ${r.name},

Ihre Reservierung im Restaurant Alt-Karow ist hiermit verbindlich bestätigt.

  Datum & Uhrzeit:  ${dt}
  Personenanzahl:   ${r.party_size}
${r.notes ? `  Anmerkung:        ${r.notes}\n` : ""}
Im Anhang dieser E-Mail finden Sie Ihre Reservierungsbestätigung als PDF.
Wir freuen uns auf Ihren Besuch!

Sollten Sie kurzfristig verhindert sein oder die Reservierung ändern wollen,
geben Sie uns bitte telefonisch unter ${siteConfig.phone} Bescheid.${SIGNATURE_TEXT}`;

  const html = wrapHtml(`
    <h2 style="color: #6e1f24; font-weight: 700; margin-top: 0;">Reservierung bestätigt</h2>
    <p>Liebe(r) ${escape(r.name)},</p>
    <p>Ihre Reservierung im Restaurant Alt-Karow ist hiermit <strong>verbindlich bestätigt</strong>.</p>
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Datum &amp; Uhrzeit</td><td><strong>${escape(dt)}</strong></td></tr>
      <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Personenanzahl</td><td><strong>${r.party_size}</strong></td></tr>
      ${r.notes ? `<tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Anmerkung</td><td>${escape(r.notes)}</td></tr>` : ""}
    </table>
    <p>Im Anhang dieser E-Mail finden Sie Ihre Reservierungsbestätigung als PDF.</p>
    <p>Wir freuen uns auf Ihren Besuch!</p>
    <p style="color: #5a5446; font-size: 14px;">Sollten Sie kurzfristig verhindert sein oder die Reservierung ändern wollen, geben Sie uns bitte telefonisch unter <a href="tel:${escape(siteConfig.phoneHref)}" style="color: #6e1f24;">${escape(siteConfig.phone)}</a> Bescheid.</p>
  `);
  return { subject, text, html };
}

// ============================================================
// DECLINED — Absage
// ============================================================

export function declinedGuestMail(r: ReservationRow, adminNote?: string) {
  const subject = `Ihre Reservierungsanfrage — Restaurant Alt-Karow`;
  const dt = fmtDateTime(r.reservation_date, r.reservation_time);
  const text = `Liebe(r) ${r.name},

vielen Dank für Ihre Anfrage. Leider können wir Ihre Reservierung am
${dt} für ${r.party_size} Personen nicht annehmen.${adminNote ? `\n\nUnser Hinweis: ${adminNote}` : ""}

Wir bitten um Ihr Verständnis und freuen uns sehr, wenn Sie es an einem
anderen Tag erneut bei uns versuchen — gerne auch telefonisch unter
${siteConfig.phone}, dann finden wir gemeinsam einen passenden Termin.${SIGNATURE_TEXT}`;

  const html = wrapHtml(`
    <h2 style="color: #6e1f24; font-weight: 700; margin-top: 0;">Ihre Reservierungsanfrage</h2>
    <p>Liebe(r) ${escape(r.name)},</p>
    <p>vielen Dank für Ihre Anfrage. Leider können wir Ihre Reservierung am <strong>${escape(dt)}</strong> für <strong>${r.party_size} Personen</strong> nicht annehmen.</p>
    ${
      adminNote
        ? `<div style="margin: 24px 0; padding: 16px 20px; border-left: 4px solid #c19a3a; background: #faf6e8;"><p style="margin: 0;"><strong>Unser Hinweis:</strong> ${escape(adminNote)}</p></div>`
        : ""
    }
    <p>Wir bitten um Ihr Verständnis und freuen uns sehr, wenn Sie es an einem anderen Tag erneut bei uns versuchen — gerne auch telefonisch unter <a href="tel:${escape(siteConfig.phoneHref)}" style="color: #6e1f24;">${escape(siteConfig.phone)}</a>, dann finden wir gemeinsam einen passenden Termin.</p>
  `);
  return { subject, text, html };
}

// ============================================================
// PROPOSED — Alternativvorschlag
// ============================================================

export function proposedGuestMail(
  r: ReservationRow,
  proposedTime: string,
  adminNote?: string,
) {
  const subject = `Alternativvorschlag zu Ihrer Reservierung — Restaurant Alt-Karow`;
  const orig = fmtDateTime(r.reservation_date, r.reservation_time);
  const newDt = fmtDateTime(r.reservation_date, proposedTime);

  const text = `Liebe(r) ${r.name},

vielen Dank für Ihre Reservierungsanfrage.

Zu Ihrem Wunschtermin (${orig}) für ${r.party_size} Personen haben wir
leider keinen Platz frei. Wir möchten Ihnen aber gerne folgenden
Alternativtermin am gleichen Tag vorschlagen:

  ➜ ${newDt}
  Personen: ${r.party_size}
${adminNote ? `\nUnser Hinweis: ${adminNote}\n` : ""}
Wenn Ihnen der Alternativtermin passt, antworten Sie bitte kurz auf diese
E-Mail oder rufen Sie uns an — wir reservieren den Tisch dann verbindlich
für Sie.

Telefon: ${siteConfig.phone}${SIGNATURE_TEXT}`;

  const html = wrapHtml(`
    <h2 style="color: #6e1f24; font-weight: 700; margin-top: 0;">Alternativvorschlag</h2>
    <p>Liebe(r) ${escape(r.name)},</p>
    <p>vielen Dank für Ihre Reservierungsanfrage.</p>
    <p>Zu Ihrem Wunschtermin (<strong>${escape(orig)}</strong>) für <strong>${r.party_size} Personen</strong> haben wir leider keinen Platz frei. Wir möchten Ihnen aber gerne folgenden Alternativtermin <strong>am gleichen Tag</strong> vorschlagen:</p>
    <div style="margin: 24px 0; padding: 20px 24px; border-left: 4px solid #6e1f24; background: #faf6e8;">
      <p style="margin: 0; font-family: Georgia, serif; font-size: 18px;"><strong>${escape(newDt)}</strong></p>
      <p style="margin: 8px 0 0; color: #5a5446;">Personen: <strong>${r.party_size}</strong></p>
    </div>
    ${
      adminNote
        ? `<div style="margin: 24px 0; padding: 16px 20px; border-left: 4px solid #c19a3a; background: #faf6e8;"><p style="margin: 0;"><strong>Unser Hinweis:</strong> ${escape(adminNote)}</p></div>`
        : ""
    }
    <p>Wenn Ihnen der Alternativtermin passt, antworten Sie bitte kurz auf diese E-Mail oder rufen Sie uns an — wir reservieren den Tisch dann verbindlich für Sie.</p>
    <p>Telefon: <a href="tel:${escape(siteConfig.phoneHref)}" style="color: #6e1f24;">${escape(siteConfig.phone)}</a></p>
  `);
  return { subject, text, html };
}

// ============================================================
// INTERNE Mail an das Restaurant bei neuer Anfrage
// ============================================================

export function internalNewReservationMail(r: ReservationRow) {
  const subject = `[Reservierung] ${r.name} · ${r.party_size} Pers · ${r.reservation_date} ${r.reservation_time}`;
  const dt = fmtDateTime(r.reservation_date, r.reservation_time);
  const text = `Neue Reservierungsanfrage über die Website.

  Datum & Uhrzeit:  ${dt}
  Personenanzahl:   ${r.party_size}
  Name:             ${r.name}
  E-Mail:           ${r.email}
  Telefon:          ${r.phone || "—"}
${r.notes ? `  Anmerkung:        ${r.notes}\n` : ""}

Status: pending — bitte im Admin-Bereich bearbeiten:
${siteConfig.url}/admin
`;
  const html = `
    <div style="font-family: Georgia, serif; max-width: 640px; color: #15120c;">
      <h2 style="color: #6e1f24; border-bottom: 1px solid #c19a3a; padding-bottom: 8px;">
        Neue Reservierungsanfrage
      </h2>
      <table style="border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Datum &amp; Uhrzeit</td><td><strong>${escape(dt)}</strong></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Personenanzahl</td><td><strong>${r.party_size}</strong></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Name</td><td>${escape(r.name)}</td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">E-Mail</td><td><a href="mailto:${escape(r.email)}">${escape(r.email)}</a></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Telefon</td><td>${r.phone ? `<a href="tel:${escape(r.phone)}">${escape(r.phone)}</a>` : "<em>—</em>"}</td></tr>
        ${r.notes ? `<tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Anmerkung</td><td style="white-space: pre-wrap;">${escape(r.notes)}</td></tr>` : ""}
      </table>
      <p style="margin-top: 24px;">
        Status: <strong>pending</strong> · Bearbeiten im
        <a href="${escape(siteConfig.url)}/admin" style="color: #6e1f24;">Admin-Bereich</a>.
      </p>
    </div>
  `;
  return { subject, text, html };
}
