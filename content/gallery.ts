export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  category: "restaurant" | "speisen" | "veranstaltungen" | "ambiente";
};

// Bilder werden laufend ergänzt. Neue Dateien in /public/images/ ablegen
// und hier einen Eintrag hinzufügen.
export const gallery: GalleryImage[] = [
  {
    src: "/images/aussenansicht.avif",
    alt: "Außenansicht des Restaurant Alt-Karow mit Terrasse",
    caption: "Unser Haus an der Alt-Karow 2",
    category: "restaurant",
  },
  {
    src: "/images/essensbereich.avif",
    alt: "Innenraum des Restaurants — gemütlich eingedeckte Tische",
    caption: "Hauptraum mit eingedeckten Tafeln",
    category: "ambiente",
  },
];

export const galleryCategories: { id: GalleryImage["category"]; label: string }[] =
  [
    { id: "restaurant", label: "Restaurant" },
    { id: "ambiente", label: "Ambiente" },
    { id: "speisen", label: "Speisen" },
    { id: "veranstaltungen", label: "Veranstaltungen" },
  ];
