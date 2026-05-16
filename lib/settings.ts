import { getDb } from "./db";

/**
 * Generischer Key/Value-Store für Konfiguration, die im Admin-Bereich
 * verwaltet werden soll (z. B. GA4 Measurement-ID).
 *
 * Bewusst SQLite und nicht .env: Werte sind im Browser per Admin-UI
 * änderbar, ohne den Server-Prozess neu zu starten oder die .env zu
 * berühren.
 */

export type SettingKey = "ga_measurement_id";

export function getSetting(key: SettingKey): string | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT value FROM settings WHERE key = ?`)
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: SettingKey, value: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (@key, @value, @updated_at)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `).run({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
}

export function deleteSetting(key: SettingKey): void {
  const db = getDb();
  db.prepare(`DELETE FROM settings WHERE key = ?`).run(key);
}
