export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
  tags?: string[];
};

export type MenuSection = {
  id: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
};

// Platzhalter-Speisekarte — repräsentativ für deutsche Küche mit
// osteuropäischen Akzenten. Wird vom Restaurant final ergänzt.
export const menu: MenuSection[] = [
  {
    id: "vorspeisen",
    title: "Vorspeisen",
    subtitle: "Zum Auftakt",
    items: [
      {
        name: "Borschtsch",
        description:
          "Klassische Rote-Bete-Suppe mit Rindfleisch, Kohl und Schmand. Hausgemacht nach traditionellem Rezept.",
        price: "8,50 €",
      },
      {
        name: "Soljanka",
        description:
          "Würzig-säuerliche Eintopfsuppe mit Rind, Würstchen, Gurke und Oliven.",
        price: "8,50 €",
      },
      {
        name: "Heringshäppchen",
        description:
          "Matjesfilets auf Pellkartoffeln mit Apfel, Zwiebel und Sahnesoße.",
        price: "9,80 €",
      },
      {
        name: "Pelmeni",
        description:
          "Russische Teigtaschen, gefüllt mit Rind und Schwein, mit Schmand und frischen Kräutern.",
        price: "10,50 €",
      },
    ],
  },
  {
    id: "hauptgerichte",
    title: "Hauptgerichte",
    subtitle: "Aus Küche & Pfanne",
    items: [
      {
        name: "Königsberger Klopse",
        description:
          "Mit Kapern in cremiger Sahnesoße, Salzkartoffeln und Roter Bete.",
        price: "17,90 €",
      },
      {
        name: "Schweinerollbraten",
        description:
          "In dunkler Biersoße geschmort, mit Rotkohl und hausgemachten Kartoffelklößen.",
        price: "19,50 €",
      },
      {
        name: "Beef Stroganoff",
        description:
          "Zarte Rinderstreifen in würziger Sahnesoße mit Champignons, Gewürzgurken und Butterreis.",
        price: "22,80 €",
      },
      {
        name: "Pljeskavica",
        description:
          "Balkanische Hacksteaks vom Grill mit Ajvar, Zwiebeln und Pommes Frites.",
        price: "18,90 €",
      },
      {
        name: "Zander gebraten",
        description:
          "Aus heimischen Gewässern, mit Petersilienkartoffeln und Sauerampfer-Schaum.",
        price: "24,50 €",
      },
      {
        name: "Bratkartoffelpfanne",
        description:
          "Mit Speck, Zwiebeln und Spiegelei. Klassiker des Hauses.",
        price: "13,80 €",
        tags: ["Klassiker"],
      },
    ],
  },
  {
    id: "vegetarisch",
    title: "Vegetarisch",
    subtitle: "Aus dem Garten",
    items: [
      {
        name: "Wareniki",
        description:
          "Teigtaschen mit Quark-Kartoffel-Füllung, brauner Butter und Schmand.",
        price: "14,50 €",
        tags: ["Vegetarisch"],
      },
      {
        name: "Gemüseroulade",
        description:
          "Mit Spinat-Feta-Füllung, Kräuterrahmsoße und gerösteten Mandeln.",
        price: "15,80 €",
        tags: ["Vegetarisch"],
      },
    ],
  },
  {
    id: "dessert",
    title: "Desserts",
    subtitle: "Süßer Ausklang",
    items: [
      {
        name: "Honigtorte „Medovik“",
        description: "Russischer Klassiker — zarte Honigböden mit Sahnecreme.",
        price: "6,50 €",
      },
      {
        name: "Apfelstrudel",
        description: "Mit Vanillesoße und Schlagsahne.",
        price: "6,80 €",
      },
      {
        name: "Sirniki",
        description:
          "Warme Quarktaler mit Beeren­kompott und Schmand.",
        price: "7,20 €",
      },
    ],
  },
] as const;
