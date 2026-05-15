import nodemailer, { type Transporter } from "nodemailer";

/**
 * Singleton-Transporter — wird beim ersten Aufruf erzeugt und für die
 * Lebensdauer des Server-Prozesses wiederverwendet. Nodemailer öffnet
 * keine persistente Verbindung, hält aber Auth-Daten und Config gecached.
 */
let cached: Transporter | null = null;

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Mailer-Konfiguration fehlt: Umgebungsvariable ${name} ist nicht gesetzt.`,
    );
  }
  return value;
}

export function getMailer(): Transporter {
  if (cached) return cached;

  const host = getEnvOrThrow("EMAIL_HOST");
  const port = Number(process.env.EMAIL_PORT ?? 465);
  const user = getEnvOrThrow("EMAIL_USER");
  const pass = getEnvOrThrow("EMAIL_PASS");

  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = TLS, 587 = STARTTLS
    auth: { user, pass },
  });

  return cached;
}

export type MailAttachment = {
  filename: string;
  content: Buffer | Uint8Array;
  contentType?: string;
};

export type OutgoingMail = {
  subject: string;
  text: string;
  html?: string;
  /** Antwortadresse — z. B. der Absender des Formulars, damit der
   *  Restaurant-Betreiber direkt antworten kann. */
  replyTo?: string;
  /** Überschreibt EMAIL_TO — wird bei Mails AN den Gast genutzt. */
  to?: string;
  attachments?: MailAttachment[];
};

export async function sendMail(payload: OutgoingMail): Promise<void> {
  const transporter = getMailer();
  const user = getEnvOrThrow("EMAIL_USER");
  const fallbackTo = process.env.EMAIL_TO ?? user;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Restaurant Alt-Karow";

  await transporter.sendMail({
    // Strato verlangt, dass das From-Header-„Adresspart" identisch zum
    // SMTP-AUTH-User ist. Anzeigename darf abweichen.
    from: `"${fromName}" <${user}>`,
    to: payload.to ?? fallbackTo,
    replyTo: payload.replyTo,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    attachments: payload.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content instanceof Buffer ? a.content : Buffer.from(a.content),
      contentType: a.contentType,
    })),
  });
}
