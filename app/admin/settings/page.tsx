import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getSetting } from "@/lib/settings";
import { AdminNav } from "@/components/AdminNav";
import { AdminSettingsForm } from "@/components/AdminSettingsForm";

export const metadata: Metadata = {
  title: "Admin · Einstellungen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const gaId = getSetting("ga_measurement_id");

  return (
    <section className="min-h-[100svh] bg-paper py-28">
      <div className="container-wide">
        <AdminNav username={session.sub} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <h2
              className="font-serif text-2xl text-ink-strong"
              style={{ fontWeight: 700 }}
            >
              Analytics
            </h2>
            <p className="mt-3 text-ink-soft leading-relaxed text-sm">
              Google Analytics 4 wird ausschließlich nach Einwilligung der
              Besucher geladen. Der Cookie-Banner regelt den Consent — diese
              Einstellung steuert nur, an welches Property die anonymisierten
              Daten gesendet werden.
            </p>
            <p className="mt-3 text-muted leading-relaxed text-xs italic">
              Wenn keine ID gesetzt ist, wird gtag.js gar nicht erst geladen —
              egal welchen Consent der Besucher erteilt hat.
            </p>
          </div>

          <div className="lg:col-span-2 bg-paper-deep/40 border border-ink/10 p-6 sm:p-10 shadow-soft">
            <AdminSettingsForm initialGaId={gaId} />
          </div>
        </div>
      </div>
    </section>
  );
}
