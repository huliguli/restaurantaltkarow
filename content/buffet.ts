/**
 * Datenmodell für die Buffet-Konfiguratoren (Feier + Trauerfeier).
 * Abbildung der beiden PDFs:
 *   /Konfigurationsblätter/Feierbuffet.pdf
 *   /Konfigurationsblätter/Trauerfeierbuffet.pdf
 *
 * Änderungen an Preisen / Gerichten zentral hier — die Form-UI und die
 * E-Mail-Generierung lesen ausschließlich diese Datei.
 */

export type BuffetType = "feier" | "trauerfeier";

export type Variant = {
  id: string;
  /** Anzeigetitel, z. B. "Buffet Variante 2" */
  title: string;
  /** Hauptpreis pro Person — als String mit Komma & €, wie in der Karte */
  price: string;
  /** Inhalte / Versprechen dieser Variante (Bullet-Liste) */
  includes: string[];
  /** Optionaler Hinweis / Reduzierter Alternativpreis */
  note?: string;
  /** Welche Sektionen sind für diese Variante relevant? */
  hat: {
    hauptgerichte: boolean;
    beilagen: boolean;
    suppen: boolean;
    vorspeisen: boolean;
    schnittchen: boolean;
    dessert: boolean;
    gemueseplatte: boolean;
  };
};

export type CheckboxOption = {
  id: string;
  label: string;
  hint?: string;
};

export type SubChoice = {
  id: string;
  label: string;
  /** Optional sub-radio (z. B. Schnitzel: Schwein/Hähnchen) */
  options?: string[];
};

// === Gemeinsame Daten beider PDFs =========================================

export const HAUPTGERICHTE: SubChoice[] = [
  { id: "schweinesteak", label: "Schweinesteak überbacken mit Gemüse, Hirtenkäse & Käse" },
  { id: "haehnchenroulade", label: "Hähnchenroulade gefüllt mit Zwiebel, Champignons, mit Käse überbacken" },
  { id: "schweinebraten", label: "Schweinebraten" },
  { id: "rindergeschnetzeltes", label: "Rindergeschnetzeltes „Stroganoff“" },
  { id: "schnitzel", label: "Kleine Schnitzel", options: ["Schwein", "Hähnchen"] },
  { id: "schweinebaeckchen", label: "Schweinebäckchen in dunkler Soße" },
  { id: "kasslerbraten", label: "Kassler-Braten in Bratensoße" },
  { id: "haehnchentaschen", label: "Hähnchentaschen gefüllt mit Schafskäse & frischen Tomaten, mit Käse überbacken" },
  { id: "zanderfilet", label: "Zanderfilet in Sahnesoße", options: ["in Sahnesoße", "paniert mit Kräutersahnesoße"] },
  { id: "steak-schweinenacken", label: "Steak von Schweinenacken" },
  { id: "haehnchenkeule", label: "Hähnchenkeule in Knoblauchsoße" },
];

export const BEILAGEN: CheckboxOption[] = [
  { id: "salzkartoffeln", label: "Salzkartoffeln" },
  { id: "kroketten", label: "Kroketten" },
  { id: "sauerkraut", label: "Sauerkraut mit Speck" },
  { id: "pommes", label: "Pommes" },
  { id: "kartoffelpueree", label: "Kartoffelpüree" },
  { id: "buttergemuese", label: "Buttergemüse" },
  { id: "rotkohl", label: "Rotkohl mit Apfel" },
  { id: "bratkartoffel", label: "Bratkartoffel" },
  { id: "knoedel", label: "Knödel" },
  { id: "broetchen", label: "Brötchen (für Suppen)" },
];

export const SUPPEN: CheckboxOption[] = [
  { id: "soljanka", label: "Soljanka" },
  { id: "tomatencremesuppe", label: "Tomatencremesuppe" },
  { id: "gulaschsuppe", label: "Gulaschsuppe" },
  { id: "karottencremesuppe", label: "Karottencremesuppe" },
  { id: "gemuesesuppe", label: "Gemüsesuppe" },
  { id: "champignoncremesuppe", label: "Champignoncremesuppe" },
];

