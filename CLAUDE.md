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

**Aktueller Stand:** Vollwertige Marketing-Website mit Speisekarte, Veranstaltungs-Seite, Galerie, Kontakt. Inhalte teilweise auf Platzhalter-Basis (Speisekarte, Impressum, Datenschutz) — müssen vor Live-Gang vom Betreiber verifiziert werden.

**Bewusste Nicht-Ziele:**

- Kein Online-Reservierungssystem — Reservierungen laufen telefonisch.
- Kein CMS — Inhalte als TypeScript-Module unter `content/` (Code-as-Content, schneller, versioniert).
- Keine Datenbank, kein Auth, kein E-Commerce.
- Keine externen Tracker, keine Werbe-Cookies.

---

## 2. Stack

| Schicht       | Wahl                              | Begründung                                                            |
| ------------- | --------------------------------- | --------------------------------------------------------------------- |
| Framework     | **Next.js 16 (App Router)**       | Static Export-fähig, Image Optimization, SEO-Metadata-API.            |
| Sprache       | **TypeScript 5 strict**           | `tsconfig.json` mit `strict: true`, `jsx: "react-jsx"`.               |
| Styling       | **Tailwind CSS v4** (`@theme inline`) | Theme-Tokens als CSS-Custom-Properties; kein PostCSS-Plugin-Wirrwarr. |
| Fonts         | `next/font/google`                | Playfair Display (Headings, Serif) + Inter (Body, Sans).             |
| Bilder        | `next/image`                      | AVIF-Optimierung; Bilder in `public/images/`.                         |
| Node          | ≥ 20 LTS                          |                                                                       |
| Process Mgr   | PM2 (Production)                  | Gemeinsamer systemd-Service mit wappsite.                             |
| Reverse Proxy | Nginx (eigener Server-Block)      | Port 3001 → 443 mit TLS.                                              |
| TLS           | Let's Encrypt / Certbot           | Auto-Renewal via vorhandenem `certbot.timer`.                         |

### Wichtige Hinweise zu Next.js 16

- **App Router** ist Pflicht — kein `pages/`-Verzeichnis.
- Komponenten sind **Server-Komponenten by default**. Nur `Header.tsx` ist `"use client"` (Mobile-Menü-State, Scroll-Listener). Alles andere ist Server-Side.
- Bei Bibliotheks- oder Konfigurationsfragen zu Next.js: **immer aktuelle Doku konsultieren** (z. B. via `context7` MCP) — Next.js 16 enthält Breaking Changes gegenüber 13/14/15.
- Static Generation: alle Seiten sind `○ (Static)` — kein SSR nötig, kein API-Endpoint, daher reicht ein simpler Node-Server hinter Nginx (oder ggf. ein späteres `next export` für ein reines CDN-Deployment).

---

## 3. Projektstruktur

```
restaurantaltkarow/
├── app/
│   ├── layout.tsx              # Root: Header + Footer + Fonts + JSON-LD
│   ├── page.tsx                # Startseite
│   ├── globals.css             # Tailwind + @theme + Utility-Klassen
│   ├── icon.svg                # Favicon (App-Router-Konvention)
│   ├── sitemap.ts              # auto-generiert /sitemap.xml
│   ├── robots.ts               # auto-generiert /robots.txt
│   ├── speisekarte/page.tsx
│   ├── veranstaltungen/page.tsx
│   ├── galerie/page.tsx
│   ├── kontakt/page.tsx
│   ├── impressum/page.tsx
│   └── datenschutz/page.tsx
├── components/
│   ├── Header.tsx              # "use client" — sticky, Light/Dark-Modus je nach Scroll & Page
│   ├── Footer.tsx              # dunkler Wood-Block mit Gold-Akzenten
│   ├── Hero.tsx                # Fullscreen-Hero mit mehrlagigem Overlay (.hero-vignette)
│   ├── Reveal.tsx              # "use client" — IntersectionObserver Fade-up, einmalig
│   ├── Ornament.tsx            # SVG-Rautendekoration (gold/cream/ink)
│   ├── SectionHeading.tsx      # Eyebrow + H2 + Ornament + Description, tone dark/light
│   ├── OpeningHours.tsx        # tabellarische Öffnungszeiten
│   ├── ReservationCTA.tsx      # Burgundy-Section mit radialem Licht, jede Seite
│   ├── MenuList.tsx            # Speisekarten-Sections mit Dotted-Leader + Hover-Color
│   └── GalleryGrid.tsx         # responsives Grid mit Aspekt-Variation
├── content/
│   ├── menu.ts                 # Speisekarten-Sections + Items (Platzhalter)
│   └── gallery.ts              # Galerie-Items + Kategorien
├── lib/
│   └── siteConfig.ts           # Stammdaten (Name, Adresse, Hours, Räume, Tel)
├── public/
│   └── images/                 # /aussenansicht.avif, /essensbereich.avif
├── Bilder/                     # User-Quellordner (außerhalb des Builds, NICHT committen)
├── .env.example
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

### Farbpalette (CSS-Custom-Properties in `app/globals.css` via `@theme`)

Tokens sind in `app/globals.css` definiert und stehen automatisch als Tailwind-Klassen zur Verfügung (`bg-burgundy`, `text-ink-strong`, `border-gold/40` etc.).

**Hell auf dunkel (Texte auf dunklem Hintergrund):**

| Token                     | Hex       | WCAG vs. `--color-wood` (#1f1109) | Verwendung                                          |
| ------------------------- | --------- | --------------------------------- | --------------------------------------------------- |
| `--color-paper`           | `#fdf9ef` | **≈14:1** AAA                      | Hellster, wärmster Cremeton — Brand, Headings, Body |
| `--color-cream`           | `#f8f0db` | ≈13:1 AAA                          | Standard heller Text (Reserve)                      |
| `--color-cream-soft`      | `#efe4c8` | ≈11:1 AAA                          | Sekundärtext (Fußnoten, Disclaimer)                 |
| `--color-gold-soft`       | `#d8b974` | ≈7.5:1 AAA                         | Akzenttext auf dunkel (Uhrzeiten, Links, Eyebrows)  |
| `--color-gold-pale`       | `#ecd8a0` | ≈10:1 AAA                          | Reserve                                              |

