/**
 * Cookie-Consent — localStorage-basiert (kein Cookie nötig, da wir nur eine
 * lokale Entscheidung speichern, nicht versenden).
 *
 * Vorteile gegenüber echtem Cookie:
 *  - kein Server-Roundtrip
 *  - keine Cookie-Header (Cookie-Banner-Cookie wäre ironisch)
 *  - DSGVO-konform: Speicherung ist „berechtigtes Interesse" (Funktion der Seite)
 *
 * Bei Version-Bump (z. B. wenn wir eine neue Kategorie ergänzen) zeigt der
 * Banner sich wieder, weil der gespeicherte State eine alte Version hat.
 */

export type ConsentCategories = {
  /** immer erlaubt (technisch notwendig — Login, Reservierung) */
  necessary: true;
  /** anonyme Seitenaufrufe für Admin-Statistik — opt-in */
  analytics: boolean;
};

export type ConsentState = {
  version: number;
  decidedAt: string;
  categories: ConsentCategories;
};

const STORAGE_KEY = "rak-consent";
export const CURRENT_CONSENT_VERSION = 1;

export const CONSENT_EVENT = "rak-consent-updated";

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (!parsed || parsed.version !== CURRENT_CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(categories: ConsentCategories): ConsentState {
  const state: ConsentState = {
    version: CURRENT_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    categories,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent(CONSENT_EVENT, { detail: state }),
    );
  }
  return state;
}

export function resetConsent(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

/** Helfer zum imperativen „Banner erneut anzeigen" via Custom-Event */
export const REOPEN_BANNER_EVENT = "rak-consent-reopen";
export function reopenConsentBanner(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REOPEN_BANNER_EVENT));
}
