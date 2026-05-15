import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Ornament } from "@/components/Ornament";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin · Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <section className="min-h-[100svh] flex items-center justify-center bg-paper py-28">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="text-center mb-10">
          <p className="eyebrow">Admin-Bereich</p>
          <h1
            className="mt-3 font-serif text-3xl text-ink-strong"
            style={{ fontWeight: 700 }}
          >
            Anmelden
          </h1>
          <div className="mt-5 flex justify-center">
            <Ornament />
          </div>
        </div>

        <div className="bg-paper-deep/40 border border-ink/10 p-8 shadow-soft">
          <AdminLoginForm />
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Nur autorisierte Mitarbeiter. Alle Anmeldeversuche werden geloggt.
        </p>
      </div>
    </section>
  );
}
