export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
  /** Optionale Tags wie „Vegetarisch", „Klassiker", saisonale Hinweise */
  tags?: string[];
};

export type MenuSection = {
  id: string;
  title: string;
  subtitle?: string;
  /** Optionaler Hinweis, der nach dem Titel angezeigt wird */
  note?: string;
  items: MenuItem[];
};

/**
 * Speisekarte des Restaurant Alt-Karow.
 * Quelle: /Speisekarte/speisekarte.pdf
 *
 * Bei Änderungen: hier pflegen UND das neue PDF nach
 *   /public/dokumente/speisekarte.pdf
 * kopieren, damit der Download-Button identische Inhalte zeigt.
 */
export const menu: MenuSection[] = [
  {
    id: "saisonal",
    title: "Saisonal · Beelitzer Spargel",
    subtitle: "Saison",
    note: "Frischer Beelitzer Spargel — nur während der Spargelsaison",
    items: [
      {
        name: "Spargel Creme Suppe",
        description:
          "Hausgemachte Spargelsuppe mit Sahne, dazu frische Lauchzwiebeln, Butter und Parmesan.",
        price: "8,90 €",
      },
      {
        name: "Hollandaise-Spargel",
        description:
          "Frischer Spargel mit Hollandaise Soße, dazu Salzkartoffeln.",
        price: "20,90 €",
      },
      {
        name: "Brösel-Spargel",
        description:
          "Brösel-Butter auf frischem Spargel, dazu Salzkartoffeln.",
        price: "20,90 €",
      },
      {
        name: "Spargel-Schinken Käserollen",
        description:
          "Knusprig panierter Spargel mit Hollandaise Soße und Salzkartoffeln.",
        price: "22,50 €",
      },
      {
        name: "Beelitzer Spargel Schnitzel",
        description:
          "Hausgemachtes, knusprig paniertes Schnitzel mit Spargel und Salzkartoffeln, dazu Hollandaise Soße.",
        price: "22,90 €",
        tags: ["Klassiker"],
      },
    ],
  },
  {
    id: "saisonale-salate",
    title: "Saisonal · Salate",
    items: [
      {
        name: "Lachs-Avocado-Salat",
        description:
          "Frische Blätter mit Rucola, Cherrytomaten, Avocado, geräuchertem Lachs, dazu hausgemachter Knoblauch-Frischkäsedip mit Sesam verfeinert.",
        price: "12,90 €",
      },
      {
        name: "Hähnchen-Salat",
        description:
          "Frische Blätter mit Rucola, Cherrytomaten, Hähnchenstreifen, ein pochiertes Ei, dazu hausgemachter Knoblauch-Frischkäsedip.",
        price: "12,90 €",
      },
      {
        name: "Avocado-Salat",
        description:
          "Frische Blätter mit Rucola, Cherrytomaten, Zwiebel, Gurken, Avocado, hausgemachtes Pesto verfeinert mit Sesam.",
        price: "11,90 €",
        tags: ["Vegetarisch"],
      },
    ],
  },
  {
    id: "vorspeisen",
    title: "Vorspeisen",
    subtitle: "Zum Auftakt",
    items: [
      {
        name: "Räucherlachs auf Kartoffelpuffern",
        description:
          "Serviert auf knusprigen Kartoffelrösti mit Meerrettich, Schmand, Gurken und kleinem Salat.",
        price: "9,90 €",
      },
      {
        name: "Gebackener Camembert",
        description:
          "Goldbraun gebackener Camembert mit Preiselbeersoße, dazu knusprig angebratenes Toastbrot.",
        price: "9,50 €",
      },
      {
        name: "Angebratenes Schwarzbrot",
        description:
          "Mit Olivenöl, gewürzt mit Salz, Pfeffer, frischem Knoblauch und Parmesan.",
        price: "8,50 €",
      },
      {
        name: "Crispy Mozzarella Sticks",
        description:
          "Hausgemacht, knusprig frittiert, serviert mit Cocktailsauce und einer scharfen Sauce.",
        price: "7,90 €",
      },
      {
        name: "Würzfleisch vom Schwein",
        description:
          "Zartes Schweinefleisch in würziger Sauce, mit Käse überbacken, serviert mit Zitrone, Worcestersauce und Toast.",
        price: "7,90 €",
      },
      {
        name: "Vorspeisemix",
        description: "Ein kleiner Mix aus allen obigen Vorspeisen.",
        price: "21,90 €",
        tags: ["Für zwei"],
      },
    ],
  },
  {
    id: "suppen",
    title: "Suppen",
    items: [
      {
        name: "Soljanka",
        description:
          "Kräftige Suppe mit Rauchfleisch, Würstchen, Paprika, Zwiebeln und Gewürzgurken. Verfeinert mit Schmand und Zitronenscheibe, serviert mit Brot.",
        price: "8,90 € · klein 4,90 €",
        tags: ["Klassiker"],
      },
      {
        name: "Champignon Cremesuppe",
        description:
          "Zart-cremige Suppe aus frischen Champignons, fein gewürzt — der perfekte leichte Genuss für jeden Tag.",
        price: "7,90 € · klein 3,90 €",
      },
    ],
  },
  {
    id: "salate",
    title: "Salate",
    items: [
      {
        name: "Schopska-Salat",
        description:
          "Frische Blätter mit Tomaten, Gurken und Paprika, dazu Schafskäse, Oliven und Olivenöl.",
        price: "8,90 €",
        tags: ["Vegetarisch"],
      },
      {
        name: "Gemischter Salat",
        description:
          "Knackiger Blattsalat mit frischen Kräutern, Tomaten und Gurken, serviert mit hausgemachtem Kräuter-Dressing.",
        price: "7,90 €",
        tags: ["Vegetarisch"],
      },
    ],
  },
  {
    id: "schnitzel",
    title: "Hausgemachte Schnitzel",
    note: "Donnerstag ist Schnitzeltag — alle Schnitzel zum Sonderpreis von 16,90 €",
    items: [
      {
        name: "Hähnchenschnitzel „Jäger Art“",
        description:
          "Mit Champignon-Rahmsoße, Gewürzgurken und knusprigen Bratkartoffeln.",
        price: "19,50 €",
      },
      {
        name: "Schnitzel „Wiener Art“",
        description:
          "Knusprig paniert, serviert mit Kroketten, Gewürzgurken und Preiselbeersoße.",
        price: "19,50 €",
        tags: ["Klassiker"],
      },
      {
        name: "Schnitzel „Hamburger Art“",
        description:
          "Knusprig paniertes Schnitzel, belegt mit zwei Spiegeleiern, serviert mit Kroketten.",
        price: "19,50 €",
      },
      {
        name: "Schnitzel „Jäger Art“",
        description:
          "Mit cremiger Champignon-Rahmsoße, dazu Krautsalat und Pommes frites.",
        price: "19,90 €",
      },
      {
        name: "Schnitzel mit Spargel",
        description:
          "Mit gebratenem grünem Spargel, verfeinert mit Sauce Hollandaise, dazu Kroketten.",
        price: "20,90 €",
        tags: ["Saisonal"],
      },
      {
        name: "Schlemmerschnitzel",
        description:
          "Überbacken mit Schinken, Rahmchampignons und Käse, serviert mit Bratkartoffeln.",
        price: "20,90 €",
      },
      {
        name: "Schnitzel „Mexico Art“",
        description:
          "Überbacken mit scharfen Jalapeños und Käse, dazu Bratkartoffeln.",
        price: "20,90 €",
      },
      {
        name: "Schnitzel „Au Four“",
        description:
          "Überbacken mit Würzfleisch und Käse, dazu Bratkartoffeln.",
        price: "20,90 €",
      },
      {
        name: "Schnitzel „Kutscher Art“",
        description:
          "Knusprig paniertes Schnitzel mit Baconwürfel und zwei Spiegeleiern, serviert mit Bratkartoffeln, frittierten Zwiebelringen und Röstzwiebeln.",
        price: "21,50 €",
      },
    ],
  },
  {
    id: "hauptgerichte",
    title: "Hauptgerichte",
    subtitle: "Aus Küche & Pfanne",
    note: "Alle Gerichte sind hausgemacht",
    items: [
      {
        name: "Kräuterchampignons",
        description:
          "Gebratene Champignons mit Zwiebeln, verfeinert mit Kräutern und einem Hauch Balsamico, dazu knusprige Bratkartoffeln.",
        price: "16,90 €",
        tags: ["Vegetarisch"],
      },
      {
        name: "Wareniki — Hausgemachte Teigtaschen",
        description:
          "Vegan oder vegetarisch wählbar: gefüllt mit Kartoffel und Sauerkraut oder Spinat und Käse. Serviert mit Schmand und Röstzwiebeln.",
        price: "16,90 €",
        tags: ["Vegetarisch", "Vegan möglich"],
      },
      {
        name: "Pelmeni — Hausgemachte Teigtaschen",
        description:
          "Mit gemischtem Hackfleisch vom Schwein und Rind. Serviert mit Schmand und scharfer Sauce.",
        price: "16,90 €",
        tags: ["Klassiker"],
      },
      {
        name: "Hähnchen-Tasche · 3 verschiedene Käsesorten",
        description:
          "Gefüllt mit Schafskäse und frischen Tomaten, mit Käse überbacken. Serviert mit knusprigen Bratkartoffeln und hausgemachter Käsesauce.",
        price: "20,50 €",
      },
      {
        name: "Hausgemachte BBQ-Rippchen",
        description:
          "Zart geschmorte Schweinerippchen, zwei Stunden im Ofen gegart und mit würziger Barbecue-Soße glasiert. Dazu Bratkartoffeln.",
        price: "22,90 €",
      },
      {
        name: "Kassler aus dem Ofen",
        description:
          "Zartes, ofengegartes Kassler, serviert mit Kartoffelknödeln und hausgemachter Bratensoße, dazu Sauerkraut.",
        price: "19,90 €",
      },
      {
        name: "Rinderroulade",
        description:
          "Klassisch gefüllt und geschmort, mit Kartoffelknödeln, Apfelrotkohl und Bratensoße.",
        price: "20,50 €",
        tags: ["Klassiker"],
      },
      {
        name: "Rindergeschnetzeltes „Stroganoff“",
        description:
          "Mit Zwiebeln, Champignons und Gewürzgurken, in cremiger Sahne-Senf-Sauce. Dazu Kartoffelpüree.",
        price: "22,90 €",
        tags: ["Klassiker"],
      },
      {
        name: "Lachs-Delikat",
        description:
          "Zart im Ofen gebackenes Lachsfilet, veredelt mit Zitronen-Dill-Sahnesoße und rotem Kaviar. Serviert mit cremigem Kartoffelpüree.",
        price: "23,90 €",
      },
    ],
  },
  {
    id: "kleiner-hunger",
    title: "Für den kleinen Hunger",
    subtitle: "Kleine Portionen, gleicher Geschmack",
    items: [
      {
        name: "Schnitzel „Hamburger Art“",
        description:
          "Knusprig paniertes Schnitzel, belegt mit einem Spiegelei, serviert mit Kroketten.",
        price: "16,90 €",
      },
      {
        name: "Schlemmerschnitzel",
        description:
          "Überbacken mit Schinken, Rahmchampignons und Käse, serviert mit Bratkartoffeln.",
        price: "16,90 €",
      },
      {
        name: "Schnitzel „Jäger Art“",
        description:
          "Mit cremiger Champignon-Rahmsoße, dazu Krautsalat und Pommes frites.",
        price: "16,90 €",
      },
      {
        name: "Hähnchengeschnetzeltes",
        description:
          "Zartes Hähnchengeschnetzeltes mit Zwiebeln und Champignons, dazu Kartoffelpüree.",
        price: "16,90 €",
      },
      {
        name: "Königsberger Klopse",
        description:
          "In feiner Kapernsauce, serviert mit zarten grünen Bohnen und klassischen Salzkartoffeln.",
        price: "16,90 €",
        tags: ["Klassiker"],
      },
    ],
  },
  {
    id: "beilagen",
    title: "Beilagen & Extras",
    subtitle: "Was zusätzlich auf den Tisch darf",
    items: [
      {
        name: "Beilagen",
        description:
          "Bratkartoffeln mit Speck & Zwiebeln · Buttergemüse · Pommes frites · Kartoffelpüree · Kartoffelknödel · Kroketten",
        price: "je Portion 5,50 €",
      },
      {
        name: "Extras",
        description:
          "Schmand · Ketchup · Senf · scharfe Sauce · Mayonnaise",
        price: "je Portion 1,50 €",
      },
      {
        name: "BBQ-Sauce",
        price: "2,00 €",
      },
      {
        name: "Rahmchampignonsauce",
        price: "2,00 €",
      },
      {
        name: "Käsesauce",
        price: "2,00 €",
      },
    ],
  },
  {
    id: "kinder",
    title: "Für unsere kleinen Gäste",
    items: [
      {
        name: "Hähnchen-Nuggets",
        description: "Serviert mit Pommes frites, Ketchup und Mayonnaise.",
        price: "7,50 €",
      },
      {
        name: "Kleines Schnitzel",
        description: "Mit Kroketten, Ketchup und Mayonnaise.",
        price: "7,90 €",
      },
      {
        name: "Dinosaurier Berg",
        description:
          "Kartoffelpüree-Vulkan mit Ketchup und knusprigen Dino-Nuggets.",
        price: "7,90 €",
      },
    ],
  },
  {
    id: "desserts",
    title: "Desserts",
    subtitle: "Süßer Ausklang",
    items: [
      {
        name: "Rote Grütze mit Vanillesoße",
        description: "Hausgemacht aus Beeren, serviert mit cremiger Vanillesoße.",
        price: "6,50 €",
      },
      {
        name: "Schokopudding mit Vanillesoße",
        description:
          "Hausgemachter Schokoladenpudding, serviert mit cremiger Vanillesoße.",
        price: "6,50 €",
      },
      {
        name: "Schokoküchlein mit flüssigem Kern",
        description: "Warm serviert, mit Vanilleeis und Sahne.",
        price: "7,90 €",
      },
      {
        name: "Kaiserschmarrn",
        description: "Mit Vanillesoße und frischen Beeren.",
        price: "9,50 €",
      },
    ],
  },
  {
    id: "eis",
    title: "Eis",
    subtitle: "Auch zum Mitnehmen — in Waffel oder Becher",
    items: [
      {
        name: "Kugel Eis",
        description: "Schokolade, Vanille oder Erdbeere.",
        price: "2,50 €",
      },
      {
        name: "2 Kugeln Eis",
        description: "Schokolade, Vanille oder Erdbeere.",
        price: "4,50 €",
      },
      {
        name: "3 Kugeln Eis",
        description: "Schokolade, Vanille oder Erdbeere.",
        price: "7,00 €",
      },
      {
        name: "Schweden Eisbecher",
        description:
          "2 Kugeln Vanilleeis mit hausgemachtem Eierlikör und Apfelmus, garniert mit frischer Sahne.",
        price: "7,50 €",
        tags: ["Alkoholhaltig"],
      },
      {
        name: "Schokokuss",
        description:
          "3 Kugeln Schokoeis überzogen mit Weißschokoladenlikör, dazu Sahne und Erdbeeren.",
        price: "9,50 €",
        tags: ["Alkoholhaltig"],
      },
      {
        name: "Baileys on Top",
        description: "3 Kugeln Vanilleeis überzogen mit Baileys, dazu Sahne.",
        price: "9,50 €",
        tags: ["Alkoholhaltig"],
      },
      {
        name: "Extras",
        description: "Schlagsahne 1,00 € · Likör 4 cl 2,50 €",
      },
    ],
  },
  {
    id: "getraenke",
    title: "Getränke (Auswahl)",
    note: "Die vollständige Getränkekarte mit allen Weinen, Bieren und Spirituosen finden Sie in der PDF-Speisekarte",
    items: [
      {
        name: "Acqua Morelli Still / Sprudel",
        price: "0,25 L 2,90 € · 0,75 L 6,50 €",
      },
      {
        name: "Softdrinks",
        description:
          "Coca Cola · Coca Cola Zero · Fanta · Sprite · Fritz Limo (Zitrone / Ingwer-Limette / Apfel-Kirsch-Holunder)",
        price: "0,4 L · 4,20 €",
      },
      {
        name: "Spezi",
        price: "0,4 L · 4,40 €",
      },
      {
        name: "Säfte (auch als Schorle)",
        description:
          "KiBa · Apfelsaft · Orangensaft · Ananassaft · Traubensaft · Bananennektar · Sauerkirschnektar",
        price: "0,4 L · 4,50 €",
      },
      {
        name: "Spaten Hell · Krombacher (Fass)",
        price: "0,3 L 4,20 € · 0,5 L 5,50 €",
      },
      {
        name: "Erdinger Dunkel / Kristall · Paulaner Hefe (Flasche)",
        price: "0,5 L · 4,50 €",
      },
      {
        name: "Espresso · Kaffee schwarz",
        price: "ab 2,70 €",
      },
      {
        name: "Cappuccino · Latte Macchiato",
        price: "ab 3,80 €",
      },
      {
        name: "Kaffeekanne",
        description: "Für die ganze Runde.",
        price: "15,00 €",
      },
      {
        name: "Beutel-Tee",
        description: "Schwarz · Pfefferminze · Kamille · Früchte · Grüner Tee.",
        price: "Tasse 2,80 € · Kanne 8,90 €",
      },
      {
        name: "Weine (Glas / Flasche)",
        description:
          "Scheurebe lieblich · Grauer Burgunder trocken · Chardonnay · Riesling · Grenache Rosé · Dornfelder · Cabernet",
        price: "Glas ab 6,50 € · Flasche ab 18,50 €",
      },
      {
        name: "Prosecco · Scavi & Ray",
        price: "0,1 L ab 3,10 € · Flasche ab 19,00 €",
      },
    ],
  },
];