**Dunkel auf hell (Texte auf hellem Hintergrund):**

| Token                     | Hex       | WCAG vs. `--color-paper` (#fdf9ef) | Verwendung                                       |
| ------------------------- | --------- | ---------------------------------- | ------------------------------------------------ |
| `--color-ink-strong`      | `#0f0a06` | ≈18:1 AAA                          | Headings, Hauptzitate, Schlüsselwörter, Brand   |
| `--color-ink`             | `#1c130c` | ≈15:1 AAA                          | **Standard-Bodytext**                            |
| `--color-ink-soft`        | `#34281c` | ≈11:1 AAA                          | Body-Text mit weniger Wucht (z. B. Disclaimer)  |
| `--color-muted`           | `#5e4f3c` | ≈7:1 AAA                           | NUR Bildunterschriften / Tabellen-Sekundärinfo  |

**Akzente / Backgrounds:**

| Token                     | Hex       | Verwendung                                          |
| ------------------------- | --------- | --------------------------------------------------- |
| `--color-burgundy`        | `#6b1f24` | Primärakzent: CTA-Buttons, aktive Nav, Preise       |
| `--color-burgundy-deep`   | `#4d161a` | Hover für burgundy                                  |
| `--color-burgundy-soft`   | `#8a2c33` | Reserve                                              |
| `--color-gold`            | `#b08a3e` | Ornamente, Eyebrows auf hellem Grund, Trennlinien   |
| `--color-paper`           | `#fdf9ef` | Haupt-BG (Body)                                     |
| `--color-paper-deep`      | `#f3ead4` | Karten-BG mit Tiefe                                 |
| `--color-cream-deep`      | `#e6d8bf` | Sekundär-Sektion-BG (hell)                          |
| `--color-wood`            | `#1f1109` | Footer + dunkle Sektionen                           |
| `--color-wood-mid`        | `#281609` | Reserve                                              |
| `--color-wood-soft`       | `#36210f` | Reserve                                              |

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

## 5. Server / Deployment — Kerninfo

> Detaillierte Schritt-für-Schritt-Anleitung: `DEPLOYMENT.md`.

| Schlüsselwert        | Wert                                                  |
| -------------------- | ----------------------------------------------------- |
| Domain               | `restaurant-alt-karow.de` (+ `www.` Redirect → Apex)  |
| Domain-Registrar     | **Wix** (Stand 2026-05) — voller Transfer noch nicht möglich |
| DNS-Host             | **Wix DNS** (bis Transfer) — A-Records werden dort gepflegt |
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
- **Domain-Status:** `restaurant-alt-karow.de` ist bei **Wix** registriert (Registrar + DNS-Host). Voller Transfer aktuell nicht möglich. Strategie: Wix DNS-Panel verwenden, dort `A @` + `A/CNAME www` auf VPS-IPv4 umlenken (siehe `DEPLOYMENT.md §2.A`). SSL via Let's Encrypt funktioniert unabhängig vom Registrar — Wix-eigenes SSL-Cert bleibt nutzlos liegen, kein Konflikt. Wichtig: Domain in Wix vorher von der Wix-Website **trennen** („Disconnect"/„Point to external"), sonst überschreibt Wix manuell gesetzte DNS-Records. Vor dem Cutover TTL für 24 – 48 h auf 300 s reduzieren. MX/SPF/DKIM/DMARC-Records **nicht anrühren**, falls vorhanden. Vollständiger Registrar-Transfer als künftiges ToDo dokumentiert (`§2.B` in DEPLOYMENT.md).
- **Bekannte harmlose Warnung beim `nginx -t`:** `"ssl_stapling" ignored, no OCSP responder URL in the certificate "/etc/letsencrypt/live/wappsite4you.de/fullchain.pem"`. Grund: Let's Encrypt hat 2025 OCSP-Responder-URLs aus neuen Certs entfernt. Die `ssl_stapling on;` / `ssl_stapling_verify on;` Direktiven in der wappsite-Nginx-Config sind veraltet, aber funktional unschädlich (`test is successful` kommt trotzdem). Für die neue restaurantaltkarow-Site daher `--staple-ocsp` beim Certbot-Aufruf **weggelassen**. Falls Cleanup gewünscht: zwei Zeilen aus `/etc/nginx/sites-available/wappsite4you` entfernen → reload.

### PM2 / Port-Konvention auf diesem VPS

| Projekt                  | Port   | PM2-Name             | Status         |
| ------------------------ | ------ | -------------------- | -------------- |
| wappsite4you.de          | `3000` | `wappsite4you`       | aktiv          |
| restaurant-alt-karow.de  | `3001` | `restaurantaltkarow` | dieses Projekt |
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
- **`robots.txt`** via `app/robots.ts` mit `sitemap`-URL und `disallow: ['/impressum', '/datenschutz']`.
- **Keywords:** Auf lokale Restaurant-Suchbegriffe optimiert („Restaurant Berlin Karow", „Restaurant Pankow", „Deutsche Küche Berlin", „Bankettsaal Berlin", „Hochzeit Restaurant Berlin").

---

## 7. Inhaltsdaten — wo was steht

| Datentyp                  | Datei                          | Hinweis                                                           |
| ------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| Adresse, Telefon, Hours, Räume, Tagline | `lib/siteConfig.ts`  | Single Source of Truth — wird von Header, Footer, JSON-LD, allen Seiten konsumiert |
| Speisekarten-Sections     | `content/menu.ts`              | Mit `id` (für Anker-Nav), `title`, `subtitle`, `items[]`. Items: `name`, `description?`, `price?`, `tags?` |
| Galerie-Bilder            | `content/gallery.ts`           | `src`, `alt`, `caption?`, `category` (`restaurant` / `speisen` / `veranstaltungen` / `ambiente`) |
| Bilder                    | `public/images/`               | AVIF bevorzugt; `next/image` macht den Rest                       |

**Wichtig:** Speisekarte und Galerie sind so strukturiert, dass neue Inhalte **nur durch Editieren der `.ts`-Datei** dazukommen. Neue Galerie-Kategorie? Eintrag in `galleryCategories`. Keine UI-Änderung nötig.

---

## 8. Wichtige Konventionen für künftige Arbeit

1. **Keine voreilige Komplexität.** Lieber drei Zeilen wiederholen als eine vorzeitige Abstraktion. Tailwind-Utilities direkt im JSX sind ok, solange sie nicht zur Tapete werden.
2. **Server-Komponenten by default.** `"use client"` nur, wenn wirklich Browser-State, Event-Handler oder Effects nötig sind.
3. **Inhalte gehen in `content/` oder `lib/siteConfig.ts`.** Keine hardcoded Strings in Komponenten, wenn die Information mehrfach gebraucht wird oder vom Betreiber später geändert werden könnte.
4. **Keine Datenbank, kein Prisma, kein Auth-System** ohne ausdrückliche Anforderung.
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
   Auch bei kleinen Änderungen: lieber den vollständigen Mini-Block geben als „push und auf dem Server pullen". (Siehe Memory-Eintrag `feedback_console_commands`.)
8. **`npm audit fix --force` NIEMALS ausführen.** `npm audit` meldet eine moderate `postcss < 8.5.10`-XSS-Schwachstelle (kommt transitiv über Next.js). `--force` würde Next auf 9.3.3 downgraden. Build-Time-only, mit eigenen CSS-Dateien praktisch nicht ausnutzbar. Lösung: abwarten, oder via `overrides` in `package.json` auf `postcss ^8.5.10` pinnen.
9. **Vor jedem grafischen Eingriff** kurz prüfen: passt die Änderung zur Vintage-Identität (Farben, Typo, Ornamente)? Wenn unsicher → `SectionHeading` + `Ornament` einsetzen, nicht eigene neue Elemente erfinden.
10. **Bei jeder neuen Seite** `metadata` exportieren (mindestens `title` + `description`) und in `app/sitemap.ts` ergänzen, falls indexierbar.
11. **Typografische Anführungszeichen** in TypeScript-Strings sind tückisch — beim Mischen mit `"…"` kann ein unausgeglichenes `"` den Parser zerschießen (passiert mit „Medovik"). Im Zweifel `&bdquo;` und `&ldquo;` oder Backticks nutzen.

---

## 9. Bekannte offene Punkte / nächste Schritte

- [ ] **Inhalte vom Betreiber finalisieren:** Speisekarte (`content/menu.ts`) durch echte Karte ersetzen — aktuelle Werte sind Platzhalter mit plausiblen Preisen.
- [ ] **Impressum** vervollständigen (verantwortliche Person, ggf. USt-IdNr.).
- [ ] **Datenschutzerklärung** anwaltlich prüfen lassen.
- [ ] **Mehr Bilder** in `public/images/` ablegen und in `content/gallery.ts` referenzieren (besonders: Speisen, Innenraum-Detail, Terrasse, Feier-Settings). Aktuell nur 2 Bilder.
- [ ] **Echte Telefonnummer / E-Mail** verifizieren (`lib/siteConfig.ts`). E-Mail-Feld ist leer — könnte für Kontaktformular gebraucht werden.
- [ ] **Optional: Kontaktformular** mit serverseitiger Mail-Versand (analog wappsite IONOS-SMTP) — würde `app/api/contact/route.ts` + `.env.production` erfordern.
- [ ] **OG-Image-Variante** für Social Sharing (1200×630, mit Logo/Tagline). Aktuell nutzen wir die Außenansicht im 16:9-Crop, was funktioniert, aber nicht optimal ist.
- [ ] **GitHub-Repo** anlegen, initialen Commit (durch den User).
- [ ] **DNS-Umlenkung bei Wix** durchführen — siehe DEPLOYMENT.md §2.A. Vorher: TTL auf 300 s, Domain bei Wix von Wix-Site trennen. Records: `A @` und `A www` → VPS-IPv4.
- [ ] **Erstes Deployment** durchführen (siehe `DEPLOYMENT.md`).
- [ ] **Wix-Website unpublishen** nach erfolgreichem Cutover (verhindert Verwechslungen).
- [ ] **Vollständiger Domain-Transfer** weg von Wix (sobald die Transfer-Sperre fällt — ICANN 60-Tage-Frist beachten). Ziel-Registrar offen (IONOS-Domain-Panel würde Domain-Verwaltung in dasselbe Konto wie wappsite4you.de bringen — pragmatisch). Vorgehen: DEPLOYMENT.md §2.B.
- [ ] **Bei erstem Deploy:** prüfen, ob `pm2-logrotate` bereits VPS-weit aktiv ist; sonst einmalig installieren (siehe DEPLOYMENT.md 5.7).
- [ ] **Sobald weitere Projekte (mxprotec/mijocatering) live gehen:** Port-Tabelle in Abschnitt 5 auf Status „aktiv" aktualisieren.

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
| Let's-Encrypt-Cert (Server)            | `/etc/letsencrypt/live/restaurant-alt-karow.de/`                     |
| User-Memory (Cross-Session-Kontext)    | `C:\Users\PC\.claude\projects\C--Users-PC\memory\MEMORY.md`          |
| Referenz-Live-Website (alt)            | https://www.restaurant-alt-karow.de/                                 |

---

## 11. Verhältnis zur alten Website

Die bestehende Live-Website `www.restaurant-alt-karow.de` (Stand 2026) wurde inhaltlich als Referenz analysiert — Adresse, Öffnungszeiten, Räume, Tagline „Neuer Geschmack am vertrauten Ort" stammen daher. **Visuell und technisch** ist die neue Site eine komplette Neuentwicklung; nichts wurde kopiert.

---

## 12. Sprache

Die primäre Arbeitssprache mit dem User ist **Deutsch**. Code-Identifier bleiben Englisch (Standard-Konvention), Inhaltstexte, Kommentare und Doku sind Deutsch. UI-Texte folgen einem **familiär-herzlichen Ton** mit professionellem Unterton — keine Steifheit, keine Werbefloskeln.