export const VORSPEISEN: CheckboxOption[] = [
  { id: "mozzarellaspiesse", label: "Mozzarellaspieße" },
  { id: "paprika-frischkaeserollen", label: "Rote Paprikafrischkäserollen" },
  { id: "antipasti", label: "Antipasti" },
  { id: "weichkaeseplatte", label: "Weichkäseplatte mit Weintrauben" },
  { id: "obstplatte", label: "Obstplatte" },
  { id: "blinys-rind", label: "Gerollte Blinys mit Rindfleisch", hint: "Blinys = herzhafte kleine Pfannkuchen" },
  { id: "blinys-lachs", label: "Gerollte Blinys mit Lachs und Schmand" },
];

export const SCHNITTCHEN: CheckboxOption[] = [
  { id: "mettwurst", label: "Mettwurst" },
  { id: "haehnchen", label: "Hähnchen" },
  { id: "lachs", label: "Lachs" },
  { id: "wurst-ungarisch", label: "Wurst (Ungarisch)" },
  { id: "kaese", label: "Käse" },
  { id: "mozzarella", label: "Mozzarella" },
];

export const DESSERTS: CheckboxOption[] = [
  { id: "apfelkuchen", label: "Apfelkuchen" },
  { id: "pflaumenkuchen", label: "Pflaumenkuchen" },
  { id: "rotegruetze", label: "Rote Grütze mit Vanillesoße" },
  { id: "schokopudding", label: "Schokopudding mit Vanillesoße" },
];

// === Eröffnungsgetränke (nur Trauerfeier-Buffet) =========================

export type EroeffnungsGetraenk = {
  id: string;
  label: string;
  pricePerUnit: string;
  unit: string;
  /** Subtypen für Wasser (still / sprudel) */
  subOptions?: string[];
};

export const EROEFFNUNGSGETRAENKE: EroeffnungsGetraenk[] = [
  {
    id: "wasser",
    label: "Wasserflasche (0,75 L)",
    pricePerUnit: "6,50 €",
    unit: "pro Flasche",
    subOptions: ["Still", "Sprudel"],
  },
  {
    id: "kaffeekanne",
    label: "Kaffeekanne",
    pricePerUnit: "15,00 €",
    unit: "pro Kanne",
  },
  {
    id: "prosecco",
    label: "Proseccoflasche (0,75 L)",
    pricePerUnit: "19,00 €",
    unit: "pro Flasche",
  },
];

// === Varianten je Buffet-Typ =============================================

export const FEIER_VARIANTS: Variant[] = [
  {
    id: "feier-v2",
    title: "Buffet Variante 2",
    price: "26,90 €",
    includes: [
      "3 Hauptgerichte",
      "2 Suppen",
      "1 Gemüseplatte",
      "1 Dessert pro Person",
    ],
    hat: {
      hauptgerichte: true,
      beilagen: true,
      suppen: true,
      vorspeisen: false,
      schnittchen: false,
      dessert: true,
      gemueseplatte: true,
    },
  },
  {
    id: "feier-v3",
    title: "Buffet Variante 3",
    price: "29,90 €",
    includes: [
      "3 Hauptgerichte",
      "2 Suppen",
      "1 Gemüseplatte",
      "1 Dessert pro Person",
      "3 Schnittchen pro Person",
    ],
    hat: {
      hauptgerichte: true,
      beilagen: true,
      suppen: true,
      vorspeisen: false,
      schnittchen: true,
      dessert: true,
      gemueseplatte: true,
    },
  },
  {
    id: "feier-v4",
    title: "Buffet Variante 4",
    price: "35,50 €",
    includes: [
      "3 Hauptgerichte",
      "2 Suppen",
      "1 Gemüseplatte",
      "1 Dessert pro Person",
      "4 Vorspeisen",
    ],
    note: "Ohne Suppen 32,50 € pro Person",
    hat: {
      hauptgerichte: true,
      beilagen: true,
      suppen: true,
      vorspeisen: true,
      schnittchen: false,
      dessert: true,
      gemueseplatte: true,
    },
  },
];

