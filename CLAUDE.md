# CLAUDE.md — Restaurant Alt-Karow

> Persistenter Projektkontext für Claude-Agents. Diese Datei ist primär für KI-Agents geschrieben, nicht für den Endnutzer. Sie soll jeden neuen Agent in unter 2 Minuten arbeitsfähig machen.
>
> **Pflege-Hinweis (für Agents):** Diese Datei ist der zentrale, langfristige Wissensspeicher des Projekts. Sie ist **kein einmaliges Dokument** — sie wird aktiv gepflegt. Aktualisiere sie immer dann, wenn du in deiner Sitzung
> – eine neue technische Entscheidung triffst, eine neue Konvention einführst, eine neue Abhängigkeit hinzufügst,
> – neue Komponenten anlegst, Seiten ergänzt, Inhalte erweitert,
> – Server-/PM2-/Nginx-Details lernst oder änderst,
> – wichtige Annahmen machst, ein nicht-triviales Problem löst,
> – einen Punkt aus Abschnitt „Offene Punkte" erledigst oder einen neuen identifizierst.
> Halte die Tabellen in Abschnitt 5 (Server) und Abschnitt 4 (Designsystem) konsistent zur Realität.

---

## 1. Projektziel

Statische, hochwertige Website für das **Restaurant Alt-Karow** (Berlin-Karow, Alt-Karow 2, 13125 Berlin).

**Branche/Profil:** Deutsche Küche mit osteuropäischen (russischen) Akzenten. Nachbarschafts-Restaurant mit Tradition, Feierraum-Angebot, Terrasse. Familiärer Ton.

**Aktueller Stand:** Vollständige Production-Site live unter `https://restaurant-alt-karow.berlin`. Marketing-Pages (Start, Speisekarte, Veranstaltungen, Galerie, Kontakt) + interaktive Reservierung mit Admin-Dashboard + Buffet-Konfiguratoren mit Mailversand + self-hosted Analytics.

**Bewusste Nicht-Ziele:**

- Kein CMS — Inhalte als TypeScript-Module unter `content/` (Code-as-Content, schnell, versioniert, Git-Diff-bar).
- Kein E-Commerce, kein Bezahl-Flow — Reservierung läuft als Anfrage, kein Online-Vorab-Bezahlen.
- Keine externen Tracker, keine Drittanbieter-Cookies, kein GA4 — alles self-hosted in unserer SQLite-DB.
- Keine Push-Notifications, kein Newsletter-Tool (würden Drittanbieter-Setup erfordern).

---

## 2. Stack

| Schicht       | Wahl                              | Begründung                                                            |
| ------------- | --------------------------------- | --------------------------------------------------------------------- |
| Framework     | **Next.js 16 (App Router)**       | Hybrid: statische Marketing-Pages + dynamische API-Routes für Forms/Admin/Analytics. |
| Sprache       | **TypeScript 5 strict**           | `tsconfig.json` mit `strict: true`, `jsx: "react-jsx"`.               |
| Styling       | **Tailwind CSS v4** (`@theme inline`) | Theme-Tokens als CSS-Custom-Properties via `@theme` in `globals.css`. |
| Fonts         | `next/font/google`                | Playfair Display (Headings, Serif) + Inter (Body, Sans).             |
| Bilder        | `next/image`                      | AVIF/WebP-Optimierung; Bilder in `public/images/`.                    |
| Datenbank     | **better-sqlite3**                | Single-File-SQLite, WAL-Mode, synchrone API. Singleton in `lib/db.ts`. |
| Mail          | **nodemailer ^8**                 | Strato SMTP. Singleton-Transporter in `lib/mailer.ts`.                |
| Auth          | HMAC-Cookie + bcryptjs            | Admin-Bereich, kein externes Auth-Framework. `lib/admin-auth.ts`.     |
| PDF           | **pdf-lib**                       | Reservierungsbestätigungen zur Laufzeit, ohne Schrift-Dateien.        |
| Analytics     | **self-hosted in SQLite**         | Eigener Tracker, kein GA4. Tabellen in DB, Helpers in `lib/analytics/*`. |
| Node          | ≥ 20 LTS                          | Auf VPS: Node 20.20.x.                                                |
| Process Mgr   | PM2 (Production)                  | Gemeinsamer systemd-Service mit wappsite.                             |
| Reverse Proxy | Nginx (eigener Server-Block)      | Port 3001 → 443 mit TLS.                                              |
| TLS           | Let's Encrypt / Certbot           | Auto-Renewal via vorhandenem `certbot.timer`.                         |

### Wichtige Hinweise zu Next.js 16

- **App Router** ist Pflicht — kein `pages/`-Verzeichnis.
- Komponenten sind **Server-Komponenten by default**. Client-Komponenten ausdrücklich mit `"use client"`. Aktuell client-side: Header, Reveal, ScrollDepthTracker, GlobalClickTracker, AnalyticsProvider, CookieBanner, CookieSettingsLink, AdminNav, AdminReservationsTable, AdminLoginForm, AdminLogoutButton + alle Form-Komponenten.
- Bei Bibliotheks- oder Konfigurationsfragen zu Next.js: **immer aktuelle Doku konsultieren** (z. B. via `context7` MCP) — Next.js 16 enthält Breaking Changes gegenüber 13/14/15.
- Build-Ergebnis: statische Marketing-Pages (`○`) + dynamische API/Admin-Routes (`ƒ`). `npm run build` listet die Aufteilung am Ende.
- **`@next/env` ist CommonJS** — bei Imports in eigenen Skripten kein named import, sondern `import nextEnv from "@next/env"; const { loadEnvConfig } = nextEnv;`.

---

## 3. Projektstruktur

