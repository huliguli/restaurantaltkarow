import { NextResponse, type NextRequest } from "next/server";
import { sendMail } from "@/lib/mailer";
import { BUFFET_META, type BuffetType } from "@/content/buffet";

export const runtime = "nodejs";

type Payload = {
  type: BuffetType;
  variantId: string;
  variantTitle: string;
  hauptgerichte: string[];
  beilagen: string[];
  vorspeisen: string[];
  suppen: string[];
  schnittchen: string[];
  desserts: string[];
  getraenke: { label: string; anzahl: string; sub?: string }[];
  bemerkungen: string;
  kontakt: {
    name: string;
    telefon: string;
    email: string;
    wann: string;
    personen: string;
  };
  /** Honeypot — wenn ausgefüllt, dann ist es ein Bot */
  website?: string;
};

function listOr(label: string, items: string[]): string {
  if (!items || items.length === 0) return `${label}: —`;
  return `${label}:\n${items.map((i) => `  • ${i}`).join("\n")}`;
}

function buildText(p: Payload): string {
  const lines = [
    `Anfrage über die Website (${p.type === "feier" ? "Feier-Buffet" : "Trauerfeier-Buffet"}).`,
    "",
    `Gewählte Variante: ${p.variantTitle}`,
    "",
    listOr("Hauptgerichte", p.hauptgerichte),
    "",
    listOr("Beilagen", p.beilagen),
    "",
    listOr("Suppen", p.suppen),
    "",
    listOr("Vorspeisen", p.vorspeisen),
    "",
    listOr("Schnittchen", p.schnittchen),
    "",
    listOr("Desserts", p.desserts),
    "",
  ];

  if (p.getraenke && p.getraenke.length > 0) {
    lines.push("Eröffnungsgetränke:");
    for (const g of p.getraenke) {
      lines.push(
        `  • ${g.label}${g.sub ? ` (${g.sub})` : ""} — Anzahl: ${g.anzahl || "?"}`,
      );
    }
    lines.push("");
  }

  if (p.bemerkungen?.trim()) {
    lines.push(`Bemerkungen:\n${p.bemerkungen.trim()}`, "");
  }

  lines.push(
    "Kontaktdaten:",
    `  Name:           ${p.kontakt.name}`,
    `  Telefon:        ${p.kontakt.telefon}`,
    `  E-Mail:         ${p.kontakt.email}`,
    `  Veranstaltung:  ${p.kontakt.wann}`,
    `  Personenanzahl: ${p.kontakt.personen}`,
  );

  return lines.join("\n");
}

function buildHtml(p: Payload): string {
  const list = (items: string[]) =>
    items.length === 0
      ? "<em>—</em>"
      : `<ul>${items.map((i) => `<li>${escape(i)}</li>`).join("")}</ul>`;

  const getraenkeHtml =
    p.getraenke && p.getraenke.length > 0
      ? `<h3>Eröffnungsgetränke</h3><ul>${p.getraenke
          .map(
            (g) =>
              `<li>${escape(g.label)}${g.sub ? ` (${escape(g.sub)})` : ""} — Anzahl: <strong>${escape(g.anzahl || "?")}</strong></li>`,
          )
          .join("")}</ul>`
      : "";

  return `
    <div style="font-family: Georgia, serif; max-width: 640px; color: #1f1610;">
      <h2 style="color: #6b1f24; border-bottom: 1px solid #c19a3a; padding-bottom: 8px;">
        Neue Anfrage — ${p.type === "feier" ? "Feier-Buffet" : "Trauerfeier-Buffet"}
      </h2>
      <p><strong>Gewählte Variante:</strong> ${escape(p.variantTitle)}</p>

      <h3>Hauptgerichte</h3>${list(p.hauptgerichte)}
      <h3>Beilagen</h3>${list(p.beilagen)}
      <h3>Suppen</h3>${list(p.suppen)}
      <h3>Vorspeisen</h3>${list(p.vorspeisen)}
      <h3>Schnittchen</h3>${list(p.schnittchen)}
      <h3>Desserts</h3>${list(p.desserts)}
      ${getraenkeHtml}
      ${
        p.bemerkungen?.trim()
          ? `<h3>Bemerkungen</h3><p style="white-space: pre-wrap;">${escape(p.bemerkungen.trim())}</p>`
          : ""
      }

      <h3>Kontaktdaten</h3>
      <table style="border-collapse: collapse;">
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Name</td><td><strong>${escape(p.kontakt.name)}</strong></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Telefon</td><td><a href="tel:${escape(p.kontakt.telefon)}">${escape(p.kontakt.telefon)}</a></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">E-Mail</td><td><a href="mailto:${escape(p.kontakt.email)}">${escape(p.kontakt.email)}</a></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Veranstaltung</td><td>${escape(p.kontakt.wann)}</td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Personenanzahl</td><td>${escape(p.kontakt.personen)}</td></tr>
      </table>

      <p style="margin-top: 24px; color: #5a5446; font-size: 12px;">
        Diese E-Mail wurde automatisch über das Anfrageformular auf
        restaurant-alt-karow.berlin erzeugt.
      </p>
    </div>
  `;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // === Honeypot ==========================================================
  if (payload.website && payload.website.trim() !== "") {
    // Bot — wir antworten freundlich, aber senden nicht.
    return NextResponse.json({ ok: true });
  }

  // === Basic-Validation =================================================
  if (!payload.type || !["feier", "trauerfeier"].includes(payload.type)) {
    return NextResponse.json({ error: "Unbekannter Buffet-Typ." }, { status: 400 });
  }
  if (!payload.variantId) {
    return NextResponse.json(
      { error: "Bitte eine Buffet-Variante wählen." },
      { status: 400 },
    );
  }
  const k = payload.kontakt;
  if (!k?.name || !k?.telefon || !k?.email || !k?.wann || !k?.personen) {
    return NextResponse.json(
      { error: `Pflichtfelder im Block „Kontaktdaten" fehlen.` },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k.email)) {
    return NextResponse.json(
      { error: "Bitte eine gültige E-Mail-Adresse angeben." },
      { status: 400 },
    );
  }
  const personenNum = Number(k.personen);
  if (!Number.isFinite(personenNum) || personenNum < 1) {
    return NextResponse.json(
      { error: "Personenanzahl bitte als Zahl angeben." },
      { status: 400 },
    );
  }

  // === Senden ============================================================
  const meta = BUFFET_META[payload.type];
  try {
    await sendMail({
      subject: `[Website] ${meta.emailSubject} — ${k.name} (${personenNum} Personen, ${k.wann})`,
      text: buildText(payload),
      html: buildHtml(payload),
      replyTo: k.email,
    });
  } catch (err) {
    console.error("Mail-Versand fehlgeschlagen:", err);
    return NextResponse.json(
      {
        error:
          "Die Anfrage konnte momentan nicht zugestellt werden. Bitte versuchen Sie es später erneut oder rufen Sie uns an.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
