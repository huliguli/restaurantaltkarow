#!/usr/bin/env node
/**
 * Generiert einen bcrypt-Hash für ein Klartext-Passwort.
 * Benutzung:
 *   node scripts/hash-password.mjs <klartext-passwort>
 *   npm run admin:hash -- <klartext-passwort>
 *
 * Den ausgegebenen Hash dann in .env.local (lokal) UND .env.production
 * (VPS) als ADMIN_PASSWORD_HASH eintragen, danach pm2 reload mit --update-env.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("");
  console.error("FEHLT: Passwort als Argument.");
  console.error("");
  console.error("Benutzung:");
  console.error('  node scripts/hash-password.mjs "MeinNeuesPasswort"');
  console.error("");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log("");
console.log("✓ Bcrypt-Hash generiert.");
console.log("");
console.log("In .env.local (lokal) und .env.production (VPS) eintragen:");
console.log("");
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
console.log("");
console.log("Hinweis: doppelte Anführungszeichen sind wichtig — der Hash");
console.log("enthält Dollarzeichen, die ohne Quotes Probleme machen können.");
console.log("");
console.log("Auf dem VPS nach Eintrag:");
console.log("  pm2 reload restaurantaltkarow --update-env");
console.log("");