```
restaurantaltkarow/
├── app/
│   ├── layout.tsx                          # Root: Header + Footer + Fonts + JSON-LD + Tracker
│   ├── page.tsx                            # Startseite
│   ├── globals.css                         # Tailwind v4 + @theme + @layer base/components
│   ├── icon.png                            # Favicon (Logo „K" in Fraktur)
│   ├── sitemap.ts                          # auto-generiert /sitemap.xml
│   ├── robots.ts                           # auto-generiert /robots.txt
│   ├── api/
│   │   ├── buffet-anfrage/route.ts          # POST: Buffet-Config → Mail
│   │   ├── kontakt/route.ts                 # POST: Kontaktformular → Mail
│   │   ├── reservieren/route.ts             # POST: Reservierung anlegen
│   │   ├── consent/route.ts                 # POST: Consent-Entscheidung loggen
│   │   ├── analytics/track/route.ts         # POST: Event tracken (Pageview/Click/Form/Scroll)
│   │   └── admin/
│   │       ├── login/route.ts               # POST: Admin-Login + Cookie
│   │       ├── logout/route.ts              # POST: Cookie löschen
│   │       └── reservations/[id]/route.ts   # PATCH: confirm/decline/propose
│   ├── admin/
│   │   ├── layout.tsx                       # Noindex-Wrapper
│   │   ├── page.tsx                         # Dashboard Reservierungen (Server-Component)
│   │   ├── login/page.tsx
│   │   └── analytics/page.tsx               # Self-hosted Analytics-Dashboard
│   ├── reservieren/page.tsx                 # Public Reservierungsformular
│   ├── speisekarte/page.tsx
│   ├── veranstaltungen/
│   │   ├── page.tsx
│   │   ├── feierbuffet/page.tsx
│   │   └── trauerfeierbuffet/page.tsx
│   ├── galerie/page.tsx
│   ├── kontakt/page.tsx
│   ├── impressum/page.tsx
│   └── datenschutz/page.tsx
├── components/
│   ├── Header.tsx                          # "use client" — sticky, Light/Dark je Scroll & Page
│   ├── Footer.tsx                          # dunkles Wood + Schriftlogo + Gold-Akzente
│   ├── Hero.tsx                            # Fullscreen-Hero mit mehrlagigem Overlay
│   ├── Reveal.tsx                          # "use client" — IO Fade-up, einmalig
│   ├── Ornament.tsx                        # SVG-Rautendekoration
│   ├── SectionHeading.tsx                  # Eyebrow + H2 + Ornament, tone dark/light
│   ├── OpeningHours.tsx                    # tabellarische Öffnungszeiten
│   ├── ReservationCTA.tsx                  # Burgundy-Section, jede Seite
│   ├── MenuList.tsx                        # Speisekarten-Sections mit Dotted-Leader
│   ├── GalleryGrid.tsx                     # responsives Grid mit Aspekt-Variation
│   ├── BuffetForm.tsx                      # "use client" — interaktiver Konfigurator
│   ├── BuffetPage.tsx                      # geteilte Page für Feier + Trauerfeier
│   ├── ContactForm.tsx                     # "use client" — Kontaktformular
│   ├── ReservationForm.tsx                 # "use client" — Reservierungsformular
│   ├── CookieBanner.tsx                    # "use client" — DSGVO-Banner (Alle / Nur notw. / Settings)
│   ├── CookieSettingsLink.tsx              # "use client" — öffnet Banner erneut
│   ├── AnalyticsProvider.tsx               # "use client" — Pageview-Tracker, session_start
│   ├── GlobalClickTracker.tsx              # "use client" — Delegation: tel/mail/social/cta
│   ├── ScrollDepthTracker.tsx              # "use client" — 25/50/75/100 %
│   ├── AdminNav.tsx                        # "use client" — Tabs „Reservierungen | Analytics"
│   ├── AdminLoginForm.tsx                  # "use client"
│   ├── AdminLogoutButton.tsx               # "use client"
│   ├── AdminReservationsTable.tsx          # "use client" — Tabelle + Aktionen
│   └── admin/charts/
│       ├── BarRow.tsx                       # horizontaler Balkenchart, dependency-frei
│       ├── TimeSeries.tsx                   # SVG-Sparkline für tägliche Zeitserie
│       └── HourHeatmap.tsx                  # 24-Stunden-Heatmap (Sessions)
├── content/
│   ├── menu.ts                             # Speisekarte (echte Karte aus PDF abgebildet)
│   ├── gallery.ts                          # Galerie-Items + Kategorien
│   └── buffet.ts                           # Buffet-Varianten, Gerichte, Limits, Meta
├── lib/
│   ├── siteConfig.ts                       # Stammdaten + Räume mit Bildern
│   ├── mailer.ts                           # Nodemailer-Transporter (Strato SMTP)
│   ├── db.ts                               # SQLite-Singleton + Schema-Init (ALLE Tabellen)
│   ├── reservations.ts                     # CRUD-Helper für Reservierungen
│   ├── reservation-rules.ts                # pure Funktionen: Öffnungstage, Slots, Vorlauf
│   ├── reservation-mail.ts                 # 5 Mail-Templates (Text + HTML)
│   ├── reservation-pdf.ts                  # PDF-Bestätigung via pdf-lib
│   ├── admin-auth.ts                       # HMAC-Cookie, bcrypt-Vergleich, Session
│   ├── cookie-consent.ts                   # Consent-State im localStorage + Events
│   ├── analytics-events.ts                 # Client-seitiges Event-API (events.xxx)
│   └── analytics/
│       ├── types.ts                         # POLICY_VERSION, EventType, ConsentState
│       ├── server.ts                        # hashVisitorId, parseUA, Country/Lang, Validators, RateLimit
│       ├── db.ts                            # ingestEvent (transaktional), recordConsent
│       └── aggregations.ts                  # KPIs, Top-Listen, Funnel, Recent (für Admin)
├── scripts/
│   ├── hash-password.mjs                   # bcrypt-Hash mit `\$`-Escape erzeugen
│   ├── check-admin-auth.mjs                # Diagnose: passt Passwort zum Hash in .env?
│   └── check-nextenv.mjs                   # Diagnose: was lädt Next.js wirklich aus .env?
├── public/
│   ├── images/                             # Hero/Galerie/Räume/Schriftlogo (PNG + AVIF)
│   └── dokumente/                          # speisekarte.pdf, feierbuffet.pdf, trauerfeierbuffet.pdf
├── data/                                   # SQLite-Datenbank (gitignored)
├── Bilder/                                 # User-Quellordner (gitignored)
├── Speisekarte/                            # User-Quellordner Original-PDF (gitignored)
├── Konfigurationsblätter/                  # User-Quellordner Buffet-PDFs (gitignored)
├── secure/                                 # Zugangsdaten (gitignored!) — email.txt, admin.txt
├── .env.example
├── .env.local                              # Credentials (gitignored)
├── .gitignore
├── CLAUDE.md
├── DEPLOYMENT.md
├── next.config.mjs
├── postcss.config.mjs
├── package.json
└── tsconfig.json
```

**Erweiterung:**

- Neue Bilder → `public/images/`, dann Eintrag in `content/gallery.ts` (mit Kategorie).
- Neue Speisekarten-Sections/Items → `content/menu.ts`.
- Neue Seite → neuer Ordner unter `app/`, `metadata`-Export nicht vergessen.

---

## 4. Designsystem

### Identität

Vintage, klassisch, warm, gemütlich, **premium**. **Kein** Minimalismus, **kein** Startup-Look, **keine** flache Word-Doc-Optik. Stilreferenz: gehobenes Landhaus-Restaurant, historische Gaststätte modern interpretiert, hochwertige Gastronomie-Drucksachen.

### Farbpalette — Iteration 4 (FINAL — gegen Braun-Drift)

