import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { deleteSetting, getSetting, setSetting } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GA4 IDs sind G-XXXXXXXXX (mind. 4 Zeichen Suffix). UA-IDs (Legacy) erlauben wir nicht. */
const GA_ID_PATTERN = /^G-[A-Z0-9]{4,16}$/;

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  return NextResponse.json({
    ga_measurement_id: getSetting("ga_measurement_id"),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: { ga_measurement_id?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const raw = body.ga_measurement_id;
  if (raw === null || raw === "") {
    deleteSetting("ga_measurement_id");
    return NextResponse.json({ ok: true, ga_measurement_id: null });
  }

  if (typeof raw !== "string") {
    return NextResponse.json(
      { error: "ga_measurement_id muss ein String sein." },
      { status: 400 },
    );
  }

  const trimmed = raw.trim().toUpperCase();
  if (!GA_ID_PATTERN.test(trimmed)) {
    return NextResponse.json(
      {
        error: `Format ungültig — erwartet wird eine GA4-Measurement-ID im Format „G-XXXXXXXXX".`,
      },
      { status: 400 },
    );
  }

  setSetting("ga_measurement_id", trimmed);
  return NextResponse.json({ ok: true, ga_measurement_id: trimmed });
}
