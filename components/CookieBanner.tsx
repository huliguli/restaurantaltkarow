"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  readConsent,
  REOPEN_BANNER_EVENT,
  writeConsent,
} from "@/lib/cookie-consent";

export function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);

  useEffect(() => {
    // Initial: nur anzeigen, wenn noch keine Entscheidung vorliegt
    const consent = readConsent();
    if (!consent) setVisible(true);

    const onReopen = () => {
      const c = readConsent();
      setAnalyticsOn(c?.categories.analytics ?? false);
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener(REOPEN_BANNER_EVENT, onReopen);
    return () => window.removeEventListener(REOPEN_BANNER_EVENT, onReopen);
  }, []);

  // Im Admin-Bereich nicht anzeigen — Admin hat implizit zugestimmt
  if (pathname?.startsWith("/admin")) return null;
  if (!visible) return null;

  const acceptAll = () => {
    writeConsent({ necessary: true, analytics: true });
    setVisible(false);
  };
  const rejectAll = () => {
    writeConsent({ necessary: true, analytics: false });
    setVisible(false);
  };
  const saveCustom = () => {
    writeConsent({ necessary: true, analytics: analyticsOn });
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-modal="false"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5"
    >
      <div className="container-wide mx-auto bg-wood text-paper border border-gold/45 shadow-warm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
            <div className="flex-1">
              <p className="label-bright">Datenschutz</p>
              <h2
                id="cookie-banner-title"
                className="mt-2 font-serif text-2xl sm:text-3xl text-paper"
                style={{ fontWeight: 700 }}
              >
                Cookies & anonyme Statistik
              </h2>
              <p
                className="mt-3 text-cream-soft leading-relaxed text-sm sm:text-base max-w-2xl"
                style={{ fontWeight: 400 }}
              >
                Wir nutzen zwei Arten von Daten: <strong className="text-paper">technisch notwendige</strong>{" "}
                für Reservierung und Login sowie <strong className="text-paper">anonyme Seitenaufrufe</strong>,
                die uns helfen, die Website zu verbessern. Es werden keine IP-Adressen
                gespeichert, keine Cookies für Tracking gesetzt, keine Daten an
                Dritte weitergegeben. Sie können Ihre Auswahl jederzeit ändern.{" "}
                <Link
                  href="/datenschutz"
                  className="link-vintage text-gold-soft"
                  style={{ fontWeight: 600 }}
                >
                  Datenschutzerklärung
                </Link>
              </p>
            </div>

            <div className="mt-6 lg:mt-1 flex flex-col gap-3 lg:w-72 shrink-0">
              <button
                type="button"
                onClick={acceptAll}
                className="btn btn-cream"
              >
                Alle akzeptieren
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="btn btn-outline-light"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="text-cream-soft text-xs uppercase tracking-[0.22em] hover:text-paper transition-colors"
                style={{ fontWeight: 600 }}
              >
                {showDetails ? "Einstellungen ausblenden" : "Einstellungen anpassen"}
              </button>
            </div>
          </div>

          {showDetails ? (
            <div className="mt-8 pt-6 border-t border-paper/15 space-y-5">
              <Toggle
                id="cookie-necessary"
                title="Notwendig"
                description="Erforderlich für Reservierungen, Login im Admin-Bereich und Formulare. Können nicht deaktiviert werden."
                checked={true}
                disabled
                onChange={() => {}}
              />
              <Toggle
                id="cookie-analytics"
                title="Anonyme Statistik"
                description="Server-seitige Erfassung welche Seiten wann aufgerufen wurden. Keine IP-Adressen, keine Cookies, kein Tracking durch Dritte. Nur aggregierte Auswertung im Admin-Bereich."
                checked={analyticsOn}
                onChange={setAnalyticsOn}
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={saveCustom}
                  className="btn btn-cream"
                >
                  Auswahl speichern
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  id,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 mt-1 w-11 h-6 rounded-full transition-colors ${
          checked
            ? "bg-gold-soft"
            : "bg-paper/20 border border-paper/30"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-wood transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
      <div className="flex-1">
        <p id={`${id}-label`} className="text-paper" style={{ fontWeight: 600 }}>
          {title}
        </p>
        <p className="mt-1 text-sm text-cream-soft leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
