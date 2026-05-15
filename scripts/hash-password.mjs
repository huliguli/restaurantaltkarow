#!/usr/bin/env node
/**
 * Generiert einen bcrypt-Hash und gibt ihn EXAKT in dem Format aus,
 * das Next.js' Env-Loader (@next/env mit dotenv-expand) korrekt
 * interpretiert: jedes $ ist mit Backslash escapet.
 *
 *   ADMIN_PASSWORD_HASH=\$2a\$12\$abc...
 *
 * Ohne diese Escapes würde dotenv-expand "$2a", "$12" etc. als
 * Variable-Referenzen interpretieren und mit Leerstrings ersetzen —
 * der Hash wäre kaputt, bcrypt.compare gäbe false zurück → Login schlägt fehl.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("");
  console.error("FEHLT: Passwort als Argument.");
  console.error("");
  console.error("Benutzung:");
  console.error('  npm run admin:hash -- "MeinNeuesPasswort"');
  console.error("");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const escaped = hash.replace(/\$/g, "\\$");

console.log("");
console.log("Bcrypt-Hash generiert (60 Zeichen).");
console.log("");
console.log("In .env.production (und .env.local) eintragen — EXAKT so,");
console.log("MIT den Backslashes und OHNE Quotes:");
console.log("");
console.log(`ADMIN_PASSWORD_HASH=${escaped}`);
console.log("");
console.log("Die \\$ sind nötig, damit Next.js' Env-Loader (@next/env mit");
console.log("dotenv-expand) die $-Zeichen NICHT als Variable-Referenzen");
console.log("interpretiert. Ohne diese Escapes wäre der Hash beim Laden kaputt.");
console.log("");
console.log("Auf dem VPS nach Eintrag:");
console.log("  pm2 reload restaurantaltkarow --update-env");
console.log("");
