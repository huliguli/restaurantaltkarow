"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "./AdminLogoutButton";

const NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: "/admin", label: "Reservierungen", exact: true },
  { href: "/admin/settings", label: "Einstellungen" },
];

export function AdminNav({ username }: { username: string }) {
  const pathname = usePathname() ?? "";

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-12">
      <div>
        <p className="eyebrow">Admin</p>
        <nav className="mt-2 flex flex-wrap gap-x-7 gap-y-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-serif text-2xl sm:text-3xl ${
                  active ? "text-ink-strong" : "text-muted hover:text-ink"
                } transition-colors`}
                style={{ fontWeight: active ? 700 : 500 }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-2 text-ink-soft text-sm">
          Angemeldet als <strong>{username}</strong>
        </p>
      </div>
      <AdminLogoutButton />
    </header>
  );
}
