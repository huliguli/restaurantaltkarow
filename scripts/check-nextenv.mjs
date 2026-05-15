#!/usr/bin/env node
/**
 * Lädt .env.production mit DEMSELBEN Loader wie Next.js (@next/env).
 * Zeigt, was der laufende Server tatsächlich in process.env sieht —
 * inklusive der berüchtigten $-Expansion durch dotenv-expand.
 *
 * Benutzung auf dem VPS:
 *   cd /var/www/restaurantaltkarow
 *   node scripts/check-nextenv.mjs
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), false);

const user = process.env.ADMIN_USERNAME ?? "";
const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
const secret = process.env.ADMIN_SESSION_SECRET ?? "";
const emailUser = process.env.EMAIL_USER ?? "";
const emailPass = process.env.EMAIL_PASS ?? "";

console.log("");
console.log("===========================================");
console.log("  Was Next.js wirklich aus .env.production lädt");
console.log("===========================================");
console.log("");
console.log(`  ADMIN_USERNAME       : "${user}"`);
console.log(
  `  ADMIN_PASSWORD_HASH  : "${hash.slice(0, 12)}..."  (${hash.length} Zeichen, erwartet 60)`,
);
console.log(`  ADMIN_SESSION_SECRET : ${secret.length} Zeichen`);
console.log(`  EMAIL_USER           : "${emailUser}"`);
console.log(
  `  EMAIL_PASS           : ${emailPass ? "gesetzt (" + emailPass.length + " Zeichen)" : "<LEER>"}`,
);
console.log("");

let problems = 0;
if (!user) {
  console.log("  ✗ ADMIN_USERNAME ist leer.");
  problems++;
}
if (!hash) {
  console.log("  ✗ ADMIN_PASSWORD_HASH ist leer.");
  problems++;
} else if (hash.length !== 60 || !hash.startsWith("$2")) {
  console.log("  ✗ ADMIN_PASSWORD_HASH ist KAPUTT.");
  console.log("    Ursache: dotenv-expand expandiert $-Zeichen.");
  console.log("    Fix in .env.production: jedes $ mit Backslash escapen.");
  console.log("");
  console.log("    Aus:    ADMIN_PASSWORD_HASH=\"$2a$12$abc...\"");
  console.log("    Mach:   ADMIN_PASSWORD_HASH=\\$2a\\$12\\$abc...");
  console.log("            (ohne Quotes! Jedes $ mit \\ davor.)");
  problems++;
}

if (problems === 0) {
  console.log("  ✓ Alle Werte sehen plausibel aus.");
}
console.log("");
