import type { Metadata } from "next";
import { BuffetPage } from "@/components/BuffetPage";

export const metadata: Metadata = {
  title: "Trauerfeier-Buffet konfigurieren",
  description:
    "Konfigurieren Sie das Trauerfeier-Buffet — Variante wählen, Speisen, Eröffnungsgetränke. Würdige Begleitung, diskret organisiert. Auch als PDF erhältlich.",
};

export default function TrauerfeierbuffetPage() {
  return <BuffetPage type="trauerfeier" />;
}
