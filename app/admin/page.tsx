import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { listReservations } from "@/lib/reservations";
import { AdminReservationsTable } from "@/components/AdminReservationsTable";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export const metadata: Metadata = {
  title: "Admin · Reservierungen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const reservations = listReservations();

  return (
    <section className="min-h-[100svh] bg-paper py-28">
      <div className="container-wide">
        <header className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <p className="eyebrow">Admin · Reservierungen</p>
            <h1
              className="mt-2 font-serif text-4xl text-ink-strong"
              style={{ fontWeight: 700 }}
            >
              Reservierungsanfragen
            </h1>
            <p className="mt-2 text-ink-soft text-sm">
              Angemeldet als <strong>{session.sub}</strong>
            </p>
          </div>
          <AdminLogoutButton />
        </header>

        <div className="bg-paper-deep/30 border border-ink/10 p-6 sm:p-10 shadow-soft">
          <AdminReservationsTable reservations={reservations} />
        </div>
      </div>
    </section>
  );
}
