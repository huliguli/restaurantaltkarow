export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  category: "restaurant" | "speisen" | "veranstaltungen" | "ambiente";
};

// Bilder werden laufend ergänzt. Neue Dateien in /public/images/ ablegen
// und hier einen Eintrag hinzufügen.
export const gallery: GalleryImage[] = [
  // === Restaurant — Außenansichten ===========================
  {
    src: "/images/aussenansicht-frontal.jpg",
    alt: "Frontale Außenansicht des Restaurant Alt-Karow",
    caption: "Unser Haus an der Alt-Karow 2",
    category: "restaurant",
  },
  {
    src: "/images/aussenansicht-schraeg.jpg",
    alt: "Außenansicht aus schräger Perspektive",
    caption: "Blick auf das Haus",
    category: "restaurant",
  },
  {
    src: "/images/aussenansicht.avif",
    alt: "Außenansicht mit Terrasse",
    caption: "Vorderseite mit Terrasse",
    category: "restaurant",
  },

  // === Ambiente — Innenräume =================================
  {
    src: "/images/essensbereich.avif",
    alt: "Innenraum mit eingedeckten Tischen",
    caption: "Hauptraum mit eingedeckten Tafeln",
    category: "ambiente",
  },
  {
    src: "/images/eingangsbereich.jpg",
    alt: "Eingangsbereich des Restaurants",
    caption: "Eingangsbereich",
    category: "ambiente",
  },
  {
    src: "/images/barbereich.jpg",
    alt: "Barbereich",
    caption: "Bar",
    category: "ambiente",
  },

  // === Veranstaltungsräume ===================================
  {
    src: "/images/raum-hauptraum.jpg",
    alt: "Hauptraum mit eingedeckten Tafeln",
    caption: "Hauptraum — bis 40 Personen",
    category: "veranstaltungen",
  },
  {
    src: "/images/raum-bankettsaal.jpg",
    alt: "Bankettsaal für größere Feiern",
    caption: "Bankettsaal — bis 50 Personen",
    category: "veranstaltungen",
  },
  {
    src: "/images/raum-privatraum.jpg",
    alt: "Grüner Privatraum für kleine Runden",
    caption: "Privatraum — bis 12 Personen",
    category: "veranstaltungen",
  },
];

export const galleryCategories: { id: GalleryImage["category"]; label: string }[] =
  [
    { id: "restaurant", label: "Restaurant" },
    { id: "ambiente", label: "Ambiente" },
    { id: "veranstaltungen", label: "Veranstaltungsräume" },
    { id: "speisen", label: "Speisen" },
  ];
