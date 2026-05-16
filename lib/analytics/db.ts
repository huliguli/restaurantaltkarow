import { randomBytes } from "node:crypto";
import { getDb } from "../db";

/**
 * Sync-Helpers für Analytics gegen better-sqlite3.
 * Werden NUR aus API-Routes (Node-Runtime) aufgerufen.
 */

function uid(): string {
  return randomBytes(12).toString("base64url");
}

export interface IngestParams {
  type: string;
  sessionId: string;
  visitorId: string;
  pagePath: string | null;
  referrer: string | null;
  ctaId: string | null;
  formId: string | null;
  scrollPct: number | null;
  durationMs: number | null;
  deviceType: string;
  browser: string;
  os: string;
  language: string | null;
  country: string | null;
  meta: string | null;
}

/**
 * Verarbeitet einen Event: aktualisiert visitor-day, session, event-Row.
 * Alles in EINER Transaktion → atomic.
 */
export function ingestEvent(p: IngestParams): void {
  const db = getDb();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const nowIso = now.toISOString();

  const tx = db.transaction(() => {
    // 1) Visitor-Day-Record für Unique-Visitor-Tracking
    const existingVisitor = db
      .prepare(
        `SELECT 1 FROM analytics_visitors WHERE visitor_id = ? AND date = ?`,
      )
      .get(p.visitorId, today);

    let isReturning = false;
    if (!existingVisitor) {
      const anyPrev = db
        .prepare(
          `SELECT 1 FROM analytics_visitors WHERE visitor_id = ? LIMIT 1`,
        )
        .get(p.visitorId);
      isReturning = !!anyPrev;
      db.prepare(
        `INSERT INTO analytics_visitors (visitor_id, date, first_seen_at, is_returning)
         VALUES (?, ?, ?, ?)`,
      ).run(p.visitorId, today, nowIso, isReturning ? 1 : 0);
    }

    // 2) Session upsert
    const sessionExisting = db
      .prepare(
        `SELECT id, last_seen_at FROM analytics_sessions WHERE id = ?`,
      )
      .get(p.sessionId) as
      | { id: string; last_seen_at: string }
      | undefined;

    if (!sessionExisting) {
      db.prepare(`
        INSERT INTO analytics_sessions
          (id, visitor_id, started_at, last_seen_at, duration_ms,
           pageviews, event_count, entry_path, referrer,
           device_type, browser, os, language, country, is_returning)
        VALUES (?, ?, ?, ?, 0, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        p.sessionId,
        p.visitorId,
        nowIso,
        nowIso,
        p.type === "pageview" ? 1 : 0,
        p.pagePath,
        p.referrer,
        p.deviceType,
        p.browser,
        p.os,
        p.language,
        p.country,
        isReturning ? 1 : 0,
      );
    } else {
      const elapsed =
        now.getTime() - new Date(sessionExisting.last_seen_at).getTime();
      const capped = Math.max(0, Math.min(elapsed, 30 * 60 * 1000));
      db.prepare(`
        UPDATE analytics_sessions
           SET last_seen_at  = ?,
               duration_ms   = duration_ms + ?,
               pageviews     = pageviews + ?,
               event_count   = event_count + 1
         WHERE id = ?
      `).run(
        nowIso,
        capped,
        p.type === "pageview" ? 1 : 0,
        p.sessionId,
      );
    }

    // 3) Event-Row
    db.prepare(`
      INSERT INTO analytics_events
        (id, type, visitor_id, session_id, page_path, referrer,
         cta_id, form_id, meta, device_type, browser, os, language, country,
         scroll_pct, duration_ms, created_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uid(),
      p.type,
      p.visitorId,
      p.sessionId,
      p.pagePath,
      p.referrer,
      p.ctaId,
      p.formId,
      p.meta,
      p.deviceType,
      p.browser,
      p.os,
      p.language,
      p.country,
      p.scrollPct,
      p.durationMs,
      nowIso,
    );
  });

  tx();
}

/* ============================================================
 *  Consent persist
 * ============================================================ */

export interface ConsentRecord {
  visitorId: string;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  policyVersion: string;
  ipHash: string | null;
  userAgent: string | null;
}

export function recordConsent(c: ConsentRecord): void {
  const db = getDb();
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO consents
      (id, visitor_id, necessary, analytics, marketing, functional,
       policy_version, withdrawn, ip_hash, user_agent, created_at, updated_at)
    VALUES (?, ?, 1, ?, ?, ?, ?, 0, ?, ?, ?, ?)
  `).run(
    uid(),
    c.visitorId,
    c.analytics ? 1 : 0,
    c.marketing ? 1 : 0,
    c.functional ? 1 : 0,
    c.policyVersion,
    c.ipHash,
    c.userAgent,
    nowIso,
    nowIso,
  );
}
