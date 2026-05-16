import Database, { type Database as DB } from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * SQLite-Singleton.
 * Pro Server-Prozess EINE Verbindung. better-sqlite3 ist synchron, WAL-mode
 * macht concurrent Reads schnell.
 *
 * Wichtig: Diese Datei darf NIE in den Client-Bundle landen.
 * Daher nur aus Server-Komponenten / Route-Handlern / Server-Actions
 * importieren — niemals aus "use client"-Komponenten.
 */

let cached: DB | null = null;

function getPath(): string {
  return process.env.DATABASE_PATH || "./data/restaurantaltkarow.db";
}

export function getDb(): DB {
  if (cached) return cached;

  const path = getPath();
  // Pfad zum Verzeichnis sicherstellen
  try {
    mkdirSync(dirname(path), { recursive: true });
  } catch {
    // existiert bereits — OK
  }

  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("synchronous = NORMAL");

  // Schema initialisieren (idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      party_size INTEGER NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_note TEXT,
      proposed_date TEXT,
      proposed_time TEXT,
      decided_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
    CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
    CREATE INDEX IF NOT EXISTS idx_reservations_token ON reservations(token);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  cached = db;
  return db;
}

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "change_proposed";

export type ReservationRow = {
  id: number;
  token: string;
  created_at: string;
  reservation_date: string;
  reservation_time: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  notes: string | null;
  status: ReservationStatus;
  admin_note: string | null;
  proposed_date: string | null;
  proposed_time: string | null;
  decided_at: string | null;
};
