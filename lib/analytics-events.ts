/**
 * Client-Side Analytics-Events für GA4.
 * Zentrale Stelle für alle getrackten Events — typisiert + namespaced.
 *
 * Funktioniert nur nach Consent (gtag wird sonst gar nicht geladen).
 * Bei fehlendem gtag werden Aufrufe stillschweigend ignoriert — d. h.
 * Components müssen sich nicht um Consent-State kümmern, einfach
 * `events.cta(...)` aufrufen.
 *
 * Neues Event hinzufügen:
 *   1. Hier eine Funktion ergänzen, die `track(name, params)` aufruft
 *   2. An der gewünschten Stelle im Code aufrufen
 *   3. In GA4 → Konfigurieren → Ereignisse das neue Event als „Conversion"
 *      markieren, falls relevant
 */

type EventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "consent" | "js" | "set",
      ...args: unknown[]
    ) => void;
    dataLayer?: unknown[];
  }
}

function track(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}

export const events = {
  // === Navigation & Page ============================================
  pageView: (path: string, title: string) =>
    track("page_view", {
      page_path: path,
      page_location:
        typeof window !== "undefined" ? window.location.href : path,
      page_title: title,
    }),

  navClick: (label: string, target: string, isMobile: boolean) =>
    track("nav_click", {
      nav_label: label,
      nav_target: target,
      mobile_menu: isMobile,
    }),

  // === Outbound / Kontakt ==========================================
  phoneClick: (location: string) =>
    track("phone_click", { click_location: location }),

  emailClick: (location: string) =>
    track("email_click", { click_location: location }),

  instagramClick: (location: string) =>
    track("instagram_click", { click_location: location }),

  mapsClick: (location: string) =>
    track("maps_click", { click_location: location }),

  externalLinkClick: (host: string, location: string) =>
    track("external_link_click", {
      link_host: host,
      click_location: location,
    }),

  // === CTAs / Buttons ==============================================
  cta: (label: string, location: string) =>
    track("cta_click", { cta_label: label, click_location: location }),

  pdfDownload: (file: string, location: string) =>
    track("pdf_download", { file_name: file, click_location: location }),

  // === Forms — generisch ============================================
  formStart: (formName: string) =>
    track("form_start", { form_name: formName }),

  formStep: (formName: string, step: string) =>
    track("form_step", { form_name: formName, step }),

  formError: (formName: string, message: string) =>
    track("form_error", { form_name: formName, error_message: message }),

  formSubmit: (formName: string) =>
    track("form_submit", { form_name: formName }),

  formSuccess: (formName: string) =>
    track("form_success", { form_name: formName }),

  // === Geschäftliche Conversions ====================================
  reservationRequested: (params: {
    partySize: number;
    reservationDate: string;
    reservationTime: string;
  }) =>
    track("reservation_request", {
      party_size: params.partySize,
      reservation_date: params.reservationDate,
      reservation_time: params.reservationTime,
    }),

  buffetRequested: (params: {
    type: "feier" | "trauerfeier";
    variantId: string;
    partySize: number;
  }) =>
    track("buffet_request", {
      buffet_type: params.type,
      variant_id: params.variantId,
      party_size: params.partySize,
    }),

  contactRequested: (anlass: string) =>
    track("contact_request", { contact_topic: anlass }),

  // === Engagement ===================================================
  scrollDepth: (percent: 25 | 50 | 75 | 100, path: string) =>
    track("scroll_depth", { percent_scrolled: percent, page_path: path }),

  consentGranted: (analytics: boolean) =>
    track("consent_decision", { analytics_granted: analytics }),

  /** Custom escape-hatch */
  custom: (name: string, params?: EventParams) => track(name, params),
};
