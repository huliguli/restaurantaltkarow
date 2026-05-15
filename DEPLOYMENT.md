# Deployment-Anleitung: restaurant-alt-karow.de auf demselben VPS wie wappsite4you.de

> Schritt-für-Schritt-Anleitung für das **parallele Deployment** einer zweiten Next.js-Website auf einem bestehenden Ubuntu 24.04 VPS, auf dem bereits `wappsite4you.de` läuft. Nutzt die gleiche Infrastruktur: Nginx Reverse Proxy, PM2, Let's Encrypt.

**Zielarchitektur (zwei Sites auf einem VPS):**

```
Internet → DNS
            ├─ wappsite4you.de        ┐
            └─ restaurant-alt-karow.de┘
                          │
                          ▼
                  IONOS VPS (UFW + Fail2Ban)
                       │
                  Nginx (:80 / :443, TLS)
                   ├── Server-Block wappsite4you.de       → 127.0.0.1:3000 (PM2)
                   └── Server-Block restaurant-alt-karow  → 127.0.0.1:3001 (PM2)
```

**Wichtig — Unterschied zur ersten Site:**

- Beide Apps laufen lokal auf **unterschiedlichen Ports** (`3000` und `3001`).
- Beide haben einen **eigenen Nginx-Server-Block**, **eigenes Let's-Encrypt-Zertifikat**, **eigenen PM2-Prozess** und **eigenes Verzeichnis** unter `/var/www/`.
- Die VPS-Grundeinrichtung (User `deploy`, SSH-Keys, Node, UFW, Fail2Ban) **existiert schon** — wird hier **nicht** wiederholt. Falls noch nicht passiert: siehe `wappsite/DEPLOYMENT.md` Schritte 1, 3, 9.

**Konventionen:**

- `# befehl` → als **root** (oder via `sudo`)
- `$ befehl` → als User **`deploy`**
- `<…>` → Platzhalter ersetzen

---

## Inhalt

