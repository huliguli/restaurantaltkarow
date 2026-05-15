# CLAUDE.md — Restaurant Alt Karow

> Persistenter Projektkontext für Claude-Agents. Diese Datei ist primär für KI-Agents geschrieben, nicht für den Endnutzer. Sie soll jeden neuen Agent in unter 2 Minuten arbeitsfähig machen.
>
> **Pflege-Hinweis (für Agents):** Diese Datei ist der zentrale, langfristige Wissensspeicher des Projekts. Sie ist **kein einmaliges Dokument** — sie wird aktiv gepflegt. Aktualisiere sie immer dann, wenn du in deiner Sitzung
> – eine neue technische Entscheidung triffst, eine neue Konvention einführst, eine neue Abhängigkeit hinzufügst,
> – neue Server-/PM2-/Nginx-Details lernst oder änderst,
> – wichtige Annahmen machst, ein nicht-triviales Problem löst,
> – einen Punkt aus Abschnitt 7 (offene ToDos) erledigst oder einen neuen identifizierst.
> Hänge neue offene ToDos in Abschnitt 7 an, trage erledigte aus oder hake sie ab. Halte die Tabelle in Abschnitt 5 und die Port-Konvention konsistent zur Realität.

---

## 1. Projektziel

Statische / serverseitig gerenderte Website für das **Restaurant Alt Karow** (Berlin-Karow).

**Aktueller Stand:** Reines technisches Fundament. Kein finales Design, keine Business-Logik, keine produktive UI. Inhalt und Features werden in späteren Iterationen ergänzt.

**Bewusste Nicht-Ziele (Stand: Initial-Setup):**

- Keine SPA/Headless-CMS-Architektur vorgeben — die Entscheidung steht noch aus.
- Kein Online-Reservierungs- oder Bestellsystem geplant (kann später als API-Route oder Drittanbieter-Embed kommen).
- Kein User-Login, keine Datenbank, kein Prisma — bewusst weggelassen, bis ein Feature es erzwingt.

---

## 2. Stack

| Schicht       | Wahl                              | Begründung                                                            |
| ------------- | --------------------------------- | --------------------------------------------------------------------- |
| Framework     | **Next.js 16 (App Router)**       | Konsistent zur Schwester-Site `wappsite`; SSR, ISR, API-Routes inklusive. |
| Sprache       | **TypeScript 5 (strict)**         | `tsconfig.json` mit `strict: true`.                                   |
| UI            | **Keine** (Plain React + CSS)     | Bewusst leer — kein Tailwind, kein UI-Kit. Wird bei Designphase ergänzt. |
| Styles        | Minimale `app/globals.css`        | Reset + Body-Font. Nichts darüber hinaus.                             |
| Node          | ≥ 20 LTS                          | Server-Vorgabe (siehe `DEPLOYMENT.md`).                               |
| Process Mgr   | PM2 (Production)                  | Gleicher Standard wie wappsite, gemeinsamer systemd-Service.          |
| Reverse Proxy | Nginx                             | Gleicher Server, separater Server-Block.                              |
| TLS           | Let's Encrypt via Certbot         | Renewal-Timer existiert bereits aus wappsite-Setup.                   |

### Wichtige Hinweise zu Next.js 16

- **App Router** ist Pflicht — kein `pages/`-Verzeichnis.
- Komponenten sind **Server-Komponenten by default**. Client-Komponenten ausdrücklich mit `"use client"` markieren.
- Bei Bibliotheks- oder Konfigurationsfragen zu Next.js: **immer aktuelle Doku konsultieren** (z. B. via `context7` MCP), nicht aus dem Gedächtnis arbeiten — Next.js 16 enthält Breaking Changes gegenüber 13/14/15.

---

## 3. Projektstruktur

```
restaurantaltkarow/
├── app/
│   ├── globals.css        # minimale globale Styles (Reset + Font)
│   ├── layout.tsx         # Root-Layout, <html lang="de">
│   └── page.tsx           # Platzhalter-Startseite
├── public/                # statische Assets (leer + .gitkeep)
├── .env.example           # Vorlage; .env.local / .env.production NIE committen
├── .gitignore
├── CLAUDE.md              # diese Datei
├── DEPLOYMENT.md          # Server-Deploy-Anleitung (zweite Site auf bestehendem VPS)
├── next.config.mjs
├── package.json
└── tsconfig.json
```

**Noch nicht vorhanden, kommt bei Bedarf:**

- `components/` — Komponentenordner. Anlegen, sobald die erste wiederverwendbare Komponente entsteht.
- `lib/` — Hilfsfunktionen, Server-Utilities.
- `app/api/` — Route Handler für Backend-Logik (z. B. Kontaktformular).

---

## 4. Beziehung zu `wappsite` (Schwesterprojekt)

Pfad lokal: `C:\Users\PC\code\wappsite`, deployed als `wappsite4you.de`.

**Was von wappsite übernommen wurde:**

- Deployment-Konventionen (Pfade unter `/var/www/<projekt>`, Logs unter `/var/log/<projekt>`, PM2-Pattern, Nginx-Server-Block-Aufbau).
- DEPLOYMENT.md-Struktur als Vorlage.

**Was bewusst NICHT übernommen wurde:**

- Design / Styling / UI-Komponenten
- Architekturentscheidungen (z. B. Zustand-Store, Prisma, PDF-Generierung)
- Features und Business-Logik
- Tailwind-Konfiguration

