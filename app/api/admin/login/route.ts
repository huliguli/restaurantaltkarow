import { NextResponse, type NextRequest } from "next/server";
import { setSessionCookie, verifyCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Bitte Benutzername und Passwort angeben." },
      { status: 400 },
    );
  }

  let ok = false;
  try {
    ok = await verifyCredentials(username, password);
  } catch (err) {
    console.error("Admin-Login-Verifikation fehlgeschlagen:", err);
    return NextResponse.json(
      { error: "Server-Konfiguration fehlerhaft. Bitte später erneut versuchen." },
      { status: 500 },
    );
  }

  if (!ok) {
    // Generische Fehlermeldung — keine Hinweise, ob User oder Passwort falsch.
    return NextResponse.json(
      { error: "Benutzername oder Passwort falsch." },
      { status: 401 },
    );
  }

  await setSessionCookie(username);
  return NextResponse.json({ ok: true });
}
