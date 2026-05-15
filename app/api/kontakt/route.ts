import { NextResponse, type NextRequest } from "next/server";
import { sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

type Payload = {
  name: string;
  email: string;
  telefon?: string;
  anlass?: string;
  nachricht: string;
  /** Honeypot — wenn gefüllt = Bot */
  website?: string;
};

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

  // Honeypot
  if (payload.website && payload.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Validation
  if (!payload.name?.trim() || !payload.email?.trim() || !payload.nachricht?.trim()) {
    return NextResponse.json(
      { error: "Bitte Name, E-Mail und Nachricht ausfüllen." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    return NextResponse.json(
      { error: "Bitte eine gültige E-Mail-Adresse angeben." },
      { status: 400 },
    );
  }
  if (payload.nachricht.length > 5000) {
    return NextResponse.json(
      { error: "Nachricht zu lang (max. 5000 Zeichen)." },
      { status: 400 },
    );
  }

  const anlass = payload.anlass?.trim() || "Allgemeine Anfrage";

  const text = [
    `Neue Nachricht über das Kontaktformular auf restaurant-alt-karow.de.`,
    "",
    `Anlass:   ${anlass}`,
    `Name:     ${payload.name}`,
    `E-Mail:   ${payload.email}`,
    `Telefon:  ${payload.telefon?.trim() || "—"}`,
    "",
    "Nachricht:",
    payload.nachricht.trim(),
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 640px; color: #1f1610;">
      <h2 style="color: #6b1f24; border-bottom: 1px solid #c19a3a; padding-bottom: 8px;">
        Kontaktanfrage — ${escape(anlass)}
      </h2>
      <table style="border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Name</td><td><strong>${escape(payload.name)}</strong></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">E-Mail</td><td><a href="mailto:${escape(payload.email)}">${escape(payload.email)}</a></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #5a5446;">Telefon</td><td>${payload.telefon?.trim() ? `<a href="tel:${escape(payload.telefon)}">${escape(payload.telefon)}</a>` : "<em>—</em>"}</td></tr>
      </table>
      <h3>Nachricht</h3>
      <p style="white-space: pre-wrap; line-height: 1.6;">${escape(payload.nachricht.trim())}</p>
      <p style="margin-top: 24px; color: #5a5446; font-size: 12px;">
        Diese E-Mail wurde automatisch über das Kontaktformular erzeugt.
      </p>
    </div>
  `;

  try {
    await sendMail({
      subject: `[Website] ${anlass} — ${payload.name}`,
      text,
      html,
      replyTo: payload.email,
    });
  } catch (err) {
    console.error("Kontakt-Mail-Versand fehlgeschlagen:", err);
    return NextResponse.json(
      {
        error:
          "Die Nachricht konnte momentan nicht zugestellt werden. Bitte versuchen Sie es später erneut oder rufen Sie uns an.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
