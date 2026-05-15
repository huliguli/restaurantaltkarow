import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Admin-Bereich nutzt das globale Root-Layout für CSS/Fonts, blendet
 * aber den öffentlichen Header & Footer nicht aus — die werden im
 * Root-Layout immer gerendert. Wir verstecken sie deshalb hier via
 * Body-Klasse + CSS. Alternativ könnten wir eine Route-Group erstellen,
 * aber das wäre größere Umbau-Arbeit.
 *
 * Aktuell ist der Admin-Bereich bewusst Teil derselben Route-Group,
 * der öffentliche Header wird einfach durchgereicht. Das ist OK —
 * man sieht beim Login direkt, dass man "im" Restaurant ist.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
