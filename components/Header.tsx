"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation, siteConfig } from "@/lib/siteConfig";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";
  const overHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Backdrop — IMMER massiv dunkel über Hero, kein transparenter Fade.
  // Sobald gescrollt oder auf Unterseiten: solider heller Paper-Backdrop.
  const headerBg = overHero
    ? "bg-wood/90 backdrop-blur-md border-b border-gold/20 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.55)]"
    : "bg-paper/97 backdrop-blur-md border-b border-ink/10 shadow-[0_4px_24px_-16px_rgba(15,8,4,0.5)]";

  const logoColor = overHero ? "text-paper" : "text-ink-strong";
  const eyebrowColor = overHero ? "text-gold-soft" : "text-gold";
  const navLinkColor = overHero ? "text-paper" : "text-ink-strong";
  const navHoverColor = overHero
    ? "hover:text-gold-soft"
    : "hover:text-burgundy";
  const burgerColor = overHero ? "bg-paper" : "bg-ink-strong";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,box-shadow,border-color] duration-500 ease-out ${headerBg}`}
    >
      <div className="container-wide flex items-center justify-between py-5">
        <Link
          href="/"
          className="flex flex-col leading-tight transition-colors duration-500"
          aria-label="Zur Startseite"
        >
          <span
            className={`font-serif text-2xl sm:text-[1.75rem] tracking-tight transition-colors duration-500 ${logoColor}`}
            style={{ fontWeight: 700 }}
          >
            Restaurant Alt-Karow
          </span>
          <span
            className={`mt-0.5 font-sans tracking-[0.28em] uppercase text-[0.68rem] sm:text-[0.7rem] font-semibold transition-colors duration-500 ${eyebrowColor}`}
          >
            Berlin · seit jeher
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const activeColor = overHero ? "text-gold-soft" : "text-burgundy";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-sans text-[0.95rem] tracking-wide link-vintage transition-colors duration-300 ${
                  active ? activeColor : `${navLinkColor} ${navHoverColor}`
                }`}
                style={{ fontWeight: 600 }}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/reservieren"
            className={overHero ? "btn btn-cream" : "btn btn-primary"}
          >
            Reservieren
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden flex flex-col gap-1.5 p-2"
        >
          <span
            className={`block h-[2px] w-8 transition-all duration-300 ${burgerColor} ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-8 transition-opacity duration-300 ${burgerColor} ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-8 transition-all duration-300 ${burgerColor} ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu — IMMER mit hellem Paper-Backdrop und dunklem Text, völlig unabhängig vom overHero-Modus, damit das Menü überall lesbar ist. */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-500 ease-out ${
          open ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container-wide flex flex-col gap-5 py-7 bg-paper border-t border-ink/15">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-serif text-2xl text-ink-strong link-vintage"
              style={{ fontWeight: 600 }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/reservieren"
            className="btn btn-primary self-start mt-3"
          >
            Reservieren
          </Link>
          <a
            href={`tel:${siteConfig.phoneHref}`}
            className="text-sm text-ink-strong link-vintage mt-1"
          >
            Oder telefonisch: {siteConfig.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
