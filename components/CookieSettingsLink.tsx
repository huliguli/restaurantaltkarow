"use client";

import { reopenConsentBanner } from "@/lib/cookie-consent";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function CookieSettingsLink({ className = "", children }: Props) {
  return (
    <button
      type="button"
      onClick={reopenConsentBanner}
      className={className || "link-vintage"}
    >
      {children ?? "Cookie-Einstellungen"}
    </button>
  );
}
