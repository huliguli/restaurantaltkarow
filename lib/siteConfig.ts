export const siteConfig = {
  name: "Restaurant Alt-Karow",
  shortName: "Alt-Karow",
  tagline: "Neuer Geschmack am vertrauten Ort",
  description:
    "Restaurant Alt-Karow in Berlin — deutsche Küche mit osteuropäischen Akzenten, hausgemacht, herzlich, in gemütlicher Atmosphäre. Reservierungen unter +49 30 94209445.",
  url: "https://www.restaurant-alt-karow.berlin",
  phone: "+49 30 94209445",
  phoneHref: "+493094209445",
  email: "",
  address: {
    street: "Alt-Karow 2",
    zip: "13125",
    city: "Berlin",
    country: "Deutschland",
  },
  instagram: {
    handle: "@restaurant_altkarow",
    url: "https://www.instagram.com/restaurant_altkarow/",
  },
  hours: [
    { day: "Montag", time: "Geschlossen", note: "Veranstaltungen auf Anfrage" },
    { day: "Dienstag", time: "Geschlossen", note: "Veranstaltungen auf Anfrage" },
    { day: "Mittwoch", time: "12:00 – 22:00", note: "Küche bis 21:00" },
    { day: "Donnerstag", time: "12:00 – 22:00", note: "Küche bis 21:00" },
    { day: "Freitag", time: "12:00 – 22:00", note: "Küche bis 21:00" },
    { day: "Samstag", time: "12:00 – 22:00", note: "Küche bis 21:00" },
    { day: "Sonntag", time: "12:00 – 18:00", note: "" },
  ],
  rooms: [
    { name: "Hauptraum", capacity: "bis 40 Personen" },
    { name: "Bankettsaal", capacity: "bis 50 Personen" },
    { name: "Privatraum", capacity: "bis 12 Personen" },
    { name: "Terrasse", capacity: "bis 40 Personen" },
  ],
} as const;

export const navigation = [
  { href: "/", label: "Restaurant" },
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/veranstaltungen", label: "Veranstaltungen" },
  { href: "/galerie", label: "Galerie" },
  { href: "/kontakt", label: "Kontakt" },
] as const;