export const TRAUER_VARIANTS: Variant[] = [
  {
    id: "trauer-v1",
    title: "Buffet Variante 1",
    price: "18,50 €",
    includes: [
      "2 Suppen",
      "3 Schnittchen pro Person",
      "1 Gemüseplatte",
      "1 Dessert pro Person",
    ],
    note: "Ohne Suppen 15,50 € pro Person",
    hat: {
      hauptgerichte: false,
      beilagen: false,
      suppen: true,
      vorspeisen: false,
      schnittchen: true,
      dessert: true,
      gemueseplatte: true,
    },
  },
  {
    id: "trauer-v2",
    title: "Buffet Variante 2",
    price: "26,90 €",
    includes: [
      "3 Hauptgerichte",
      "2 Suppen",
      "1 Gemüseplatte",
      "1 Dessert pro Person",
    ],
    note: "Ohne Gemüseplatte & Dessert 23,90 € pro Person",
    hat: {
      hauptgerichte: true,
      beilagen: true,
      suppen: true,
      vorspeisen: false,
      schnittchen: false,
      dessert: true,
      gemueseplatte: true,
    },
  },
  {
    id: "trauer-v3",
    title: "Buffet Variante 3",
    price: "29,90 €",
    includes: [
      "3 Hauptgerichte",
      "2 Suppen",
      "1 Gemüseplatte",
      "1 Dessert pro Person",
      "3 Schnittchen pro Person",
    ],
    hat: {
      hauptgerichte: true,
      beilagen: true,
      suppen: true,
      vorspeisen: false,
      schnittchen: true,
      dessert: true,
      gemueseplatte: true,
    },
  },
  {
    id: "trauer-v4",
    title: "Buffet Variante 4",
    price: "35,50 €",
    includes: [
      "3 Hauptgerichte",
      "2 Suppen",
      "1 Gemüseplatte",
      "1 Dessert pro Person",
      "1 Käse-/Wurstplatte",
    ],
    hat: {
      hauptgerichte: true,
      beilagen: true,
      suppen: true,
      vorspeisen: false,
      schnittchen: false,
      dessert: true,
      gemueseplatte: true,
    },
  },
];

// === Beschriftungen / Limits =============================================

export const LIMITS = {
  hauptgerichte: 3,
  beilagen: 3,
  suppen: 2,
  vorspeisen: 4,
} as const;

export const COMMON_HINWEISE = [
  "Buffet ab 20 Personen. Unter 20 Personen nur à la carte.",
  "Alle Buffets enthalten keine Getränke.",
  "Zu jedem Hauptgericht kann eine Beilage gewählt werden.",
  "Änderungen der gemeldeten Personenanzahl spätestens eine Woche vor dem Veranstaltungstermin mitteilen. Spätere Reduzierungen können wir nicht mehr berücksichtigen, höhere Teilnehmerzahlen werden zum vereinbarten Preis pro Person zusätzlich berechnet.",
];

export function getVariants(type: BuffetType): Variant[] {
  return type === "feier" ? FEIER_VARIANTS : TRAUER_VARIANTS;
}

export const BUFFET_META: Record<
  BuffetType,
  { title: string; intro: string; pdfPath: string; emailSubject: string }
> = {
  feier: {
    title: "Feier-Buffet",
    intro:
      "Stellen Sie Ihr Buffet individuell zusammen. Wählen Sie zunächst eine Variante, anschließend Ihre Hauptgerichte, Beilagen, Suppen, Desserts und weitere Details.",
    pdfPath: "/dokumente/feierbuffet.pdf",
    emailSubject: "Anfrage Feier-Buffet",
  },
  trauerfeier: {
    title: "Trauerfeier-Buffet",
    intro:
      "Wir gestalten Ihren Anlass mit der Ruhe und Sorgfalt, die er verdient. Wählen Sie eine Buffet-Variante, dann die Speisen und gegebenenfalls Eröffnungsgetränke.",
    pdfPath: "/dokumente/trauerfeierbuffet.pdf",
    emailSubject: "Anfrage Trauerfeier-Buffet",
  },
};
