#!/usr/bin/env node
/**
 * Diagnose: Prüft, ob ADMIN_USERNAME + ADMIN_PASSWORD_HASH in der
 * Environment so vorhanden sind, dass ein Login mit dem übergebenen
 * Klartext-Passwort erfolgreich wäre.
 *
 * Benutzung auf dem VPS:
 *   cd /var/www/restaurantaltkarow
 *   node scripts/check-admin-auth.mjs "DEIN_KLARTEXT_PASSWORT"
 *
 * Liest .env.production / .env.local selbst (im cwd), unabhängig von PM2.
 * So sieht man direkt, was wirklich in der Datei steht — Tippfehler,
 * verstümmelte Hashes durch falsche Quotes etc. fallen sofort auf.
 */
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return false;
  const content = readFileSync(path, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
  return true;
}

const password = process.argv[2];
if (!password) {
  console.error("");
  console.error("FEHLT: Klartext-Passwort als Argument.");
  console.error("");
  console.error('Benutzung:  node scripts/check-admin-auth.mjs "MeinPasswort"');
  console.error("");
  process.exit(1);
}

const loadedProd = loadEnvFile(".env.production");
const loadedLocal = loadEnvFile(".env.local");
if (!loadedProd && !loadedLocal) {
  console.error("");
  console.error("FEHLER: weder .env.production noch .env.local gefunden im aktuellen Verzeichnis.");
  console.error("Verzeichnis wechseln zu /var/www/restaurantaltkarow (oder lokal: C:\\Users\\PC\\code\\restaurantaltkarow).");
  console.error("");
  process.exit(1);
}

const user = process.env.ADMIN_USERNAME;
const hash = process.env.ADMIN_PASSWORD_HASH;
const secret = process.env.ADMIN_SESSION_SECRET;

console.log("");
console.log("===========================================");
console.log("  Admin-Auth-Diagnose");
console.log("===========================================");
console.log("");
console.log(`  Geladen:               ${loadedProd ? ".env.production" : ".env.local"}`);
console.log(`  ADMIN_USERNAME:        ${user ? `"${user}"` : "<NICHT GESETZT>"}`);
if (hash) {
  console.log(
    `  ADMIN_PASSWORD_HASH:   ${hash.slice(0, 7)}…${hash.slice(-4)}  (${hash.length} Zeichen)`,
  );
} else {
  console.log(`  ADMIN_PASSWORD_HASH:   <NICHT GESETZT>`);
}
console.log(
  `  ADMIN_SESSION_SECRET:  ${secret ? `${secret.length} Zeichen` : "<NICHT GESETZT>"}`,
);
console.log("");

let problems = 0;
if (!user) {
  console.log("  ✗ ADMIN_USERNAME fehlt — bitte in der Env-Datei eintragen.");
  problems++;
}
if (!hash) {
  console.log("  ✗ ADMIN_PASSWORD_HASH fehlt — bitte eintragen.");
  problems++;
}
if (hash && !hash.startsWith("$2")) {
  console.log("  ✗ ADMIN_PASSWORD_HASH sieht NICHT wie ein bcrypt-Hash aus.");
  console.log(`    Beginnt aktuell mit: "${hash.slice(0, 8)}"`);
  console.log("    Vermutung: die doppelten Anführungszeichen fehlen — die");
  console.log('    Shell hat das "$2a" als Variable interpretiert.');
  console.log('    Fix: in .env.production den Hash IN doppelten Quotes setzen:');
  console.log('         ADMIN_PASSWORD_HASH="$2a$12$abc…"');
  problems++;
}
if (hash && hash.length < 50) {
  console.log("  ✗ ADMIN_PASSWORD_HASH ist auffällig kurz (bcrypt-Hashes sind 60 Zeichen).");
  console.log("    Vermutlich abgeschnitten oder kaputt.");
  problems++;
}
if (secret && secret.length < 32) {
  console.log("  ⚠ ADMIN_SESSION_SECRET ist kurz (< 32 Zeichen). Empfohlen: 64 Hex.");
}

if (problems > 0) {
  console.log("");
  console.log(`  → ${problems} Problem(e) gefunden, bitte zuerst beheben.`);
  console.log("");
  process.exit(1);
}

console.log("  Vergleiche Eingabe gegen bcrypt-Hash …");
const ok = bcrypt.compareSync(password, hash);
console.log("");
if (ok) {
  console.log("  ✓✓✓  Passwort passt zum Hash. Login MUSS funktionieren.");
  console.log("");
  console.log("  Wenn der Browser-Login trotzdem fehlschlägt:");
  console.log("    → PM2 hat die neue Env nicht geladen.");
  console.log("    → Fix:  pm2 reload restaurantaltkarow --update-env");
  console.log("    → Dann nochmal im Browser einloggen.");
} else {
  console.log("  ✗✗✗  Passwort passt NICHT zum Hash.");
  console.log("");
  console.log("  Wahrscheinlichste Ursachen:");
  console.log("   1) Du tippst ein anderes Passwort als zum Hash-Generieren benutzt.");
  console.log("   2) Der Hash in .env wurde durch fehlende Quotes verstümmelt.");
  console.log("   3) Du hast zwei verschiedene Hashes erzeugt (lokal vs. VPS).");
  console.log("");
  console.log("  Pragmatischer Fix:");
  console.log("    npm run admin:hash -- \"DEIN_NEUES_PASSWORT\"");
  console.log("    → Hash kopieren");
  console.log("    → in .env.production eintragen MIT doppelten Quotes:");
  console.log("         ADMIN_PASSWORD_HASH=\"$2a$12$...\"");
  console.log("    → pm2 reload restaurantaltkarow --update-env");
}
console.log("");
