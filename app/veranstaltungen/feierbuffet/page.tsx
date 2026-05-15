import type { Metadata } from "next";
import { BuffetPage } from "@/components/BuffetPage";

export const metadata: Metadata = {
  title: "Feier-Buffet konfigurieren",
  description:
    "Konfigurieren Sie Ihr Feier-Buffet online — Variante wählen, Hauptgerichte, Beilagen, Suppen, Vorspeisen, Desserts. Auch als PDF zum Ausdrucken.",
};

export default function FeierbuffetPage() {
  return <BuffetPage type="feier" />;
}
