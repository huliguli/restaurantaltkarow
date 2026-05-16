import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Öffentliche Read-Only-Endpoint für die GA4 Measurement-ID.
 * Wird vom Browser geladen, sobald die Seite hochkommt — danach
 * entscheidet das Frontend (in Kombination mit Consent), ob gtag.js
 * geladen wird.
 *
 * Kein Auth nötig, weil die Measurement-ID öffentlich ist (steht
 * sowieso im HTML, sobald gtag eingebunden ist).
 */
export async function GET() {
  const id = getSetting("ga_measurement_id");
  return NextResponse.json(
    { id: id ?? null },
    {
      headers: {
        // kurzer Cache — neue ID wirkt nach max. 5 Min, ohne DB-Hammer
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