→ Wenn ein künftiger Agent versucht ist, Code aus wappsite zu kopieren: **nicht ohne ausdrückliche Aufforderung**. Restaurant Alt Karow soll ein eigenständiges Projekt mit eigenen Designentscheidungen werden.

---

## 5. Server / Deployment — Kerninfo

> Detaillierte Schritt-für-Schritt-Anleitung: `DEPLOYMENT.md`.

| Schlüsselwert        | Wert                                                  |
| -------------------- | ----------------------------------------------------- |
| Domain               | `restaurant-alt-karow.de` (+ `www.` Redirect → Apex)  |
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
- `pm2 startup systemd` wurde einmalig unter User `deploy` durchgeführt — der systemd-Service lädt beim Boot die zuletzt mit `pm2 save` persistierte App-Liste. Für jede neue App reicht `pm2 save`.
- **`pm2 unstartup`** darf niemals ohne Absicht ausgeführt werden — würde den Auto-Start aller Apps killen.
- Beide Sites teilen sich denselben Nginx-Prozess, dieselbe Firewall, dasselbe `certbot.timer`, denselben PM2-systemd-Service.

### PM2 / Port-Konvention auf diesem VPS

Damit künftige Sites konfliktfrei dazukommen, gilt projektübergreifend folgendes Schema:

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
- Nach jeder strukturellen PM2-Änderung (`start`/`delete`/Config-Update): `pm2 save` ausführen.
- Routine-Deploys mit `pm2 reload <name> --update-env`, nicht `restart` — letzteres nur bei hängenden Prozessen.

---

## 6. Wichtige Konventionen für künftige Arbeit

1. **Keine voreilige Komplexität.** Lieber drei Zeilen wiederholen als eine vorzeitige Abstraktion.
2. **Keine Tailwind-/UI-Lib-Einführung im Alleingang.** Falls eine UI-Bibliothek nötig wird, vorher mit dem User klären.
3. **Keine Datenbank, kein Prisma, kein Auth-System** ohne ausdrückliche Anforderung.
4. **`.env.production` niemals committen**, immer `chmod 600` auf dem Server.
5. **Lokale Entwicklung:** `npm run dev` läuft auf `http://localhost:3000`. Auf dem Server läuft Production auf `127.0.0.1:3001` — Diskrepanz absichtlich, weil lokal nur eine App existiert.
6. **Commits/Pushes nicht selbst ausführen.** Der User möchte Git-Operationen selbst durchführen — Claude-Agents geben nur die Befehle aus. (Siehe Memory-Eintrag `feedback_git_commits`.)
7. **`npm audit fix --force` NIEMALS ausführen.** `npm audit` meldet eine moderate `postcss < 8.5.10`-XSS-Schwachstelle (kommt transitiv über Next.js mit). `--force` würde Next auf 9.3.3 downgraden — Projekt-Killer. Die Schwachstelle ist Build-Time-only und mit eigenen CSS-Dateien praktisch nicht ausnutzbar. Lösung: **abwarten** bis Next die postcss-Version bumpt, oder bei Bedarf via `overrides` in `package.json` auf `postcss ^8.5.10` pinnen.

---

## 7. Bekannte offene Punkte / nächste Schritte

- [ ] GitHub-Repo `restaurantaltkarow` anlegen, initialen Commit pushen.
- [ ] Inhaltskonzept: Karte, Öffnungszeiten, Reservierungslogik, Kontakt — vom User noch zu definieren.
- [ ] Design-Entscheidung (Tailwind? CSS Modules? Vanilla?) noch offen.
- [ ] Echte Domain `restaurant-alt-karow.de` registrieren / verifizieren, DNS auf VPS umlenken.
- [ ] Optional: Sitemap, robots.txt, OpenGraph-Metadaten beim ersten Content-Iteration ergänzen.
- [ ] Kontaktformular + SMTP (analog wappsite IONOS-Setup), sobald Anforderung steht.
- [ ] Bei erstem Deploy prüfen, ob `pm2-logrotate` bereits VPS-weit aktiv ist; sonst einmalig installieren (siehe DEPLOYMENT.md 5.7).
- [ ] Sobald weitere Projekte (mxprotec/mijocatering) live gehen: Port-Tabelle in Abschnitt 5 auf Status „aktiv" aktualisieren.

---

## 8. Wichtige Pfade

| Was                                    | Wo                                                                   |
| -------------------------------------- | -------------------------------------------------------------------- |
| Lokales Projekt                        | `C:\Users\PC\code\restaurantaltkarow`                                |
| Schwesterprojekt (Referenz)            | `C:\Users\PC\code\wappsite`                                          |
| Server-Projektroot                     | `/var/www/restaurantaltkarow`                                        |
| Server-Logs                            | `/var/log/restaurantaltkarow/`                                       |
| Nginx-Config (Server)                  | `/etc/nginx/sites-available/restaurantaltkarow`                      |
| Let's-Encrypt-Cert (Server)            | `/etc/letsencrypt/live/restaurant-alt-karow.de/`                     |
| User-Memory (Cross-Session-Kontext)    | `C:\Users\PC\.claude\projects\C--Users-PC\memory\MEMORY.md`          |

---

## 9. Sprache

Die primäre Arbeitssprache mit dem User ist **Deutsch**. Code-Identifier, Commit-Messages und Logs sollten Englisch bleiben (Standard für die Codebasis), Kommentare und Doku in Deutsch sind ok.
