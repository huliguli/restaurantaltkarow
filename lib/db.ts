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

    -- === Self-hosted Analytics =====================================
    CREATE TABLE IF NOT EXISTS consents (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      necessary INTEGER NOT NULL DEFAULT 1,
      analytics INTEGER NOT NULL DEFAULT 0,
      marketing INTEGER NOT NULL DEFAULT 0,
      functional INTEGER NOT NULL DEFAULT 0,
      policy_version TEXT NOT NULL,
      withdrawn INTEGER NOT NULL DEFAULT 0,
      withdrawn_at TEXT,
      ip_hash TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_consents_visitor ON consents(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_consents_created ON consents(created_at);
    CREATE INDEX IF NOT EXISTS idx_consents_policy ON consents(policy_version);

    CREATE TABLE IF NOT EXISTS analytics_visitors (
      visitor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      is_returning INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (visitor_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_av_date ON analytics_visitors(date);

    CREATE TABLE IF NOT EXISTS analytics_sessions (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      pageviews INTEGER NOT NULL DEFAULT 0,
      event_count INTEGER NOT NULL DEFAULT 0,
      entry_path TEXT,
      referrer TEXT,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      language TEXT,
      country TEXT,
      is_returning INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_as_visitor ON analytics_sessions(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_as_started ON analytics_sessions(started_at);

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      page_path TEXT,
      referrer TEXT,
      cta_id TEXT,
      form_id TEXT,
      meta TEXT,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      language TEXT,
      country TEXT,
      scroll_pct INTEGER,
      duration_ms INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ae_type ON analytics_events(type);
    CREATE INDEX IF NOT EXISTS idx_ae_session ON analytics_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_ae_visitor ON analytics_events(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_ae_path ON analytics_events(page_path);
    CREATE INDEX IF NOT EXISTS idx_ae_cta ON analytics_events(cta_id);
    CREATE INDEX IF NOT EXISTS idx_ae_created ON analytics_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_ae_type_created ON analytics_events(type, created_at);
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
