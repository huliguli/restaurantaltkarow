import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ReservationRow } from "./db";
import { siteConfig } from "./siteConfig";
import { formatDateGerman, fromIsoDate } from "./reservation-rules";

/**
 * Erzeugt eine elegante PDF-Reservierungsbestätigung als Buffer.
 * Wird im Bestätigungs-Mail als Attachment angehängt.
 *
 * Pdf-lib ist hier bewusst ohne externe Schrift verwendet —
 * StandardFonts.TimesRoman + TimesRomanBold genügen für ein
 * klassisches, gut lesbares Layout.
 */
export async function buildReservationPdf(
  r: ReservationRow,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4

  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  const ink = rgb(0.06, 0.04, 0.03);
  const muted = rgb(0.36, 0.32, 0.27);
  const burgundy = rgb(0.43, 0.12, 0.14);
  const gold = rgb(0.76, 0.6, 0.23);

  const { width, height } = page.getSize();
  const margin = 56;

  // ===== Kopf =====
  page.drawText("RESTAURANT ALT-KAROW", {
    x: margin,
    y: height - margin - 4,
    size: 11,
    font: serifBold,
    color: muted,
  });

  // Goldene Trennlinie
  page.drawLine({
    start: { x: margin, y: height - margin - 22 },
    end: { x: width - margin, y: height - margin - 22 },
    thickness: 0.6,
    color: gold,
  });

  // ===== Titel =====
  const titleY = height - margin - 80;
  page.drawText("Reservierungsbestätigung", {
    x: margin,
    y: titleY,
    size: 28,
    font: serifBold,
    color: ink,
  });
  page.drawText("Wir freuen uns auf Ihren Besuch.", {
    x: margin,
    y: titleY - 26,
    size: 13,
    font: serifItalic,
    color: muted,
  });

  // ===== Details-Box =====
  const boxTop = titleY - 70;
  const boxHeight = 180;
  const boxY = boxTop - boxHeight;
  page.drawRectangle({
    x: margin,
    y: boxY,
    width: width - margin * 2,
    height: boxHeight,
    color: rgb(0.98, 0.96, 0.92),
    borderColor: rgb(0.06, 0.04, 0.03),
    borderWidth: 0.4,
  });

  const labelSize = 9;
  const valueSize = 14;
  const rows: { label: string; value: string }[] = [
    {
      label: "DATUM",
      value: formatDateGerman(fromIsoDate(r.reservation_date)),
    },
    { label: "UHRZEIT", value: `${r.reservation_time} Uhr` },
    { label: "PERSONEN", value: String(r.party_size) },
    { label: "GAST", value: r.name },
  ];

  const colGap = 24;
  const colWidth = (width - margin * 2 - colGap) / 2;
  rows.forEach((row, i) => {
    const col = i % 2;
    const rowIdx = Math.floor(i / 2);
    const x = margin + 18 + col * (colWidth + colGap / 2);
    const y = boxTop - 28 - rowIdx * 70;
    page.drawText(row.label, {
      x,
      y,
      size: labelSize,
      font: serifBold,
      color: muted,
    });
    page.drawText(row.value, {
      x,
      y: y - 22,
      size: valueSize,
      font: serif,
      color: ink,
    });
  });

  // ===== Anmerkung =====
  let cursor = boxY - 36;
  if (r.notes) {
    page.drawText("ANMERKUNG", {
      x: margin,
      y: cursor,
      size: labelSize,
      font: serifBold,
      color: muted,
    });
    cursor -= 18;
    const wrapped = wrapText(r.notes, 80);
    for (const line of wrapped) {
      page.drawText(line, {
        x: margin,
        y: cursor,
        size: 11,
        font: serif,
        color: ink,
      });
      cursor -= 14;
    }
    cursor -= 12;
  }

  // ===== Hinweis-Block =====
  cursor -= 12;
  page.drawLine({
    start: { x: margin, y: cursor },
    end: { x: margin + 32, y: cursor },
    thickness: 0.5,
    color: gold,
  });
  cursor -= 24;
  const hinweise = [
    "Diese Bestätigung gilt für den oben genannten Zeitpunkt.",
    "Bei Verspätung von mehr als 15 Minuten bitten wir um kurze Nachricht.",
    "Stornierung oder Änderungen bitte telefonisch unter " +
      siteConfig.phone +
      ".",
  ];
  for (const line of hinweise) {
    page.drawText(line, {
      x: margin,
      y: cursor,
      size: 10.5,
      font: serif,
      color: ink,
    });
    cursor -= 16;
  }

  // ===== Footer =====
  const footerY = margin + 40;
  page.drawLine({
    start: { x: margin, y: footerY + 24 },
    end: { x: width - margin, y: footerY + 24 },
    thickness: 0.4,
    color: rgb(0.06, 0.04, 0.03),
  });

  page.drawText(siteConfig.name, {
    x: margin,
    y: footerY + 6,
    size: 12,
    font: serifBold,
    color: ink,
  });
  page.drawText(
    `${siteConfig.address.street} · ${siteConfig.address.zip} ${siteConfig.address.city}`,
    {
      x: margin,
      y: footerY - 8,
      size: 10,
      font: serif,
      color: muted,
    },
  );
  page.drawText(`Telefon: ${siteConfig.phone}`, {
    x: margin,
    y: footerY - 22,
    size: 10,
    font: serif,
    color: muted,
  });

  // Reservierungs-Nr. rechts unten
  page.drawText(`Reservierungs-Nr.: ${String(r.id).padStart(5, "0")}`, {
    x: width - margin - 160,
    y: footerY - 8,
    size: 9,
    font: serif,
    color: muted,
  });
  page.drawText(`bestätigt: ${new Date().toLocaleDateString("de-DE")}`, {
    x: width - margin - 160,
    y: footerY - 22,
    size: 9,
    font: serif,
    color: muted,
  });

  // Dekoratives Burgund-Akzentband links
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 6,
    height,
    color: burgundy,
  });

  return pdf.save();
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      lines.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}