> **⚠️ Wichtige Geschichte für künftige Agents:**
>
> Iterationen 1–3 nutzten warme, **braungetönte** Töne (Body `#1c130c`, BG `#fdf9ef`, Gold `#b08a3e`, „wood" `#221208`). Der WCAG-Kontrast war zwar AAA, das Gesamtbild aber **gelblich-braun-tea-stained** — der User empfand die Seite zu Recht als „graubraun, schwach, schrecklich".
>
> Iteration 4 schwenkt auf das archetypische Premium-Restaurant-Schema:
> **neutrales Tiefschwarz + reines Bone-Cream + Burgund + Honiggold**.
>
> Vergleichsreferenzen: Eleven Madison Park, Charcoal, Geist Berlin.
>
> **Token-Namen blieben gleich (`paper`, `wood`, `gold`, `cream`, …), damit Komponenten nicht angefasst werden müssen.**
> Die **Werte** sind neu und weniger warm. Wenn ein Agent „mehr Wärme" einbauen will → das passiert über **Burgund-/Goldakzente**, **niemals** über braune Texte oder beige-gelbliche Backgrounds. Wer auch nur einen Token Richtung „brauner" dreht, verliert das Premium-Gefühl wieder.

Tokens in `app/globals.css` via `@theme` — automatisch verfügbar als Tailwind-Klassen (`bg-burgundy`, `text-ink-strong`, `border-gold/40` etc.).

**Hell auf dunkel** (Texte auf dunklem Hintergrund):

| Token                | Hex       | WCAG vs. `--color-wood` (#0d0b06) | Verwendung                                       |
| -------------------- | --------- | --------------------------------- | ------------------------------------------------ |
| `--color-paper`      | `#faf6e8` | **≈18:1** AAA                      | Hellster Cremeton — Brand, Headings, Body        |
| `--color-cream`      | `#f3ecd6` | ≈16:1 AAA                          | Standardtext (Reserve)                            |
| `--color-cream-soft` | `#d8cfb5` | ≈12:1 AAA                          | Sekundärtext (Fußnoten, Disclaimer)               |
| `--color-gold-soft`  | `#e8c870` | ≈12:1 AAA                          | Akzenttext auf dunkel (Uhrzeiten, Links, Labels) |
| `--color-gold-pale`  | `#f3e2ad` | ≈14:1 AAA                          | Reserve                                            |

**Dunkel auf hell** (Texte auf hellem Hintergrund):

| Token                | Hex       | WCAG vs. `--color-paper` (#faf6e8) | Verwendung                                       |
| -------------------- | --------- | ---------------------------------- | ------------------------------------------------ |
| `--color-ink-strong` | `#0a0907` | ≈19:1 AAA                          | Headings, Brand, Schlüsselwörter                 |
| `--color-ink`        | `#15120c` | ≈16:1 AAA                          | **Standard-Bodytext**                             |
| `--color-ink-soft`   | `#2c2820` | ≈11:1 AAA                          | Body mit weniger Wucht                            |
| `--color-muted`      | `#5a5446` | ≈7:1 AAA                           | NUR Fußnoten / Tabellen-Sekundärinfo             |
| `--color-burgundy`   | `#6e1f24` | ≈10:1 AAA                          | **Eyebrows + CTAs + Preise auf hellem Grund**     |

**Akzente / Backgrounds:**

| Token                   | Hex       | Verwendung                                          |
| ----------------------- | --------- | --------------------------------------------------- |
| `--color-burgundy`      | `#6e1f24` | Primärakzent, Eyebrow-Farbe, Preise, CTA            |
| `--color-burgundy-deep` | `#4d161a` | Hover                                                |
| `--color-burgundy-soft` | `#8b2b33` | Reserve                                              |
| `--color-gold`          | `#c19a3a` | Ornamente, Trennlinien, dekorativer Akzent          |
| `--color-paper`         | `#faf6e8` | Haupt-BG (Body)                                     |
| `--color-paper-deep`    | `#ece4cb` | Alternierender Sektions-BG                          |
| `--color-cream-deep`    | `#ddd5c0` | Reserve hell                                         |
| `--color-wood`          | `#0d0b06` | **Footer + dunkle Sektionen — neutrales Tiefschwarz**, nicht braun (Name ist historisch) |
| `--color-wood-mid`      | `#15120c` | Karten auf dunkel                                    |
| `--color-wood-soft`     | `#1f1b14` | Reserve                                              |

> **Naming-Hinweis:** `--color-wood` ist historisch benannt — der HEX-Wert beschreibt jetzt **neutrales Tiefschwarz mit Mikro-Wärme**, nicht braunes Holz. Komponenten-Klassen `bg-wood`, `text-wood` etc. wurden nicht umbenannt (Diff-Sparsamkeit). Beim Lesen einfach „bg-noir / Charcoal" denken.

### Kritischer Bug in Iteration 3+4 — @layer base ist Pflicht

**Symptom:** Trotz `text-paper`-Klasse auf einer `<h1>` blieb die Headline dunkelbraun. Trotz `text-cream` auf einer `<h2>` keine Wirkung. Footer-Brand, Hero-Headline, Section-Titel auf dunklen Sektionen, Räume-Karten — alle ignorierten ihre Tailwind-Color-Klasse.

**Ursache:** Die `globals.css` hatte ihren Base-Reset (`h1, h2, h3, h4 { color: var(--color-ink-strong) }`) **ungelayered** — direkt im Top-Level. In Tailwind v4 schlägt unlayered CSS **alle** `@layer utilities` (also auch `text-paper`, `text-cream`, `text-burgundy` etc.).

**Fix:** Sämtliche Base-Typografie und Resets in `@layer base { ... }` packen. Dann gewinnen Tailwind-Utility-Klassen wieder, wie sie sollen.

```css
@layer base {
  body { color: var(--color-ink); }
  h1, h2, h3, h4 { color: var(--color-ink-strong); ... }
}
```

**Konsequenz für Agents:**

- Jede globale Tag-Selector-Regel (h1, h2, body, p, ul, …) muss in `@layer base` liegen.
- Custom Utility-Klassen (`.btn`, `.eyebrow`, `.text-shadow-strong`) bleiben unlayered — die SOLLEN andere Utilities übersteuern.
- **Aber: niemals `color: inherit` oder `color: <wert>` in einer unlayered Custom-Klasse setzen, die mit Tailwind-text-*-Utilities kombiniert wird.** Sonst wird die Utility-Klasse stillschweigend ignoriert. Gleicher Bug taucht dadurch auch bei `<a>`-Tags auf: `.link-vintage` hatte ursprünglich `color: inherit` — das überschrieb jede `text-paper`-Klasse auf Nav-Links. Fix: `color: inherit` einfach weglassen (Tailwinds Preflight setzt es bereits in `@layer base` für `<a>`).
- Wenn nach einer Palette-Änderung Farben nicht durchschlagen → erster Verdacht: ein unlayered Base-Selector oder eine unlayered Custom-Klasse mit `color: …` überschreibt die Utility-Klasse.

### Eyebrow-Farbe (wichtige Änderung in Iteration 4)

`.eyebrow` (auf hellem Grund) ist jetzt **Burgund (`#6e1f24`)** statt Gold. Grund: Gold/Honig auf Cremeweiß ergibt nur 2.4 – 3.0 : 1 Kontrast → WCAG-Fail bei Eyebrow-Schriftgröße. Burgund auf Cremeweiß = 10 : 1 AAA, satt, klassisch. Pattern aus Premium-Restaurants (Charcoal, Geist).

`.eyebrow-bright` / `.label-bright` (auf dunklem Grund) bleibt Gold (`#e8c870`) — dort 12 : 1 AAA.

### Kontrast-Regeln — Iteration 3 (FINAL)

**Lehre aus den Iterationen 1+2:** Tonale Farben (Beigetöne, gedämpftes Gold, abgeschwächte Cream-Töne mit `/90`-Opacity) wirken auf den Augen schwach, selbst wenn sie WCAG-technisch passen. Die Lösung ist **maximale Helligkeit, satte Gewichtung, Sans-Serif für kleine Labels**.

#### Harte Regel 1 — Textfarben nach Hintergrund

**Auf dunklem Grund (`bg-wood`, `bg-burgundy`, Hero):**

| Rolle             | Klasse                                         |
| ----------------- | ---------------------------------------------- |
| Headings          | `text-paper` + `style={{fontWeight: 700}}`    |
| Body-Lesetext     | `text-paper` (volle Opacity, **nicht** `/90`)  |
| Sekundärinfo      | `text-cream-soft`                              |
| Akzentwert/Link   | `text-gold-soft` mit `fontWeight: 600`         |
| Eyebrow/Labels    | `.label-bright` (Sans-Serif, weiß-gold, fett)  |

**Auf hellem Grund (`bg-paper`, `bg-cream-deep`):**

| Rolle             | Klasse                                         |
| ----------------- | ---------------------------------------------- |
| Headings          | `text-ink-strong` + `style={{fontWeight: 700}}` |
| Body-Lesetext     | `text-ink` (NICHT `text-ink-soft` für längere Texte) |
| Body-Sekundär     | `text-ink-soft`                                |
| Disclaimer/Mini   | `text-ink-soft italic` (mit Goldbalken-Border) |
| Akzent/Link       | `text-burgundy` mit `fontWeight: 600`          |
| Eyebrow/Labels    | `.eyebrow` (Sans-Serif, gold, fett)            |

#### Harte Regel 2 — Backdrops statt durchsichtigen Verläufen

- Der Header über Hero ist **`bg-wood/90` mit Backdrop-Blur** + Gold-Hairline am unteren Rand. **Kein fade-to-transparent** — der zerstörte Lesbarkeit über hellen Bildstellen.
- Hero hat **drei Overlay-Layer**: `.hero-vignette` (radial+linear), `bg-black/35 mix-blend-multiply`, plus ein gezielter radialer Kontrastring hinter dem Headline-Bereich. Niemals auf einzelnes Layer verlassen.
- `btn-outline-light` hat `rgba(15,8,4,0.45)` Backdrop + Blur — Buttons über Hero müssen ohne Hover lesbar sein.

#### Harte Regel 3 — Sans-Serif für kleine Texte und Labels

Playfair Display ist **bei < 20px** zu schmal und wirkt anämisch. Daher:

- **Buttons:** Sans-Serif (Inter), uppercase, `letter-spacing: 0.22em`, weight **700**.
- **Eyebrows / Section-Labels:** Sans-Serif, uppercase, weight 600–700.
- **Footer-Spaltenüberschriften:** `.label-bright` (Sans, uppercase, 700, gold-soft).
- **Speisekarten-Anker-Nav:** Sans-Serif uppercase, weight 700.
- **Body und Headings ≥ 24px:** Playfair (Serif).

#### Harte Regel 4 — Font-Weights

- **Hero-H1:** weight **700**, dazu `.text-shadow-strong` (mehrlagig).
- **Section-H2:** weight **700**, dazu auf dunklem Grund `text-shadow: 0 3px 18px rgba(0,0,0,0.5)`.
- **H3 (Karten-Titel etc.):** weight **600–700**.
- **Body:** weight **400** (Inter).
- **Body-Highlights (`<strong>`):** weight **700**.
- **Inline `style={{ fontWeight: ... }}` ist erlaubt und erwünscht** — Tailwind `font-bold` etc. funktionieren auch, aber Inline ist eindeutiger lesbar.

#### Harte Regel 5 — `text-muted` ist KEIN Body-Text

`text-muted` (#5e4f3c) ist nur für:
- Fußnoten unter Tabellen
- „Bilder folgen in Kürze"-Hinweise
- Tabellen-Sekundärinfo

**Niemals für** Karten-Beschreibungen, Sektions-Body, Nav, Buttons. Stattdessen `text-ink` oder `text-ink-soft`.

#### Harte Regel 6 — Wenn Bild im Hintergrund

Jeder Text über einem Bild bekommt **mindestens** `.text-shadow-soft`, bei großen Headlines `.text-shadow-strong`. Plus mindestens ein Overlay-Layer (am besten `bg-black/35 mix-blend-multiply`).

#### Harte Regel 7 — Karten auf dunklem Grund

`.card-dark` hat jetzt:

- Background dunkler als die Sektion (`rgba(8,4,2,0.55→0.85)`), nicht heller.
- Gold-Border bei 45 % Opacity, im Hover 85 %.
- Inset-Highlight am oberen Rand für Tiefe.
- Inhalt: `text-paper` (Headings/Body), `.label-bright` (Eyebrows).

#### Harte Regel 8 — Mobile-Navigation

Das aufgeklappte Mobile-Menü ist **immer** im hellen Modus (`bg-paper` + `text-ink-strong`), unabhängig vom `overHero`-State — damit es nie schwer lesbar wird.

### Typografie

- **Headings:** `Playfair Display` (via `next/font/google`, CSS-Var `--font-playfair`, Gewichte 400/500/600/700).
- **Body:** `Inter` (via `next/font/google`, CSS-Var `--font-inter`, Gewichte 300/400/500/600).
- **Tailwind-Familien:** `font-serif` (Playfair) | `font-sans` (Inter, default).
- **Display-Klasse `.text-display`** für große Hero-/Section-Titel: weight 500, letter-spacing `-0.022em`, line-height `1.04`. Wird mit inline `fontWeight: 600` kombiniert für Hero.
- **Eyebrows** (`.eyebrow`): italic Serif, uppercase, `letter-spacing: 0.22em`, `--color-gold`. Auf dunklem Grund zusätzlich `.eyebrow-bright` (gold-soft).

### Komponenten-Bausteine (Utility-Klassen in `globals.css`)

- **Buttons:** `.btn` + Variant (`.btn-primary` burgundy, `.btn-outline` dark, `.btn-outline-light` für dunklen Grund mit semi-transparentem Backdrop **+ Blur**, `.btn-cream` für CTAs auf dunklem Grund). Sans-Serif, uppercase, weight 700, mit subtilem Shine-Sweep auf Hover (`::after`-Pseudo, 700 ms).
- **Sections:** `.section` (vertikales Padding `clamp(5rem, 9vw, 8rem)`), `.section-tight`.
- **Container:** `.container-prose` (64rem), `.container-wide` (82rem).
- **Links:** `.link-vintage` — Hover-Underline mit Right-to-Left-Sweep (380 ms, `ease-elegant`).
- **Karten:** `.card-elevated` (heller Hintergrund mit subtilem Gradient, Hover lift + gold border), `.card-dark` (deutlich dunkler als die Sektion, gold-Border 45–85 %, Inset-Highlight).
- **Eyebrows / Labels:**
  - `.eyebrow` — Sans-Serif uppercase, gold, weight 600 — auf hellem Grund
  - `.eyebrow-bright` — Modifier: gold-soft (für dunklen Grund)
  - `.label-bright` — Sans-Serif uppercase, gold-soft, weight **700** — die Premium-Label-Variante für Footer-Spalten, dunkle Section-Eyebrows, Room-Capacity
- **Ornamente:** `.divider-gilt` (Gold-Doppellinie), `.corner-decor` (L-Bracket-Ecken aus Gold, via ::before/::after).
- **Bilder:** `.image-elegant` (overflow-hidden, 1200ms ease-elegant scale + brightness/saturate auf Hover).
- **Hero-Overlay:** `.hero-vignette` (radial + linear, dunkler als zuvor — Iteration 3 hat den Mittelbereich auf rgba(8,4,2,0.65) angezogen).
- **Text-Shadows:** `.text-shadow-soft` (für Body), `.text-shadow-strong` (für Hero-H1 und Section-Headings auf dunklem Grund).
- **Paper-Grain:** `.paper-grain` (auf `<body>`) — 3.5 % SVG-Noise, multiply.

### Layout-Konventionen

- Sticky `Header` (fixed, z-50). State `overHero` (= Startseite UND nicht gescrollt) bestimmt Light-/Dark-Modus. Sonst Light.
- Unterseiten starten mit `pt-44` im ersten `section` (kompensiert fixed Header-Höhe).
- Sektions-Rhythmus: `bg-paper` → `bg-cream-deep` → `bg-wood` → `bg-paper` → CTA `bg-burgundy`. Trenner sind subtile Gold-Linien (`bg-gradient-to-r from-transparent via-gold/35 to-transparent`).
- `ReservationCTA` (Burgundy mit doppeltem radialem Lichtakzent) sitzt am Ende jeder relevanten Seite.
- Sektionen mit `bg-wood` bekommen ein subtiles, warmes Glow-Element (radial-gradient gold, 25 % opacity) für Tiefe.

### Animationen — Prinzipien

**Sehr zurückhaltend, hochwertig, ausschließlich CSS + minimaler JS (IntersectionObserver).** Keine externen Animationslibs.

| Animation                                  | Wo                                                                | Dauer       | Easing                          |
| ------------------------------------------ | ----------------------------------------------------------------- | ----------- | ------------------------------- |
| Section/Card Fade + Slide-up beim Sichtbarwerden | `<Reveal>` Komponente, im IntersectionObserver getriggert    | 900 ms      | `cubic-bezier(0.22,0.61,0.36,1)` (`--ease-elegant`) |
| Button-Hover (translateY + Shadow + Shine-Sweep) | Alle `.btn`-Varianten                                          | 320 / 700 ms | `--ease-elegant`                |
| Link-Hover (Underline-Sweep R→L)           | `.link-vintage`                                                   | 380 ms      | `--ease-elegant`                |
| Bild-Scale + Brightness                    | `.image-elegant` (Galerie, Hero-Bilder)                           | 1200 ms     | `--ease-elegant`                |
| Header Light↔Dark Transition               | `Header.tsx`, beim Scroll-Trigger                                 | 500 ms      | `ease-out`                      |
| Hero-Scroll-Indikator                      | `.animate-float-soft` (2.4 s loop)                                | 2.4 s       | `ease-in-out infinite`          |
| Mobile-Menü Burger-Morph                   | `Header.tsx`                                                      | 300 ms      | linear                          |

**Regeln:**

- `Reveal` triggert genau **einmal** (per `io.disconnect()`), kein Re-Hide beim Hochscrollen.
- `prefers-reduced-motion: reduce` schaltet **alle** Animationen aus (globaler CSS-Override).
- Stagger über `delay`-Prop (`<Reveal delay={120}>`) — Stufen üblicherweise 80–140 ms. Keine längeren Wartezeiten, sonst wirkt es träge.
- Keine Pop-ins, keine Bounces, keine Karussells.

### Wann eine Komponente neu, wann inline?

- **Inline** (in der Seite): einmalige Layout-Komposition, individuelle Inhalte.
- **Komponente** (in `components/`): visuelles Element kommt 2+ mal vor, oder hat eigene Logik (`Reveal`, `Header`).
- **Utility-Klasse** (in `globals.css`): Styling-Pattern kommt 3+ mal vor (Buttons, Cards, Container, Ornamente).

---

## 4.5 Mail-Versand (Strato SMTP) + Formulare

### Setup

- **SMTP-Provider:** Strato Webmail
- **Konto:** `restaurant@mijorent.de` (existiert bereits, Plain-Text-Credentials liegen in `/secure/email.txt` — niemals committen, der Ordner ist gitignored).
- **Bibliothek:** `nodemailer` (`^6.9.16`) + `@types/nodemailer`
- **Singleton-Transporter:** `lib/mailer.ts` cached den Transporter pro Server-Prozess. `sendMail({ subject, text, html, replyTo })` ist die einzige öffentliche API.
- **Env-Variablen** (in `.env.local` lokal, `.env.production` auf VPS — beide gitignored):
  - `EMAIL_HOST=smtp.strato.de`
  - `EMAIL_PORT=465`
  - `EMAIL_USER=restaurant@mijorent.de`
  - `EMAIL_PASS=…`
  - `EMAIL_TO=restaurant@mijorent.de` (Empfänger, kann von USER abweichen, Default = USER)
  - `EMAIL_FROM_NAME=Restaurant Alt-Karow Website`

> **Strato-Eigenheit:** Die `From`-Header-Adresse muss identisch zur Auth-Adresse sein, sonst lehnt der Server den Versand ab. Anzeigename darf abweichen — daher `from: "Restaurant Alt-Karow Website" <restaurant@mijorent.de>`.

> **Domain-Mismatch:** Absender ist `@mijorent.de`, Website ist `restaurant-alt-karow.berlin`. Mails können dadurch häufiger im Spam landen. Langfristige Lösung: eigene `kontakt@restaurant-alt-karow.berlin`-Adresse einrichten, sobald Domain transferiert wurde. In ToDos.

### Formulare

| Form | Page | API-Endpoint | Daten | Spam-Schutz |
| --- | --- | --- | --- | --- |
| Buffet-Konfigurator (Feier) | `/veranstaltungen/feierbuffet` | `POST /api/buffet-anfrage` | Buffet-Variante + Speisen-Auswahl + Kontaktdaten | Honeypot-Feld `website` |
| Buffet-Konfigurator (Trauer) | `/veranstaltungen/trauerfeierbuffet` | (gleicher Endpoint, `type: "trauerfeier"`) | + Eröffnungsgetränke | Honeypot |
| Kontaktformular | `/kontakt` | `POST /api/kontakt` | Name, E-Mail, Telefon, Anlass, Nachricht | Honeypot + Email-Validierung + Length-Cap |
| Reservierungsformular | `/reservieren` | `POST /api/reservieren` | Datum, Zeit, Personen, Name, Mail, Telefon, Anmerkungen | Honeypot + Datum/Slot-Validierung (`reservation-rules.ts`) |

**Konventionen für künftige Formulare:**

1. **Client-Komponente** (`"use client"`) sammelt State, sendet `application/json` per `fetch`.
2. **API-Route** (`runtime = "nodejs"`) validiert, honeypotted Bots stillschweigend annehmen (200 OK), echte Fehler mit deutscher Klartext-Message als JSON `{ error: string }` mit passendem Status (400/502).
3. **Mail enthält Plain-Text + HTML** (nodemailer setzt richtigen `multipart`). `replyTo` auf User-Email setzen, damit „Antworten"-Button im Postfach direkt funktioniert.
4. **Honeypot-Feld** heißt einheitlich `website`, ist via `position:absolute; left:-9999px` versteckt, `tabIndex={-1}`, `autocomplete="off"`. Bots füllen es aus, echte User nie.
5. **Keine Tracking-Tools, keine externen Form-Services** (Formspree/Typeform etc.) — alles eigene Infrastruktur, DSGVO-freundlich.

### Buffet-Datenmodell

Alle Buffet-Speisen, Varianten, Preise und Limits in **`content/buffet.ts`**. Einziger Ort für Änderungen — `BuffetForm`, `BuffetPage` und der API-Endpoint lesen ausschließlich von dort. Quelle der Wahrheit sind die PDFs unter `/Konfigurationsblätter/`.

`content/buffet.ts` exportiert:
- `FEIER_VARIANTS` (3 Varianten) / `TRAUER_VARIANTS` (4 Varianten) mit `includes[]`, Preisen, `hat: { hauptgerichte, beilagen, … }`-Flags
- Gerichtslisten: `HAUPTGERICHTE`, `BEILAGEN`, `SUPPEN`, `VORSPEISEN`, `SCHNITTCHEN`, `DESSERTS`, `EROEFFNUNGSGETRAENKE`
- `LIMITS`: max-Wählbar-Counts (3/3/2/4)
- `BUFFET_META`: Title, Intro-Text, PDF-Pfad, E-Mail-Betreff pro Typ
- `COMMON_HINWEISE`: Sätze, die in jeder Anfrage als „Aside" angezeigt werden

### PDFs unter `/public/dokumente/`

| Datei | Quelle | Status | Hinweis |
| --- | --- | --- | --- |
| `feierbuffet.pdf` | `/Konfigurationsblätter/Feierbuffet.pdf` (618 KB) | gepflegt | Update durch Überschreiben |
| `trauerfeierbuffet.pdf` | `/Konfigurationsblätter/Trauerfeierbuffet.pdf` (697 KB) | gepflegt | Update durch Überschreiben |
| `speisekarte.pdf` | `/Speisekarte/speisekarte.pdf` (**121 MB**) | **fehlt — muss vor Deploy komprimiert werden** | Original ist zu groß. Auf < 5 MB komprimieren (Adobe / ghostscript / smallpdf), dann hier ablegen |

**Ghostscript-Kompressions-Befehl (Linux/WSL):**

```bash
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=public/dokumente/speisekarte.pdf Speisekarte/speisekarte.pdf
```

---

## 4.6 Reservierungssystem + Admin-Bereich

### Öffentliche Reservierung — Regeln

- **Route:** `/reservieren` (Header-Button „Reservieren" zeigt hierhin)
- **Öffnungstage:** Mi – So (Mo + Di geschlossen)
- **Slots:** 30-Minuten-Schritte ab 12:00
- **Letzte Reservierung:** max. 2 Stunden vor Schluss
  - Mi – Sa: 20:00 (Schluss 22:00)
  - So: 16:00 (Schluss 18:00)
- **Mindest-Vorlauf:** 2 Öffnungstage (Mo + Di werden übersprungen)
- **Form-Felder:** Datum, Uhrzeit, Personenzahl, Name, E-Mail, Telefon (opt), Anmerkungen (opt)
- **Status nach Submit:** `pending` — Gast bekommt Eingangsbestätigung, aber **keine** verbindliche Zusage. Wartet auf Admin-Entscheidung.

Die gesamte Regelogik in `lib/reservation-rules.ts` als pure Funktionen — wird **client UND server** geteilt (Datumsvalidierung im Form + erneut im API-Endpoint).

### Datenbank: SQLite (better-sqlite3)

- **Datei:** `data/restaurantaltkarow.db` (gitignored, lokal + auf VPS separat).
- **Singleton-Wrapper:** `lib/db.ts`. WAL-Mode für gleichzeitige Reads.
- **Schema:** Tabelle `reservations` mit `status` ∈ `pending | confirmed | declined | change_proposed`, jeweils `created_at`, `decided_at`, `admin_note`, `proposed_date/time` etc.
- **DB-Helpers:** `lib/reservations.ts` (`createReservation`, `getReservationById`, `listReservations`, `updateReservationStatus`).
- **Backups:** sind ein offenes ToDo — die DB enthält Live-Reservierungen, daher regelmäßige Backups auf dem VPS einrichten (z. B. `sqlite3 ... .backup`, oder ganz simpel `cp` des `.db`-Files in einen `/var/backups/`-Ordner via Cron).

### Admin-Bereich

- **Login:** `/admin/login` → POST `/api/admin/login`
- **Dashboard:** `/admin` (geschützt, Server-Component prüft Session)
- **Logout:** POST `/api/admin/logout`
- **Aktionen:** PATCH `/api/admin/reservations/[id]` mit `{ action: 'confirm' | 'decline' | 'propose', adminNote?, proposedTime? }`

#### Auth

Single-Admin-System mit HMAC-signiertem Session-Cookie. Kein externes Auth-Framework.

- **Credentials:** in `.env.local` / `.env.production`:
  - `ADMIN_USERNAME` = `restaurant_mijorent`
  - `ADMIN_PASSWORD_HASH` = bcrypt-Hash (Klartext-Passwort kennt nur der User — in `/secure/admin.txt` lokal)
  - `ADMIN_SESSION_SECRET` = zufälliger 32-Byte-Hex-String (HMAC-Key)
- **Login-Flow:** username gegen `ADMIN_USERNAME` per Vergleich, Passwort gegen `ADMIN_PASSWORD_HASH` per `bcryptjs.compare`. Bei Erfolg: HTTP-only signed Cookie `admin_session=<base64payload>.<hmac>` mit 24h TTL.
- **Session-Check:** `getAdminSession()` aus `lib/admin-auth.ts` in jeder Admin-Server-Component oder API-Route aufrufen. Bei `null` → `redirect("/admin/login")` bzw. 401.
- **Bei Wechsel von `ADMIN_SESSION_SECRET`** werden alle bestehenden Sessions sofort ungültig — praktisch als „kill switch".

#### Aktionen im Detail

| Aktion | Effekt im DB-Status | E-Mail an Gast | PDF? |
| --- | --- | --- | --- |
| Bestätigen | `confirmed` | Bestätigungsmail | ✅ PDF im Anhang (`buildReservationPdf`) |
| Ablehnen | `declined` | Absagemail (mit optionaler Begründung) | – |
| Änderung vorschlagen | `change_proposed` | Alternativvorschlag-Mail mit der neuen Uhrzeit | – |

Die Alternativzeit muss am **gleichen Tag** wie die Original-Reservierung liegen und im erlaubten Buchungsfenster (Slot-Validierung wie beim Public-Form).

Bei Bestätigung wird das PDF zur Laufzeit generiert (`lib/reservation-pdf.ts`, via `pdf-lib`), kein Disk-Storage.

### Mail-Templates (Reservierungen)

Alle in `lib/reservation-mail.ts`:

- `pendingGuestMail(r)` — Eingangsbestätigung
- `confirmedGuestMail(r)` — verbindliche Bestätigung (PDF kommt extra)
- `declinedGuestMail(r, adminNote)` — Absage
- `proposedGuestMail(r, proposedTime, adminNote)` — Alternative
- `internalNewReservationMail(r)` — interne Benachrichtigung mit Link zum Admin

Alle Mails: Plain-Text + HTML, mit Restaurant-Signatur, korrekter Bordeaux/Gold-Optik, klassischer Restaurant-Briefkopf-Stil.

### PDF-Bestätigung

`lib/reservation-pdf.ts` baut eine elegante A4-PDF mit:

- Restaurant-Kopfzeile mit goldener Trennlinie
- „Reservierungsbestätigung" + Untertitel
- Details-Box mit Datum, Uhrzeit, Personen, Gast
- Optionale Anmerkung
- Hinweise (Stornierung, Verspätung)
- Adresse + Tel im Footer
- Reservierungs-Nr. (zero-padded), Bestätigungsdatum
- Linker Burgundy-Akzentbalken

Pdf-lib mit StandardFonts (Times Roman) — keine externe Schrift-Datei nötig.

---

## 4.7 Cookie-Consent + Self-Hosted Analytics

> **Historie:** Ursprünglich war GA4 vorgesehen. Wurde im Mai 2026 komplett rausgeworfen zugunsten einer **self-hosted** Lösung in unserer SQLite-DB. Keine externen Tracker, keine Drittlandübermittlung, keine Cookies — DSGVO-mäßig drastisch einfacher.

### Cookie-Consent

- **Speicherung:** Browser-`localStorage` (kein Cookie), Key `rak-consent`. Schema in `lib/cookie-consent.ts`. Bei Bump von `CURRENT_CONSENT_VERSION` zeigt sich der Banner automatisch wieder.
- **Banner:** `components/CookieBanner.tsx` — drei Buttons („Alle akzeptieren" / „Nur notwendige" / „Einstellungen"). Im Admin-Bereich ausgeblendet (`pathname.startsWith("/admin")`).
- **Erneut öffnen:** `components/CookieSettingsLink.tsx` — Button feuert das `rak-consent-reopen` Custom-Event, Banner reagiert. Eingebunden in Footer und Datenschutzerklärung.
- **Server-Spiegelung:** Bei jeder Banner-Entscheidung wird `sendConsentDecision()` aufgerufen → POST `/api/consent` → Eintrag in `consents`-Tabelle. So gibt's eine Auswertung „wie viele User akzeptieren Analytics" im Admin-Dashboard.

### Tracker-Architektur

| Komponente | Zweck |
|---|---|
| `AnalyticsProvider.tsx` | Liest Consent, feuert `session_start` (einmal pro Tab) + `pageview` bei jeder Route-Änderung |
| `GlobalClickTracker.tsx` | Event-Delegation: `tel:`/`mailto:`/Instagram/Maps/externe Links + `data-track`-Attribute |
| `ScrollDepthTracker.tsx` | Bei 25/50/75/100 % Scroll: `scroll_depth`-Event. Reset bei Route-Change. |
| Form-Komponenten | Senden `form_start` (erster Fokus) + `form_submit` (nach erfolgreichem Versand) mit Meta-Daten |

Alle Events sind in `lib/analytics-events.ts` typisiert (`events.xxx(...)`). Aufrufe vor Consent werden **stillschweigend verworfen** — Components müssen sich nicht um Consent-State kümmern, einfach `events.ctaClick(...)` rufen.

### Datenfluss

```
Browser
  ↓  (nach Consent)
events.xxx()  →  POST /api/analytics/track  →  ingestEvent() (lib/analytics/db.ts)
                                                    ↓  (Transaktion)
                                              ┌─────┴─────┬─────────┐
                                              ▼           ▼         ▼
                                       analytics_     analytics_   analytics_
                                       visitors      sessions     events
```

Pro Event-POST wird **transactional**:
1. Visitor-Day-Record erstellt (für Unique-Visitor-Tracking)
2. Session upsert (neu oder `last_seen_at` + Dauer updaten)
3. Event-Row mit allen Details

### Visitor-Identität (DSGVO-konform)

- **Keine IP-Speicherung.** Stattdessen `visitorId = sha256(secret + UTC-Date + ip + ua-prefix).slice(0,24)`.
- **Tages-rotierender Salt** → keine cross-day-Korrelation möglich.
- UA wird auf 80 Zeichen gekürzt, dann gehasht.
- Hashing in `lib/analytics/server.ts` (`hashVisitorId`, `hashIp`).

### Datenbank-Tabellen

| Tabelle | Inhalt |
|---|---|
| `consents` | Jede Consent-Entscheidung mit `analytics/marketing/functional`, `policy_version`, `ip_hash`, `user_agent` |
| `analytics_visitors` | `(visitor_id, date)` PK — für Unique-Visitor-Zählung |
| `analytics_sessions` | Session-Metadaten: Entry-Path, Referrer, Device, Browser, OS, Lang, Country, `pageviews`, `event_count`, `duration_ms` |
| `analytics_events` | Roh-Events: type, page_path, cta_id, form_id, scroll_pct, meta, plus alle Session-Felder als Snapshot |

Indizes auf `created_at`, `type`, `path`, `session_id`, `visitor_id`.

### Event-Catalog

| Event | Wo gefeuert | Wichtige Parameter |
|---|---|---|
| `pageview` | `AnalyticsProvider` bei Route-Change | `pagePath` |
| `session_start` | `AnalyticsProvider` einmalig pro neuer Session | `referrer` |
| `cta_click` | `GlobalClickTracker` bei `data-track`-Attribut | `ctaId` |
| `outbound_click` | `GlobalClickTracker` bei tel/mail/social/maps/external | `ctaId` = kind, `meta.host` |
| `scroll_depth` | `ScrollDepthTracker` 25/50/75/100 % | `scrollPct` |
| `form_start` | Form bei erstem Fokus | `formId` |
| `form_submit` | nach erfolgreichem Server-Response | `formId`, optional `meta` (party_size, contact_topic, buffet_type, ...) |
| `form_abandon` | (reserviert für späteres Cleanup-Tracking) | `formId` |

### Admin-Dashboard `/admin/analytics`

Server-Component liest direkt aus DB via `lib/analytics/aggregations.ts`:

- KPIs: Sessions, Unique Visitors, Pageviews, Ø Session-Dauer, Bounce Rate, Form-Starts/-Submits, Conversion, Consent-Akzeptanz-Quote
- Tägliche Zeitserie (SVG-Sparkline)
- Top: Seiten, Referrer, CTAs
- Funnel (Pageview → Form-Start → Form-Submit, distinct sessions)
- Geräte / Browser / OS / Sprachen (Top-Listen)
- Stunden-Heatmap + Wochentage
- Neu vs. wiederkehrend
- Consent-Übersicht
- Letzte 30 Roh-Events (Tabelle)

URL-Param `?period=today|7d|30d|90d`.

### Wichtige Konventionen

- **Analytics ist NICHT im Admin deaktivierbar** — kein Setting für „Tracking aus". Wenn der User keinen Consent gibt, wird gar nichts getrackt. Punkt.
- `data-track="kurzer_label"` an einem Element reicht für CTA-Tracking. Delegation läuft global in `GlobalClickTracker`.
- **Rate-Limit** pro IP: 240 Track-Events/min, 30 Consent-Events/min (in-memory Bucket in `lib/analytics/server.ts`).
- **Niemals** `sendBeacon` für reguläre Events nutzen außer für Scroll/Unload — `fetch` mit `keepalive: true` ist Default.
- Wenn Stats leer wirken: zuerst Browser-DevTools → Network nach `POST track 204` filtern. Wenn keine POSTs → Consent fehlt oder JS-Bundle ist alt (Hard-Refresh `Ctrl+Shift+R`).

### Neue Events ergänzen

1. Event-Type in `lib/analytics/types.ts` (Union `EventType`) ergänzen + Whitelist in `isValidEventType` in `lib/analytics/server.ts`.
2. Wrapper in `lib/analytics-events.ts` unter `events` hinzufügen.
3. Optional: in `app/admin/analytics/page.tsx` eine eigene Aggregation/Top-Liste ergänzen, sonst landet das Event nur im Roh-Stream.

---

## 5. Server / Deployment — Kerninfo

> Detaillierte Schritt-für-Schritt-Anleitung: `DEPLOYMENT.md`.

| Schlüsselwert        | Wert                                                  |
| -------------------- | ----------------------------------------------------- |
| Domain               | `restaurant-alt-karow.berlin` (+ `www.` Redirect → Apex)  |
| Domain-Registrar     | offen — `.berlin` wird **nicht** von Wix angeboten (Stand 2026-05). Wahrscheinlich INWX, IONOS oder Cloudflare. |
| DNS-Host             | beim Registrar — A-Records direkt setzen (siehe DEPLOYMENT.md §2.B) |
| VPS                  | IONOS, Ubuntu 24.04 LTS (geteilt mit wappsite4you.de) |
| Server-Pfad          | `/var/www/restaurantaltkarow`                         |
| User                 | `deploy` (sudo)                                       |
| Local Node-Port      | **3001** (wappsite belegt 3000)                       |
| PM2-Process-Name     | `restaurantaltkarow`                                  |
| PM2-Config           | `ecosystem.config.cjs` (Server, nicht im Repo nötig)  |
| Log-Pfad             | `/var/log/restaurantaltkarow/{out,err}.log`           |
| Nginx-Config         | `/etc/nginx/sites-available/restaurantaltkarow`       |
| TLS                  | Let's Encrypt (Auto-Renewal via vorhandenem Timer)    |

### Annahmen über den Server

- Grundeinrichtung (User `deploy`, SSH-Keys, Node 20+, PM2, Nginx, UFW, Fail2Ban, systemd PM2-Startup) existiert bereits aus dem wappsite-Setup. **Nicht erneut ausführen.**
- `pm2 startup systemd` wurde einmalig unter User `deploy` durchgeführt. Für jede neue App reicht `pm2 save`.
- **`pm2 unstartup`** darf niemals ohne Absicht ausgeführt werden.
- Beide Sites teilen sich denselben Nginx-Prozess, dieselbe Firewall, dasselbe `certbot.timer`, denselben PM2-systemd-Service.
- **Domain-Status:** `restaurant-alt-karow.berlin` ist die finale Domain. `.berlin` wird **nicht** von Wix angeboten, daher liegt sie bei einem anderen Registrar (INWX, IONOS, Cloudflare o. ä.). DNS-Records werden direkt beim Registrar gesetzt (siehe `DEPLOYMENT.md §2.B`), kein Umweg über Wix nötig. SSL via Let's Encrypt funktioniert unabhängig vom Registrar. — Frühere Iterationen dieses Dokuments gingen von einer `.de`-Domain bei Wix aus; die entsprechenden Abschnitte in `DEPLOYMENT.md §2.A` sind nur noch für den Fall relevant, dass tatsächlich noch eine Wix-Domain involviert ist.
- **Bekannte harmlose Warnung beim `nginx -t`:** `"ssl_stapling" ignored, no OCSP responder URL in the certificate "/etc/letsencrypt/live/wappsite4you.de/fullchain.pem"`. Grund: Let's Encrypt hat 2025 OCSP-Responder-URLs aus neuen Certs entfernt. Die `ssl_stapling on;` / `ssl_stapling_verify on;` Direktiven in der wappsite-Nginx-Config sind veraltet, aber funktional unschädlich (`test is successful` kommt trotzdem). Für die neue restaurantaltkarow-Site daher `--staple-ocsp` beim Certbot-Aufruf **weggelassen**. Falls Cleanup gewünscht: zwei Zeilen aus `/etc/nginx/sites-available/wappsite4you` entfernen → reload.

### PM2 / Port-Konvention auf diesem VPS

| Projekt                  | Port   | PM2-Name             | Status         |
| ------------------------ | ------ | -------------------- | -------------- |
| wappsite4you.de          | `3000` | `wappsite4you`       | aktiv          |
| restaurant-alt-karow.berlin  | `3001` | `restaurantaltkarow` | dieses Projekt |
| (mxprotec)               | `3002` | `mxprotec`           | reserviert     |
| (mijocatering)           | `3003` | `mijocatering`       | reserviert     |

**Regeln:**

- Prozessname = Projektordnername (lowercase, keine Bindestriche).
- Neue App = nächster freier Port aufsteigend ab `3000`.
- Eigener Server-Pfad `/var/www/<name>`, eigenes Log-Verzeichnis `/var/log/<name>/`, eigener Nginx-Server-Block, eigenes TLS-Cert.
- Im ecosystem **immer** `./node_modules/next/dist/bin/next` als `script` — kein globales `next`.
- Nach jeder strukturellen PM2-Änderung: `pm2 save`.
- Routine-Deploys: `pm2 reload <name> --update-env`. `restart` nur bei hängenden Prozessen.

---

## 6. SEO-Strategie

- **`metadataBase`** in `app/layout.tsx` auf `siteConfig.url` gesetzt.
- **Title-Template:** `%s · Restaurant Alt-Karow` (Per-Page-`title` wird automatisch ergänzt).
- **Per-Page-Metadata:** Jede Seite exportiert `metadata`. Impressum & Datenschutz: `robots: { index: false, follow: true }`.
- **OpenGraph:** Standard-Image `/images/aussenansicht.avif`, Type `website`, Locale `de_DE`.
- **JSON-LD `Restaurant`** in `app/layout.tsx` mit `name`, `address`, `telephone`, `openingHoursSpecification`, `servesCuisine`, `priceRange: "€€"`. Strukturierte Daten für Google Local Pack / Maps-Card.
- **`sitemap.xml`** dynamisch via `app/sitemap.ts` (Next-Konvention).
- **`robots.txt`** via `app/robots.ts` mit `sitemap`-URL und `disallow: ['/impressum', '/datenschutz', '/admin', '/admin/login']`.
- **Keywords:** Auf lokale Restaurant-Suchbegriffe optimiert („Restaurant Berlin Karow", „Restaurant Pankow", „Deutsche Küche Berlin", „Bankettsaal Berlin", „Hochzeit Restaurant Berlin").

---

## 7. Inhaltsdaten — wo was steht

| Datentyp                  | Datei                          | Hinweis                                                           |
| ------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| Adresse, Telefon, Hours, Räume (mit Bildern), Tagline | `lib/siteConfig.ts`  | Single Source of Truth — wird von Header, Footer, JSON-LD, allen Seiten konsumiert. Räume haben `image?` + `alt`. |
| Speisekarten-Sections     | `content/menu.ts`              | Echte Karte (aus `Speisekarte/speisekarte.pdf` übernommen). Mit `id` (Anker-Nav), `title`, `subtitle`, `note?`, `items[]`. Items: `name`, `description?`, `price?`, `tags?` |
| Galerie-Bilder            | `content/gallery.ts`           | `src`, `alt`, `caption?`, `category` (`restaurant` / `speisen` / `veranstaltungen` / `ambiente`) |
| Buffet-Konfiguration      | `content/buffet.ts`            | Varianten, Gerichte, Beilagen, Suppen, Vorspeisen, Schnittchen, Desserts, Limits, Meta-Texte pro Buffet-Typ |
| Reservierungs-Regeln      | `lib/reservation-rules.ts`     | Pure Funktionen: Öffnungstage, Slot-Generierung (12:00 – 20:00 / 16:00), Mindest-Vorlauf 2 Öffnungstage |
| Bilder                    | `public/images/`               | JPG für Foto-Aufnahmen, PNG fürs Schriftlogo, AVIF wo verfügbar. `next/image` optimiert.       |

**Wichtig:** Speisekarte und Galerie sind so strukturiert, dass neue Inhalte **nur durch Editieren der `.ts`-Datei** dazukommen. Neue Galerie-Kategorie? Eintrag in `galleryCategories`. Keine UI-Änderung nötig.

---

## 8. Wichtige Konventionen für künftige Arbeit

1. **Keine voreilige Komplexität.** Lieber drei Zeilen wiederholen als eine vorzeitige Abstraktion. Tailwind-Utilities direkt im JSX sind ok, solange sie nicht zur Tapete werden.
2. **Server-Komponenten by default.** `"use client"` nur, wenn wirklich Browser-State, Event-Handler oder Effects nötig sind.
3. **Inhalte gehen in `content/` oder `lib/siteConfig.ts`.** Keine hardcoded Strings in Komponenten, wenn die Information mehrfach gebraucht wird oder vom Betreiber später geändert werden könnte.
4. **Wir HABEN bereits:** SQLite (better-sqlite3), HMAC-Cookie-Auth, Self-hosted Analytics. Vor dem Hinzufügen weiterer Persistenz/Auth-Schichten (Prisma, NextAuth, Drittanbieter-DB) erst klären, ob das wirklich nötig ist — die aktuelle Lösung trägt deutlich mehr als ein Restaurant-Site bräuchte.
5. **`.env.production` niemals committen**, immer `chmod 600` auf dem Server.
6. **Lokale Entwicklung:** `npm run dev` läuft auf `http://localhost:3000`. Server: `127.0.0.1:3001`. Diskrepanz absichtlich.
7. **Commits/Pushes nicht selbst ausführen.** Git-Operationen führt der User selbst aus; Agents geben die Befehle aus. (Siehe Memory-Eintrag `feedback_git_commits`.)
8. **Console-Befehle immer vollständig und nach Umgebung gruppiert ausgeben.** Wenn eine Aufgabe sowohl lokal als auch auf dem VPS Befehle erfordert, **alle** Befehle in einem Block listen — sauber getrennt mit Labels `lokal:` und `vps:`. Keine Auslassungen, keine Platzhalter à la „dann die üblichen Schritte". Format:
   ```
   lokal:
   git add .
   git commit -m "feat: ERKLÄRUNG"
   git push

   vps:
   ssh deploy@31.70.80.71
   cd /var/www/restaurantaltkarow
   git pull
   npm ci
   npm run build
   pm2 reload restaurantaltkarow --update-env
   ```
   Auch bei kleinen Änderungen: lieber den vollständigen Mini-Block geben als „push und auf dem Server pullen". (Siehe Memory-Eintrag `feedback_console_commands`.) **Commit-Messages: kurze Einzeiler, max ~70 Zeichen, kein Body, kein HEREDOC.**
9. **`npm audit fix --force` NIEMALS ausführen.** `postcss`-Warnung ist transitiv über Next.js, `--force` würde Next downgraden. Postcss ist via `overrides` in `package.json` auf `^8.5.10` gepinnt.
10. **Vor jedem grafischen Eingriff** kurz prüfen: passt die Änderung zur Vintage-Identität (Farben, Typo, Ornamente)? Wenn unsicher → `SectionHeading` + `Ornament` einsetzen, nicht eigene neue Elemente erfinden.
11. **Bei jeder neuen Seite** `metadata` exportieren (mindestens `title` + `description`) und in `app/sitemap.ts` ergänzen, falls indexierbar.
12. **Typografische Anführungszeichen** in TypeScript-Strings sind tückisch — beim Mischen mit `"…"` kann ein unausgeglichenes `"` den Parser zerschießen (passiert mit „Medovik"). Im Zweifel `&bdquo;` und `&ldquo;` oder Backticks nutzen.
13. **bcrypt-Hashes in `.env`** müssen jedes `$` mit `\` escapen — sonst frisst Next.js' dotenv-expand die `$2a$12$…`-Sequenzen und der Hash kommt zerstört im Prozess an. Beispiel: `ADMIN_PASSWORD_HASH=\$2a\$12\$abc…`. Das `scripts/hash-password.mjs`-Helfer-Skript gibt die Zeile bereits korrekt escapet aus.
14. **`@next/env` ist CommonJS** — beim Import in `.mjs`-Skripten **kein** named import. Stattdessen: `import nextEnv from "@next/env"; const { loadEnvConfig } = nextEnv;` (siehe `scripts/check-nextenv.mjs`).
15. **`sqlite3` CLI ist auf Ubuntu nicht standardmäßig drin** — vor DB-Diagnose: `sudo apt install -y sqlite3`. Alternative: Node-One-Liner mit `better-sqlite3` (ist sowieso installiert).
16. **PM2-Reload nach `.env.production`-Änderung** zwingend mit `--update-env`. Ohne dieses Flag behält PM2 die alten Env-Variablen im Prozess.

---

## 8.5 Hilfsskripte unter `scripts/`

Diagnose- und Verwaltungs-Helfer. Aufrufbar via `node scripts/<name>.mjs` oder `npm run`-Alias.

| Skript | Zweck | Aufruf |
|---|---|---|
| `hash-password.mjs` | Generiert bcrypt-Hash für `ADMIN_PASSWORD_HASH`, **gibt ihn `\$`-escapet aus** (dotenv-expand-safe) | `npm run admin:hash -- "neuesPasswort"` |
| `check-admin-auth.mjs` | Liest `.env.production` mit eigenem Mini-Parser, vergleicht Klartext-Passwort gegen Hash via bcrypt — zeigt sofort, ob Login passen würde | `npm run admin:check -- "passwort"` |
| `check-nextenv.mjs` | Lädt `.env.production` mit Next.js' eigenem Loader (`@next/env`) und zeigt was die laufende App wirklich sieht — fängt das `$`-Escape-Problem im Hash | `node scripts/check-nextenv.mjs` |

Wichtige Diagnose-Reihenfolge bei „Admin-Login geht nicht":

1. `npm run admin:check -- "passwort"` → ist Hash korrekt für dieses Passwort?
2. `node scripts/check-nextenv.mjs` → kommt der Hash unverstümmelt im Next.js-Prozess an?
3. Wenn beides ✓, aber Login schlägt fehl → PM2 hat alte Env: `pm2 reload restaurantaltkarow --update-env`.

---

## 9. Bekannte offene Punkte / nächste Schritte

**Inhaltlich & rechtlich:**

- [ ] **Datenschutzerklärung** anwaltlich prüfen lassen — Formulare + self-hosted Analytics + Cookie-Banner sind drin, der Text reflektiert das, aber rechtliche Final-Prüfung steht aus.
- [ ] **Impressum** finale Verifikation durch Inhaber (USt-IdNr. „auf Anfrage" ggf. später eintragen).
- [ ] **Mehr Bilder** ergänzen (Speisen, Feiern, Saison-Aufnahmen) — Galerie wächst dann automatisch über `content/gallery.ts`.
- [ ] **`content/menu.ts`** synchron halten mit `public/dokumente/speisekarte.pdf`, falls Karte sich ändert.
- [ ] **Eigene Absender-Adresse** `kontakt@restaurant-alt-karow.berlin` einrichten — aktuell sendet die Site über `restaurant@mijorent.de` (Spam-Risiko durch Domain-Mismatch).

**Betrieb & Daten:**

- [ ] **SQLite-Datenbank-Backup** auf dem VPS einrichten — Cron, z. B. täglich `cp data/*.db /var/backups/restaurantaltkarow/$(date +%F).db`. Enthält Live-Reservierungen UND Analytics-Daten.
- [ ] **Aufbewahrungs-Cron für Analytics** — Roh-Events nach 90 Tagen löschen (in Datenschutzerklärung versprochen). Vorschlag: tägliches `DELETE FROM analytics_events WHERE created_at < datetime('now','-90 days')`.
- [ ] **End-to-End-Test** durchspielen: Reservierungsanfrage → Eingangs-Mail → Admin bestätigen → PDF-Mail → einmal absagen → einmal Alternativ-Vorschlag.
- [ ] **Optional: Reservierungs-Verwaltung erweitern** — Kalender-View, Auslastung pro Slot, Kapazitätslimits (z. B. max. 60 Pers. gleichzeitig). Aktuell rein Listen-basiert.

**SEO / Polish:**

- [ ] **OG-Image-Variante** für Social Sharing (1200×630 mit Logo + Tagline) — aktuell wird Hero-Aussenansicht genutzt.

**Architektur (langfristig):**

- [ ] **Migration zu Prisma** als ORM (statt direktem better-sqlite3). Vorteile: versionierte Migrations-Files, Type-Safety durch generiertes Schema. Touch-Points: `lib/db.ts` + alle Consumer mit snake_case → camelCase. Lokal `prisma migrate dev --name init`, VPS `prisma migrate deploy`. `DATABASE_URL=file:./data/…` statt `DATABASE_PATH`.

**VPS-Wartung:**

- [ ] **`pm2-logrotate`** ist als Modul auf dem VPS aktiv (gesehen in `pm2 list`). Standard-Einstellungen prüfen, ggf. `max_size`/`retain` anpassen.
- [ ] **Sobald weitere Projekte (mxprotec/mijocatering) live gehen:** Port-Tabelle in §5 auf Status „aktiv" aktualisieren.

---

## 10. Wichtige Pfade

| Was                                    | Wo                                                                   |
| -------------------------------------- | -------------------------------------------------------------------- |
| VPS IPv4                               | `31.70.80.71`                                                         |
| SSH-Login                              | `ssh deploy@31.70.80.71`                                              |
| Lokales Projekt                        | `C:\Users\PC\code\restaurantaltkarow`                                |
| Bilder-Quellen (User)                  | `C:\Users\PC\code\restaurantaltkarow\Bilder` (nicht im Build)        |
| Schwesterprojekt (Server-Referenz)     | `C:\Users\PC\code\wappsite`                                          |
| Server-Projektroot                     | `/var/www/restaurantaltkarow`                                        |
| Server-Logs                            | `/var/log/restaurantaltkarow/`                                       |
| Nginx-Config (Server)                  | `/etc/nginx/sites-available/restaurantaltkarow`                      |
| Let's-Encrypt-Cert (Server)            | `/etc/letsencrypt/live/restaurant-alt-karow.berlin/`                     |
| User-Memory (Cross-Session-Kontext)    | `C:\Users\PC\.claude\projects\C--Users-PC\memory\MEMORY.md`          |
| Aktuelle Live-Website                  | https://restaurant-alt-karow.berlin                                  |
| Frühere Wix-Website (offline)          | wurde durch unsere Site abgelöst — nur Inhalte/Adresse als Referenz übernommen |

---

## 11. Verhältnis zur alten Website

Vor diesem Projekt gab es eine Wix-Website auf einer früheren Domain (`.de`). Sie wurde inhaltlich als Referenz analysiert — Adresse, Öffnungszeiten, Räume, Tagline stammen daher. **Visuell und technisch** ist die aktuelle Site `restaurant-alt-karow.berlin` eine komplette Neuentwicklung; nichts wurde kopiert. Die alte Wix-Site ist inzwischen abgelöst.

---

## 12. Sprache

Die primäre Arbeitssprache mit dem User ist **Deutsch**. Code-Identifier bleiben Englisch (Standard-Konvention), Inhaltstexte, Kommentare und Doku sind Deutsch. UI-Texte folgen einem **familiär-herzlichen Ton** mit professionellem Unterton — keine Steifheit, keine Werbefloskeln.
