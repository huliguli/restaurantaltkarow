import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { listReservations } from "@/lib/reservations";
import { AdminReservationsTable } from "@/components/AdminReservationsTable";
import { AdminNav } from "@/components/AdminNav";

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
        <AdminNav username={session.sub} />

        <div className="bg-paper-deep/30 border border-ink/10 p-6 sm:p-10 shadow-soft">
          <AdminReservationsTable reservations={reservations} />
        </div>
      </div>
    </section>
  );
}