1. [Voraussetzungen prüfen](#1-voraussetzungen-prüfen)
2. [Domain mit VPS verbinden](#2-domain-mit-vps-verbinden)
3. [Projekt auf den Server bringen](#3-projekt-auf-den-server-bringen)
4. [Abhängigkeiten & Environment](#4-abhängigkeiten--environment)
5. [PM2 für zweite App einrichten](#5-pm2-für-zweite-app-einrichten)
6. [Nginx — zweiten Server-Block anlegen](#6-nginx--zweiten-server-block-anlegen)
7. [HTTPS für die neue Domain](#7-https-für-die-neue-domain)
8. [Deployment-Workflow](#8-deployment-workflow)
9. [Fehlerbehebung](#9-fehlerbehebung)
10. [Checkliste](#10-checkliste)

---

## 1. Voraussetzungen prüfen

Bevor du startest, kurz verifizieren, dass die Basis steht:

```bash
$ ssh deploy@<VPS_IPV4>

$ node -v          # ≥ 20.x erwartet
$ pm2 -v           # PM2 installiert
$ sudo nginx -t    # Nginx-Config syntaktisch ok
$ sudo systemctl status nginx --no-pager
$ sudo ufw status  # 22 / 80 / 443 offen
```

Wenn eine dieser Komponenten fehlt → erst `wappsite/DEPLOYMENT.md` Abschnitte 1, 3, 7, 9 abarbeiten.

Verfügbarer Port für die neue App:

```bash
$ sudo ss -tulpn | grep -E ':3000|:3001'
```

Erwartet: `:3000` belegt von wappsite-Node, `:3001` frei. Falls `:3001` belegt → in dieser Anleitung den Port konsistent durch einen freien ersetzen (z. B. `3002`).

---

## 2. Domain mit VPS verbinden

**Aktueller Stand (2026-05):** Die Domain `restaurant-alt-karow.de` ist bei **Wix** registriert. Ein vollständiger Registrar-Transfer ist noch nicht möglich. Vorgehen: **DNS bei Wix umstellen** (Wix bleibt Registrar + DNS-Host), Zertifikat per Let's Encrypt holen. Später dann ggf. vollständiger Transfer (siehe 2.B).

---

### 2.A — AKTUELL: Wix-Domain temporär auf VPS leiten

> Ziel: A-Records im Wix-DNS-Panel so umlenken, dass `restaurant-alt-karow.de` und `www.…` auf den IONOS-VPS zeigen. Wix bleibt **Registrar** (Verwaltung der Domain selbst) und **DNS-Host** (Verwaltung der Records) — wir nutzen nur sein DNS-Panel.

#### 2.A.1 Wichtig vorab — Wix-spezifische Stolperfallen

- **Wenn die Domain bei Wix mit einer Wix-Website verbunden ist** (Domain-„Verbindung"), überschreibt Wix die DNS-Records gerne stillschweigend oder zeigt manuell gesetzte Records nicht an. **Vor** der Umstellung: in Wix den Punkt **„Domain trennen"** ausführen (Wix Dashboard → Domains → Domain auswählen → „What would you like to do?" → **„Point a domain to a different site"** bzw. **„Disconnect from site"**).
- Wix erlaubt das Editieren von A/CNAME/MX/TXT-Records auch ohne Transfer. Es gibt **kein** Editieren der Nameserver-Delegation, solange die Domain bei Wix registriert ist — wir brauchen das aber gar nicht.
- Wix-Premium-Pläne stellen automatisch ein SSL-Zertifikat für die Domain bereit. Das bleibt ungenutzt liegen, sobald die DNS-Records auf den VPS zeigen — irrelevant, kein Konflikt mit unserem Let's-Encrypt-Cert.
- **Mail bei Wix:** Falls Mail-Postfächer (z. B. Google Workspace via Wix verbunden) genutzt werden, **MX-, SPF-, DKIM-, DMARC-Records nicht anrühren**. Nur die `A @`- und `A/CNAME www`-Records werden geändert. Aktuell sind für `restaurant-alt-karow.de` keine eigenen Mail-Postfächer bekannt — vor dem Editieren trotzdem kurz die DNS-Liste in Wix scannen und alles mit Typ `MX`, `TXT (v=spf1 …)` oder `_dmarc` unangetastet lassen.

#### 2.A.2 Schritt 0 — TTL vorab senken (24 – 48 h vorher empfohlen)

Damit der Cutover möglichst kurze Downtime hat, **vorher** im Wix-DNS-Panel die TTL der bestehenden A-Records auf den kleinstmöglichen Wert ändern (Wix erlaubt typischerweise minimum **5 min** = `300 s` oder `1 h` = `3600 s`):

1. Wix Dashboard → **Domains** → `restaurant-alt-karow.de` → **„Advanced"** bzw. **„DNS Records bearbeiten"**.
2. A-Record für Host `@` öffnen → TTL auf **5 min** (`300`) reduzieren. Speichern.
3. CNAME/A-Record für Host `www` analog auf TTL `300`.
4. **Warten:** 24 – 48 Stunden, bis der bisherige (alte) TTL-Wert in den Caches abgelaufen ist. Danach reagieren spätere Änderungen weltweit innerhalb von ~5 min.

Wenn keine Zeit für Vorlauf bleibt: einfach den nächsten Schritt machen, dann liegt die volle Propagationszeit bei der bisherigen TTL (oft 1 h).

#### 2.A.3 Schritt 1 — Bestandsaufnahme der aktuellen DNS-Records bei Wix

Im Wix-Panel **vor jeder Änderung** Screenshot machen oder die Records abschreiben — falls ein Rollback nötig wird. Typische Wix-Records, die unverändert bleiben:

| Typ | Host | Wert (Beispiel)                    | bleibt? |
| --- | ---- | ---------------------------------- | ------- |
| NS  | `@`  | `ns6.wixdns.net` / `ns7.wixdns.net` | ja      |
| MX  | `@`  | (nur falls Mail bei Wix)            | ja      |
| TXT | `@`  | `v=spf1 …` (nur falls vorhanden)    | ja      |
| TXT | `_dmarc` | (falls vorhanden)               | ja      |
| CNAME | `_domainconnect` | (Wix-intern)              | ja      |

Records, die wir **ändern** (Hosting umlenken):

| Typ   | Host | Wert (alt)               | Wert (neu)            |
| ----- | ---- | ------------------------ | --------------------- |
| A     | `@`  | Wix-IP (z. B. `185.230.63.x`) | `<DEINE_VPS_IPV4>` |
| A oder CNAME | `www` | z. B. CNAME → `…wixdns.net` | A → `<DEINE_VPS_IPV4>` |

#### 2.A.4 Schritt 2 — A-Records auf VPS umstellen

Im Wix-DNS-Panel:

1. **Apex (`@`):**
   - Bestehenden `A @ <Wix-IP>` öffnen → **Wert** durch `<DEINE_VPS_IPV4>` ersetzen → TTL `300` → speichern.
   - Falls Wix einen `AAAA @ …`-Record gesetzt hat: entweder löschen oder auf die VPS-IPv6 umstellen (falls IONOS dir eine gegeben hat). IPv4 allein reicht.

2. **`www`-Hostname:**
   - Existiert ein CNAME `www → ...wixdns.net`? → **Löschen**.
   - Neuen `A www → <DEINE_VPS_IPV4>` mit TTL `300` anlegen.
   - Alternativ: CNAME `www → restaurant-alt-karow.de` (Wix erlaubt das in der Regel, ist gleichwertig, hält den Wert automatisch synchron).

3. **CAA-Record (optional, empfohlen) — schützt vor Cert-Missbrauch:**
   - Typ `CAA`, Host `@`, Wert `0 issue "letsencrypt.org"`, TTL `3600`.
   - Wix unterstützt CAA-Records in vielen Plänen. Falls die UI das nicht anbietet: weglassen — funktional nicht zwingend.

4. Speichern. Wix zeigt typischerweise einen Hinweis „Connected to external site" — bestätigen.

#### 2.A.5 Schritt 3 — Propagation prüfen

Vom **VPS** oder lokal (Windows-PowerShell akzeptiert `nslookup`):

```bash
# Auf dem VPS / Linux / macOS:
$ dig +short restaurant-alt-karow.de
$ dig +short www.restaurant-alt-karow.de
$ dig +short restaurant-alt-karow.de @1.1.1.1   # Cloudflare-Resolver
$ dig +short restaurant-alt-karow.de @8.8.8.8   # Google-Resolver
```

```powershell
# Lokal Windows:
nslookup restaurant-alt-karow.de
nslookup restaurant-alt-karow.de 1.1.1.1
```

Erwartet: beide Antworten = `<DEINE_VPS_IPV4>`. Solange noch alte Wix-IP zurückkommt, ist die Propagation nicht durch.

Visueller Check weltweit: <https://dnschecker.org/#A/restaurant-alt-karow.de> — sollte überwiegend Grün mit deiner VPS-IP zeigen.

**Faustregel:**

- Bei zuvor reduzierter TTL: ~5 – 10 Minuten.
- Ohne Vorlauf: bis zu der TTL, die vorher gesetzt war (typischerweise 1 h, im Extremfall 24 h).

Erst weitermachen, wenn `dig` mehrfach (auch über andere Resolver) die VPS-IP zurückgibt.

#### 2.A.6 Schritt 4 — Nginx-Block deployen und Certbot ausführen

Ablauf exakt wie in den Abschnitten 6 und 7 dieser Anleitung — der **Wix-Aspekt spielt für Nginx und Let's Encrypt keine Rolle**. Sobald die A-Records auf den VPS zeigen, ist Let's Encrypt egal, wer das DNS hostet.

Wichtig:

1. **Nginx-Site erst aktivieren, wenn DNS propagiert ist** (sonst gibt Certbot "DNS problem" oder "Connection refused" zurück).
2. Erstkonfiguration des Nginx-Blocks als **HTTP-only** (Port 80) — wie in Abschnitt 6 angelegt.
3. `sudo nginx -t && sudo systemctl reload nginx`.
4. Browser-Test: `http://restaurant-alt-karow.de` → muss die neue Site liefern (noch ohne Schloss).
5. Certbot ausführen (Abschnitt 7) → Let's Encrypt löst die HTTP-01-Challenge über Port 80 ein, schreibt das Zertifikat und konfiguriert den 443-Block automatisch.

> Let's Encrypt **muss** dafür die Domain via Port 80 erreichen können → UFW: 80 + 443 offen, kein Cloudflare/Wix-Proxy davor (bei reiner DNS-Umlenkung ist das automatisch der Fall).

#### 2.A.7 Schritt 5 — Wix-Website endgültig deaktivieren (optional, sauber)

Wenn die alte Wix-Website nicht mehr aufrufbar sein soll:

1. Wix Dashboard → **Sites** → alte Site → **„Unpublish"** (Veröffentlichung zurücknehmen). Damit erreicht niemand mehr versehentlich die alte Wix-URL `restaurantaltkarow.wixsite.com/...`.
2. Wix-Premium-Plan kündigen (falls nicht mehr benötigt) — **erst nach dem vollständigen Registrar-Transfer**, da der Plan oft an die Domain-Verwaltung gekoppelt ist. Detail in 2.B.

---

### 2.B — SPÄTER: Vollständiger Domain-Transfer weg von Wix

Wenn du die Domain irgendwann komplett bei Wix herauslöst (z. B. zu IONOS, Cloudflare oder Namecheap), läuft das so ab:

1. **Wix-Domain auf transferfähig stellen:**
   - Wix Dashboard → Domain → **„Transfer away from Wix"** klicken.
   - Wix muss die Domain entsperren (Lock entfernen).
   - **Auth-Code (EPP-Code)** anfordern — Wix mailt ihn an die Registrar-Mail-Adresse.
   - Wix erlaubt Transfers erst **nach 60 Tagen** seit Registrierung oder letztem Transfer (ICANN-Regel).
2. **Beim neuen Registrar Transfer initiieren:**
   - Domain dort als „Transfer" eingeben → Auth-Code eingeben → Domain-Inhaber-Mail bestätigen → Zahlung (verlängert die Domain meist um 1 Jahr).
3. **Während des Transfers laufen DNS-Records weiter** — keine Downtime, solange die A-Records beim alten Registrar (Wix) **noch zeigen, wohin sie sollen** (also auf deinen VPS).
4. **Nach erfolgreichem Transfer** (typisch 5 – 7 Tage):
   - DNS-Verwaltung beim neuen Registrar einrichten → A-Records erneut auf VPS-IP setzen (analog 2.A.4).
   - **Achtung:** Beim Wechsel des DNS-Hosts können A-Records **zurückgesetzt** werden — Records sofort nach Wechsel kontrollieren.
   - TTL wieder hochsetzen (`3600` ist normal).
5. **`A`-Record-Wechsel ist dann trivial** — keine Wartezeit, da bereits korrekt eingestellt.

> Empfehlung: für den Transfer-Zeitraum bei beiden Anbietern die identischen DNS-Records halten — dann kann der Nameserver-Wechsel ohne Downtime ablaufen.

---

### 2.C — Häufige Probleme & Diagnose

| Symptom                                                                  | Ursache                                                                 | Lösung                                                                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `dig` liefert weiterhin Wix-IP                                          | DNS-TTL noch nicht abgelaufen; Wix-Cache; lokaler Resolver cached       | Auf öffentlichen Resolver wechseln (`dig … @1.1.1.1`), warten; ggf. lokal `ipconfig /flushdns` (Win) / `resolvectl flush-caches` (Linux) |
| Wix zeigt geänderten A-Record nicht in der UI                           | Domain noch mit Wix-Site verbunden — Wix maskiert benutzerdefinierte Records | „Disconnect" in Wix ausführen (siehe 2.A.1), dann Records neu setzen                                                    |
| Wix setzt nach Speichern die A-Records still zurück                     | Auto-DNS-Schutz aktiv für „verbundene" Domains                          | Domain in Wix endgültig auf **„Point to external"** umstellen                                                            |
| Browser zeigt Wix-Site, aber `curl` zeigt VPS-Site                       | Browser-DNS-Cache oder HSTS-Cache vom alten Wix-Zert                    | Browser-Cache + DNS-Cache leeren; in Inkognito-Tab testen                                                                |
| Certbot: `Detail: …: DNS problem: NXDOMAIN looking up A for …`          | DNS noch nicht propagiert                                                | `dig` über mehrere Resolver wiederholen; warten                                                                          |
| Certbot: `Connection refused` auf Port 80                                | UFW blockiert 80; Nginx hört nicht; falscher `server_name`              | `sudo ufw status`, `sudo nginx -t`, `curl -I http://restaurant-alt-karow.de` vom VPS                                     |
| Certbot: `… too many certificates already issued for this exact set …`  | Let's Encrypt Rate-Limit (5 pro Domain / Woche)                          | `--dry-run` zur Vorbereitung nutzen; sonst eine Woche warten                                                            |
| Browser zeigt Wix-Splash trotz korrekter DNS                            | Wix-Website noch „published", Wix-CDN hat IP-basiertes Routing          | Wix-Site in Schritt 2.A.7 unpublishen                                                                                    |
| `www.restaurant-alt-karow.de` lädt nicht, Apex schon                    | `www`-Record vergessen oder nur als CNAME auf alten Wix-Wert            | `dig +short www.restaurant-alt-karow.de` prüfen; A oder CNAME auf VPS umstellen                                          |
| `mixed content`-Warnungen nach SSL-Cutover                              | Hardcoded `http://`-Links auf der neuen Site                            | Codebase nach `http://` durchsuchen, durch `https://` oder protokollrelativ ersetzen                                     |

#### Mini-Cheatsheet für die Cutover-Stunde

```bash
# DNS schnell und über mehrere Resolver gegenchecken
$ for r in 1.1.1.1 8.8.8.8 9.9.9.9; do echo "[$r]"; dig +short @$r restaurant-alt-karow.de; done

# Antwortet der eigene VPS?
$ curl -I http://restaurant-alt-karow.de

# Nginx-Status & Logs
$ sudo nginx -t
$ sudo tail -f /var/log/nginx/restaurantaltkarow.access.log

# Certbot trockentest, bevor man richtig holt
$ sudo certbot --nginx -d restaurant-alt-karow.de -d www.restaurant-alt-karow.de --dry-run
```

---

### 2.D — Zeitplan, wenig Downtime

| Zeitpunkt          | Was                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **T − 48 h**       | Wix-TTL für `A @` und `A/CNAME www` auf `300` reduzieren                                                        |
| **T − 24 h**       | VPS vorbereiten: Projekt unter `/var/www/restaurantaltkarow`, `npm ci && npm run build`, PM2 startet App auf 3001 |
| **T − 1 h**        | Nginx-Block für `restaurant-alt-karow.de` als HTTP-only anlegen, `nginx -t`, `reload`                          |
| **T = 0**          | In Wix `A @` und `A/CNAME www` auf VPS-IP umstellen                                                             |
| **T + 5 – 30 min** | `dig` zeigt VPS-IP; `curl http://restaurant-alt-karow.de` liefert die neue Site                                |
| **T + 35 min**     | Certbot ausführen → HTTPS aktiv                                                                                 |
| **T + 1 h**        | Sanity-Check: Browser, `https://www…` → Redirect auf Apex, beide Sites unter SSL, Logs leer                    |
| **T + 24 h**       | Wix-Site unpublishen (2.A.7); TTL ggf. wieder auf `3600` hochsetzen                                            |

---

---

## 3. Projekt auf den Server bringen

> 💡 **Reihenfolge-Tipp:** Schritte 3 – 6 (Projekt, Build, PM2, Nginx HTTP-only) **dürfen und sollen** vor Schritt 2 (DNS-Cutover bei Wix) ausgeführt werden. Vorteil: Die neue Site läuft schon vollständig auf dem VPS, bevor du DNS umstellst — kein Loch zwischen Wix-Aus und neuer Site. Testen lokal vor dem Cutover:
>
> ```
> # auf dem VPS — Hostname per Header faken, DNS umgehen
> curl -I -H "Host: restaurant-alt-karow.de" http://localhost
>
> # lokal in Windows — hosts-Override für privaten Browser-Test
> # %SystemRoot%\System32\drivers\etc\hosts:
> # 31.70.80.71  restaurant-alt-karow.de  www.restaurant-alt-karow.de
> ```
>
> Erst nach erfolgreichem Test: DNS bei Wix umstellen (Schritt 2.A.4), dann Certbot (Schritt 7).


### 3.1 Zielordner anlegen

```bash
$ sudo mkdir -p /var/www/restaurantaltkarow
$ sudo chown -R deploy:deploy /var/www/restaurantaltkarow
$ cd /var/www/restaurantaltkarow
```

### 3.2 Variante A — Git Clone (empfohlen)

Repo `restaurantaltkarow` zuerst auf GitHub anlegen, lokal pushen:

```powershell
# lokal (Windows-PowerShell), im Projektverzeichnis
cd C:\Users\PC\code\restaurantaltkarow
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin git@github.com:<dein-user>/restaurantaltkarow.git
git push -u origin main
```

**Deploy-Key für das neue Repo** — wir nutzen einen **separaten** SSH-Key, damit der wappsite-Deploy-Key nicht versehentlich Zugriff auf das neue Repo bekommt:

```bash
$ ssh-keygen -t ed25519 -C "restaurantaltkarow-vps" -f ~/.ssh/id_ed25519_github_rak -N ""
$ cat ~/.ssh/id_ed25519_github_rak.pub
```

Public-Key kopieren → GitHub: **Repo restaurantaltkarow → Settings → Deploy keys → Add deploy key** → einfügen, read-only.

SSH-Config um einen zweiten Host-Alias erweitern:

```bash
$ nano ~/.ssh/config
```

Anhängen (der bestehende `Host github.com`-Block für wappsite bleibt):

```
Host github-rak
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github_rak
  IdentitiesOnly yes
```

Berechtigungen sicherstellen:

```bash
$ chmod 600 ~/.ssh/config
```

Clonen über den Alias:

```bash
$ cd /var/www/restaurantaltkarow
$ git clone git@github-rak:<dein-user>/restaurantaltkarow.git .
```

### 3.3 Variante B — rsync-Upload (ohne Git)

Lokal (Git Bash / WSL):

```bash
rsync -avz --exclude node_modules --exclude .next --exclude .git \
  ./ deploy@<VPS_IPV4>:/var/www/restaurantaltkarow/
```

---

## 4. Abhängigkeiten & Environment

### 4.1 Pakete installieren

```bash
$ cd /var/www/restaurantaltkarow
$ npm ci
```

### 4.2 Environment-Variablen

Aktuell nutzt das Projekt **keine** zwingenden Env-Variablen. Sobald welche dazukommen (z. B. SMTP für ein Kontaktformular), wird `.env.production` analog zu wappsite gepflegt:

```bash
$ cd /var/www/restaurantaltkarow
$ cp .env.example .env.production
$ chmod 600 .env.production
$ nano .env.production
```

> Permissions `600` setzen, **bevor** echte Werte eingetragen werden — Passwörter liegen sonst kurz mit Default-Rechten auf der Platte.

### 4.3 Production-Build

```bash
$ npm run build
```

Erwartet: Routen-Tabelle am Ende, `.next/`-Ordner entsteht.

---

## 5. PM2 für die zweite App einrichten

> Auf dem VPS läuft bereits ein PM2-Prozess für `wappsite4you` (Port 3000). PM2 ist via `pm2 startup systemd` als systemd-Service unter User `deploy` registriert — dieser Service startet beim Reboot **alle** Apps, die zum Zeitpunkt des letzten `pm2 save` in der PM2-Liste standen. Wir fügen jetzt einen **zweiten Prozess** in dasselbe PM2 hinzu.

### 5.1 Konvention: Port- und Prozessnamen-Schema

Damit künftig weitere Sites (mx-protec, mijocatering, …) ohne Konflikt dazukommen können, gilt folgende Konvention auf diesem VPS:

| Projekt              | Lokaler Port | PM2-Process-Name     | Server-Pfad                     | Log-Pfad                          |
| -------------------- | ------------ | -------------------- | ------------------------------- | --------------------------------- |
| wappsite4you.de      | `3000`       | `wappsite4you`       | `/var/www/wappsite4you`         | `/var/log/wappsite4you/`          |
| restaurant-alt-karow.de | `3001`    | `restaurantaltkarow` | `/var/www/restaurantaltkarow`   | `/var/log/restaurantaltkarow/`    |
| *(reserviert)*       | `3002`       | *(z. B. mxprotec)*   | `/var/www/mxprotec`             | `/var/log/mxprotec/`              |
| *(reserviert)*       | `3003`       | *(z. B. mijocatering)* | `/var/www/mijocatering`       | `/var/log/mijocatering/`          |

**Regeln:**

- Prozessname = Projektordnername (lowercase, keine Bindestriche) — leichter im `pm2`-CLI zu tippen.
- Ports streng aufsteigend `3000, 3001, 3002, …` — neue App = nächster freier Port.
- Jede App bekommt **eigenen** Server-Pfad, eigenes Log-Verzeichnis, eigenen Nginx-Server-Block, eigenes Let's-Encrypt-Zertifikat.

Vor dem Anlegen kurz prüfen, welche Ports schon belegt sind:

```bash
$ sudo ss -tulpn | grep -E ':300[0-9]'
$ pm2 list
```

### 5.2 Log-Verzeichnis anlegen

```bash
$ sudo mkdir -p /var/log/restaurantaltkarow
$ sudo chown -R deploy:deploy /var/log/restaurantaltkarow
```

### 5.3 ecosystem.config.cjs erstellen

```bash
$ nano /var/www/restaurantaltkarow/ecosystem.config.cjs
```

Inhalt — **Port 3001** (siehe Konvention oben):

```js
// PM2-Konfiguration für restaurantaltkarow
// Doku: https://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps: [
    {
      name: 'restaurantaltkarow',
      cwd: '/var/www/restaurantaltkarow',

      // Direkter Aufruf des Next-Binaries statt 'npm run start' —
      // schnellerer Start, sauberer Process-Tree, PM2 sieht den Node-Prozess
      // direkt (kein umgebender npm-Wrapper).
      script: './node_modules/next/dist/bin/next',
      args: 'start --port 3001',

      // 1 vCPU oder kleiner VPS → fork mit 1 Instanz reicht.
      // Bei mehreren Kernen + stateless App: instances: 'max', exec_mode: 'cluster'.
      instances: 1,
      exec_mode: 'fork',

      autorestart: true,
      watch: false,                  // in Production NIE true
      max_memory_restart: '512M',    // Restart bei Memory-Leak

      out_file: '/var/log/restaurantaltkarow/out.log',
      error_file: '/var/log/restaurantaltkarow/err.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--no-deprecation',
        PORT: '3001',
      },
    },
  ],
};
```

### 5.4 Prozess anlegen und starten

```bash
$ cd /var/www/restaurantaltkarow
$ pm2 start ecosystem.config.cjs
$ pm2 list
```

Erwartet: Tabelle mit **beiden** Apps, Status `online`:

```
┌────┬─────────────────────┬──────┬───────┬─────────┬─────────┬──────────┐
│ id │ name                │ mode │ ↺     │ status  │ cpu     │ mem      │
├────┼─────────────────────┼──────┼───────┼─────────┼─────────┼──────────┤
│ 0  │ wappsite4you        │ fork │ 0     │ online  │ 0%      │ 130 mb   │
│ 1  │ restaurantaltkarow  │ fork │ 0     │ online  │ 0%      │ 120 mb   │
└────┴─────────────────────┴──────┴───────┴─────────┴─────────┴──────────┘
```

Bei `errored` direkt Logs prüfen:

```bash
$ pm2 logs restaurantaltkarow --err --lines 100
```

Schnelltest über Loopback:

```bash
$ curl -I http://127.0.0.1:3001
```

Erwartet: `HTTP/1.1 200 OK`. Erst wenn das klappt, weiter zu Nginx.

### 5.5 Auto-Start nach Reboot — Persistenz

Der systemd-Service für PM2 wurde beim wappsite-Setup einmalig via `pm2 startup systemd` angelegt. **Nicht erneut ausführen** — sonst entsteht ein zweiter, konkurrierender Service-Unit.

Damit die **neue** App nach einem Reboot automatisch mitstartet, muss der aktuelle Prozess-Stand persistiert werden:

```bash
$ pm2 save
```

→ PM2 schreibt die aktuelle Liste nach `~/.pm2/dump.pm2`. Beim Boot lädt der systemd-Service genau diese Liste.

**Test (empfohlen):**

```bash
$ sudo reboot
```

Nach 30–60 s erneut einloggen:

```bash
$ pm2 list
```

→ Beide Apps müssen automatisch `online` sein. Wenn nicht: siehe Fehlerbehebung 9.2.

### 5.6 Neustarts: restart vs reload vs reload --update-env

PM2 kennt drei Arten, einen Prozess neu zu laden — die richtige Wahl spart Downtime und Bugs:

| Befehl                                              | Was passiert                                                      | Wann nutzen                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `pm2 restart restaurantaltkarow`                    | Hard-Kill + Neustart, kurze Downtime                              | Code-Update, Hängendem Prozess                                |
| `pm2 reload restaurantaltkarow`                     | Zero-Downtime im Cluster-Mode; im Fork-Mode = Restart             | Routine-Deploys                                              |
| `pm2 reload restaurantaltkarow --update-env`        | Wie `reload`, lädt zusätzlich `env`-Werte aus `ecosystem.config.cjs` neu | Nach Änderungen an `.env.production` oder ecosystem-`env`-Block |
| `pm2 stop restaurantaltkarow`                       | Prozess stoppen, bleibt aber in der PM2-Liste                     | Wartung                                                      |
| `pm2 start restaurantaltkarow`                      | Gestoppten Prozess wieder anfahren                                | Nach `stop`                                                  |
| `pm2 delete restaurantaltkarow`                     | Aus PM2 entfernen (Daten bleiben auf der Platte)                  | Migration, Aufräumen                                         |

> **Wichtig:** Nach `pm2 delete` oder `pm2 start <neu>` **immer** `pm2 save` ausführen — sonst überlebt die Änderung den nächsten Reboot nicht.

**Faustregel:** Im normalen Deploy-Flow `pm2 reload <name> --update-env`. Hängt der Prozess, `pm2 restart`.

### 5.7 Logs

PM2 schreibt parallel an zwei Stellen:

1. **PM2-intern:** `~/.pm2/logs/restaurantaltkarow-out.log` und `…-error.log` (von PM2 selbst rotiert).
2. **Explizit konfiguriert** (siehe `out_file`/`error_file` im ecosystem):
   - `/var/log/restaurantaltkarow/out.log`
   - `/var/log/restaurantaltkarow/err.log`

**Befehle:**

```bash
# Live-Stream (out + err gemischt)
$ pm2 logs restaurantaltkarow

# Nur Errors
$ pm2 logs restaurantaltkarow --err

# Nur die letzten 200 Zeilen (kein Live-Stream)
$ pm2 logs restaurantaltkarow --lines 200 --nostream

# Live-Tail direkt aus der Datei
$ tail -f /var/log/restaurantaltkarow/err.log

# Alle Apps gleichzeitig live
$ pm2 logs

# Logs leeren (z. B. nach großem Vorfall)
$ pm2 flush restaurantaltkarow
```

**Log-Rotation einrichten** (einmalig, gilt VPS-weit für alle PM2-Apps; falls schon im wappsite-Setup gemacht, überspringen):

```bash
$ pm2 install pm2-logrotate
$ pm2 set pm2-logrotate:max_size 10M
$ pm2 set pm2-logrotate:retain 14
$ pm2 set pm2-logrotate:compress true
```

→ Pro App max. 10 MB pro Datei, 14 Archive aufbewahrt, gzipped.

### 5.8 PM2-Befehle für mehrere Apps (Cheatsheet)

```bash
# Status / Übersicht
$ pm2 list                         # alle Apps
$ pm2 status                       # alias zu list
$ pm2 describe restaurantaltkarow  # alle Settings dieser App
$ pm2 monit                        # interaktives CPU/RAM-Dashboard für alle

# Aktionen pro App
$ pm2 reload restaurantaltkarow
$ pm2 restart restaurantaltkarow
$ pm2 stop restaurantaltkarow
$ pm2 delete restaurantaltkarow

# Aktionen auf ALLE Apps (vorsichtig)
$ pm2 reload all
$ pm2 restart all
$ pm2 stop all

# Persistenz
$ pm2 save                         # aktuellen Stand persistieren
$ pm2 resurrect                    # gespeicherten Stand neu laden
$ pm2 unstartup systemd            # NICHT ausführen — würde Auto-Start für wappsite mitkillen

# Aus Config-Datei
$ pm2 start ecosystem.config.cjs                    # alle apps aus der Datei
$ pm2 start ecosystem.config.cjs --only restaurantaltkarow   # nur eine
```

### 5.9 Mögliche Konflikte zwischen mehreren Next.js-Apps auf einem VPS

| Konflikt                                           | Symptom                                                            | Lösung                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Port-Doppelbelegung**                            | `Error: listen EADDRINUSE :::3001`                                 | `sudo ss -tulpn \| grep :3001` → blockierenden Prozess finden; Port-Konvention (5.1) einhalten |
| **Gleicher PM2-Process-Name**                      | `pm2 start` überschreibt stillschweigend bestehende Config         | Namen müssen eindeutig sein — Konvention: = Projektordnername                                |
| **Gleicher Nginx `server_name`**                   | `nginx -t`: `duplicate server_name`                                | Nur ein Server-Block pro Domain; ggf. doppelten Symlink in `sites-enabled` entfernen          |
| **`npm ci` in falschem Ordner**                    | `node_modules` einer App überschreibt Versionen der anderen — eigentlich harmlos, aber verwirrend | Immer `cd /var/www/<projekt>` vor jedem npm-Befehl                                            |
| **Globales `next` in PATH falsche Version**        | Eine App startet mit falscher Next-Version                          | Im ecosystem `./node_modules/next/dist/bin/next` benutzen, **nie** globales `next`            |
| **Memory-Druck auf kleinem VPS**                   | OOM-Killer beendet zufällig Prozesse                                | Pro App `max_memory_restart` setzen; ggf. größeren VPS-Tarif; Cluster-Mode nur bei viel RAM    |
| **`pm2 save` nach Änderungen vergessen**           | Nach Reboot fehlt die neue App                                     | Nach jedem `pm2 start/delete/restart` mit dauerhafter Wirkung: `pm2 save`                     |
| **Mehrere Builds gleichzeitig**                    | Build einer App killt die andere durch Memory- oder CPU-Last       | Nicht parallel deployen; ggf. zeitlich versetzen oder `nice -n 19 npm run build`             |
| **Geteilter `~/.next/cache`**                      | Tritt nicht auf — jede App hat ihren eigenen `.next/` im cwd        | Nichts zu tun (zur Beruhigung dokumentiert)                                                  |

### 5.10 Was bei einem Code-Update passiert

Der typische Update-Flow für genau diese App (siehe auch Abschnitt 8.2 für das Skript):

```bash
$ cd /var/www/restaurantaltkarow
$ git pull
$ npm ci                                            # nur bei package-lock-Änderung
$ npm run build
$ pm2 reload restaurantaltkarow --update-env
```

`--update-env` zwingt PM2, neue Werte aus dem `env`-Block der `ecosystem.config.cjs` zu übernehmen — wichtig nach Änderungen an `.env.production` oder am Port.

---

## 6. Nginx — zweiten Server-Block anlegen

### 6.1 Neue Config-Datei

```bash
$ sudo nano /etc/nginx/sites-available/restaurantaltkarow
```

Inhalt (HTTP-only — Certbot fügt gleich den 443-Block hinzu):

```nginx
# /etc/nginx/sites-available/restaurantaltkarow
# Reverse Proxy: Nginx (80/443) -> Node.js (127.0.0.1:3001)

# === www -> Apex umleiten ===
server {
    listen 80;
    listen [::]:80;
    server_name www.restaurant-alt-karow.de;
    return 301 http://restaurant-alt-karow.de$request_uri;
}

# === Hauptserver ===
server {
    listen 80;
    listen [::]:80;
    server_name restaurant-alt-karow.de;

    client_max_body_size 10M;

    access_log /var/log/nginx/restaurantaltkarow.access.log;
    error_log  /var/log/nginx/restaurantaltkarow.error.log;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;

        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;

        proxy_buffering off;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location = /favicon.ico {
        proxy_pass http://127.0.0.1:3001;
        access_log off;
        log_not_found off;
        expires 7d;
    }

    location = /robots.txt {
        proxy_pass http://127.0.0.1:3001;
        access_log off;
        log_not_found off;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/javascript
        text/xml
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
```

### 6.2 Aktivieren und testen

```bash
$ sudo ln -s /etc/nginx/sites-available/restaurantaltkarow /etc/nginx/sites-enabled/
$ sudo nginx -t
$ sudo systemctl reload nginx
```

→ Test im Browser: `http://restaurant-alt-karow.de` zeigt die neue Seite. Die bestehende `https://wappsite4you.de` darf dabei **nicht** beeinträchtigt sein — kurz gegenprüfen.

Nginx unterscheidet die beiden Sites anhand des `server_name` (Host-Header) — beide hören auf 80/443, geliefert wird, was zum Hostnamen passt.

---

## 7. HTTPS für die neue Domain

Certbot ist bereits installiert. Nur das Zertifikat anfordern:

```bash
$ sudo certbot --nginx \
    -d restaurant-alt-karow.de \
    -d www.restaurant-alt-karow.de \
    --redirect --hsts \
    -m hello@restaurant-alt-karow.de \
    --agree-tos --no-eff-email
```

Wenn die Mail-Adresse `hello@restaurant-alt-karow.de` noch nicht existiert, eine bestehende Adresse verwenden — sie dient nur für Renewal-Warnungen.

> **Hinweis zu `--staple-ocsp`:** Bewusst weggelassen. Let's Encrypt hat 2025 die OCSP-Responder-URL aus neuen Zertifikaten entfernt (Wechsel zu Short-Lived-Certs + CRL). Würde Certbot OCSP-Stapling in den Nginx-Block schreiben, bekäme man bei jedem `nginx -t` eine harmlose `"ssl_stapling" ignored, no OCSP responder URL`-Warnung. Auf diesem VPS tritt das bei der bestehenden wappsite-Site auf — Config funktioniert trotzdem, nur Kosmetik. Bei künftigen Renewals der wappsite-Zertifikate kann man die zwei Zeilen `ssl_stapling on;` / `ssl_stapling_verify on;` aus `/etc/nginx/sites-available/wappsite4you` entfernen, um die Warnung loszuwerden.

Verifizieren:

```bash
$ curl -I https://restaurant-alt-karow.de
```

Erwartet: `HTTP/2 200` plus `strict-transport-security`-Header.

Renewal-Test:

```bash
$ sudo certbot renew --dry-run
```

→ Listet jetzt **beide** Zertifikate (wappsite4you und restaurant-alt-karow) und versucht Renewal für beide.

---

## 8. Deployment-Workflow

### 8.1 Manueller Update-Flow

Lokal:

```powershell
git add .
git commit -m "feat: …"
git push origin main
```

Auf dem Server:

```bash
$ cd /var/www/restaurantaltkarow
$ git pull origin main
$ npm ci                                  # nur bei package-lock-Änderung
$ npm run build
$ pm2 reload restaurantaltkarow --update-env
```

### 8.2 Deploy-Skript

```bash
$ nano /var/www/restaurantaltkarow/deploy.sh
```

```bash
#!/usr/bin/env bash
# /var/www/restaurantaltkarow/deploy.sh
set -euo pipefail
cd /var/www/restaurantaltkarow

echo "→ git pull"
git pull origin main

echo "→ npm ci"
npm ci

echo "→ npm run build"
npm run build

echo "→ pm2 reload"
pm2 reload ecosystem.config.cjs --update-env

echo "✓ Deployment fertig."
```

```bash
$ chmod +x /var/www/restaurantaltkarow/deploy.sh
```

Ausführen mit:

```bash
$ /var/www/restaurantaltkarow/deploy.sh
```

### 8.3 Rollback

```bash
$ cd /var/www/restaurantaltkarow
$ git log --oneline -10
$ git reset --hard <COMMIT_HASH>
$ npm ci && npm run build && pm2 reload restaurantaltkarow
```

---

## 9. Fehlerbehebung

### 9.1 Cheatsheet

```bash
# === neue App ===
pm2 logs restaurantaltkarow --lines 200
pm2 describe restaurantaltkarow
tail -f /var/log/restaurantaltkarow/err.log

# === Nginx ===
sudo nginx -t
sudo tail -f /var/log/nginx/restaurantaltkarow.error.log
sudo journalctl -u nginx -n 100 --no-pager

# === Ports ===
sudo ss -tulpn | grep -E ':80|:443|:3000|:3001'

# === SSL ===
sudo certbot certificates
sudo certbot renew --dry-run
```

### 9.2 Häufige Probleme

| Symptom                                                                 | Ursache                                                                              | Lösung                                                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `pm2 start` schlägt mit `EADDRINUSE :::3001` fehl                       | Port 3001 schon belegt                                                               | `sudo ss -tulpn \| grep :3001` → Konflikt finden, oder im `ecosystem.config.cjs` anderen Port    |
| `nginx -t` zeigt `duplicate server_name`                                | Server-Block mit gleichem `server_name` in zwei sites-enabled                        | Doppelten Eintrag entfernen, nur einer pro Domain                                                |
| Browser zeigt falsche Site (wappsite-Inhalt unter restaurant-alt-karow) | `default_server` greift, weil eigener Block nicht aktiv ist                          | `ls /etc/nginx/sites-enabled/` prüfen; Symlink für restaurantaltkarow vorhanden? `nginx -t`     |
| Certbot: „too many failed authorizations"                               | DNS zeigt noch nicht auf VPS, oder UFW blockt Port 80                                | `dig +short restaurant-alt-karow.de`, `sudo ufw status`                                          |
| 502 Bad Gateway nur für neue Domain                                     | PM2-Prozess `restaurantaltkarow` nicht online                                        | `pm2 list`, ggf. `pm2 restart restaurantaltkarow`, Logs prüfen                                   |
| Beide Sites starten nach Reboot nicht                                   | `pm2 save` nach Hinzufügen vergessen                                                 | Einmalig `pm2 start ecosystem.config.cjs` für beide ausführen, dann `pm2 save`                  |

### 9.3 Logs an einem Blick

```bash
# Beide Apps gleichzeitig live verfolgen
$ pm2 logs

# Nur eine
$ pm2 logs restaurantaltkarow
$ pm2 logs wappsite4you
```

---

## 10. Checkliste

- [ ] DNS-Records (`A @`, `A www`) zeigen auf VPS-IP (`dig` bestätigt)
- [ ] Projekt unter `/var/www/restaurantaltkarow`, Owner `deploy`
- [ ] `npm ci && npm run build` lief ohne Fehler
- [ ] PM2-Prozess `restaurantaltkarow` läuft auf Port `3001` (`pm2 list`)
- [ ] `pm2 save` nach dem Hinzufügen ausgeführt
- [ ] Nginx-Server-Block aktiv, `nginx -t` sauber
- [ ] HTTPS via Certbot für `restaurant-alt-karow.de` + `www.`
- [ ] `curl -I https://restaurant-alt-karow.de` liefert `HTTP/2 200`
- [ ] `www.restaurant-alt-karow.de` leitet auf Apex um
- [ ] `https://wappsite4you.de` ist weiterhin unbeeinträchtigt erreichbar
- [ ] `sudo certbot renew --dry-run` listet beide Zertifikate erfolgreich
- [ ] Reboot-Test: nach `sudo reboot` sind beide PM2-Prozesse `online`

**Damit läuft restaurant-alt-karow.de parallel zu wappsite4you.de auf demselben VPS.**
