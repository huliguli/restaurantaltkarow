import { getDb } from "../db";

/* ============================================================
 *  Period & Range
 * ============================================================ */

export type Period = "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  /** ISO YYYY-MM-DD-Strings — inkl. */
  days: string[];
  fromIso: string;
  toIso: string;
}

function startOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cur = startOfUtcDay(from);
  const end = startOfUtcDay(to);
  while (cur.getTime() <= end.getTime()) {
    out.push(dateStr(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export function resolveRange(
  period: Period,
  fromIso?: string,
  toIso?: string,
): DateRange {
  const now = new Date();
  let from: Date;
  let to: Date = endOfUtcDay(now);

  switch (period) {
    case "today":
      from = startOfUtcDay(now);
      break;
    case "7d":
      from = startOfUtcDay(new Date(now.getTime() - 6 * 86400000));
      break;
    case "30d":
      from = startOfUtcDay(new Date(now.getTime() - 29 * 86400000));
      break;
    case "90d":
      from = startOfUtcDay(new Date(now.getTime() - 89 * 86400000));
      break;
    case "custom":
      from =
        fromIso && !Number.isNaN(Date.parse(fromIso))
          ? startOfUtcDay(new Date(fromIso))
          : startOfUtcDay(new Date(now.getTime() - 6 * 86400000));
      to =
        toIso && !Number.isNaN(Date.parse(toIso))
          ? endOfUtcDay(new Date(toIso))
          : endOfUtcDay(now);
      break;
    default:
      from = startOfUtcDay(new Date(now.getTime() - 6 * 86400000));
  }

  return {
    from,
    to,
    days: daysBetween(from, to),
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
  };
}

/* ============================================================
 *  KPIs
 * ============================================================ */

export interface OverviewKpis {
  visits: number;
  uniqueVisitors: number;
  pageviews: number;
  avgSessionMs: number;
  bounceRatePct: number;
  formStarts: number;
  formSubmits: number;
  conversionPct: number;
  consentRecords: number;
  consentAnalyticsRatePct: number;
}

function c(sql: string, params: unknown[] = []): number {
  const db = getDb();
  const row = db.prepare(sql).get(...params) as { c: number } | undefined;
  return row?.c ?? 0;
}

export function getOverviewKpis(range: DateRange): OverviewKpis {
  const db = getDb();

  const visits = c(
    `SELECT COUNT(*) AS c FROM analytics_sessions WHERE started_at >= ? AND started_at <= ?`,
    [range.fromIso, range.toIso],
  );
  const pageviews = c(
    `SELECT COUNT(*) AS c FROM analytics_events WHERE type = 'pageview' AND created_at >= ? AND created_at <= ?`,
    [range.fromIso, range.toIso],
  );
  const formStarts = c(
    `SELECT COUNT(*) AS c FROM analytics_events WHERE type = 'form_start' AND created_at >= ? AND created_at <= ?`,
    [range.fromIso, range.toIso],
  );
  const formSubmits = c(
    `SELECT COUNT(*) AS c FROM analytics_events WHERE type = 'form_submit' AND created_at >= ? AND created_at <= ?`,
    [range.fromIso, range.toIso],
  );

  // Unique-Visitors: DISTINCT visitor_id in visitor-day records innerhalb der Range
  const placeholders = range.days.map(() => "?").join(",");
  const uniqueVisitors = c(
    `SELECT COUNT(DISTINCT visitor_id) AS c FROM analytics_visitors WHERE date IN (${placeholders || "''"})`,
    range.days,
  );

  const sessionStatsRow = db
    .prepare(`
      SELECT
        COALESCE(SUM(duration_ms), 0) AS total_ms,
        COALESCE(SUM(CASE WHEN pageviews <= 1 THEN 1 ELSE 0 END), 0) AS one_view
      FROM analytics_sessions
      WHERE started_at >= ? AND started_at <= ?
    `)
    .get(range.fromIso, range.toIso) as
    | { total_ms: number; one_view: number }
    | undefined;

  const totalDuration = sessionStatsRow?.total_ms ?? 0;
  const oneViewSessions = sessionStatsRow?.one_view ?? 0;
  const avgSessionMs = visits > 0 ? Math.round(totalDuration / visits) : 0;
  const bounceRatePct = visits > 0 ? (oneViewSessions / visits) * 100 : 0;
  const conversionPct = visits > 0 ? (formSubmits / visits) * 100 : 0;

  const consentRecords = c(
    `SELECT COUNT(*) AS c FROM consents WHERE created_at >= ? AND created_at <= ?`,
    [range.fromIso, range.toIso],
  );
  const consentAnalytics = c(
    `SELECT COUNT(*) AS c FROM consents WHERE created_at >= ? AND created_at <= ? AND analytics = 1`,
    [range.fromIso, range.toIso],
  );
  const consentAnalyticsRatePct =
    consentRecords > 0 ? (consentAnalytics / consentRecords) * 100 : 0;

  return {
    visits,
    uniqueVisitors,
    pageviews,
    avgSessionMs,
    bounceRatePct: round1(bounceRatePct),
    formStarts,
    formSubmits,
    conversionPct: round2(conversionPct),
    consentRecords,
    consentAnalyticsRatePct: round1(consentAnalyticsRatePct),
  };
}

/* ============================================================
 *  Tägliche Zeitserie
 * ============================================================ */

export interface TimePoint {
  date: string;
  visits: number;
  pageviews: number;
  uniqueVisitors: number;
}

export function getDailySeries(range: DateRange): TimePoint[] {
  const db = getDb();
  const map = new Map<string, TimePoint>();
  for (const d of range.days) {
    map.set(d, { date: d, visits: 0, pageviews: 0, uniqueVisitors: 0 });
  }

  const sessions = db
    .prepare(
      `SELECT substr(started_at, 1, 10) AS d, COUNT(*) AS c
         FROM analytics_sessions
        WHERE started_at >= ? AND started_at <= ?
        GROUP BY d`,
    )
    .all(range.fromIso, range.toIso) as { d: string; c: number }[];
  for (const s of sessions) {
    const p = map.get(s.d);
    if (p) p.visits = s.c;
  }

  const pvs = db
    .prepare(
      `SELECT substr(created_at, 1, 10) AS d, COUNT(*) AS c
         FROM analytics_events
        WHERE type = 'pageview' AND created_at >= ? AND created_at <= ?
        GROUP BY d`,
    )
    .all(range.fromIso, range.toIso) as { d: string; c: number }[];
  for (const e of pvs) {
    const p = map.get(e.d);
    if (p) p.pageviews = e.c;
  }

  const placeholders = range.days.map(() => "?").join(",");
  if (placeholders) {
    const vis = db
      .prepare(
        `SELECT date AS d, COUNT(DISTINCT visitor_id) AS c
           FROM analytics_visitors
          WHERE date IN (${placeholders})
          GROUP BY date`,
      )
      .all(...range.days) as { d: string; c: number }[];
    for (const v of vis) {
      const p = map.get(v.d);
      if (p) p.uniqueVisitors = v.c;
    }
  }

  return [...map.values()];
}

/* ============================================================
 *  Top-Listen
 * ============================================================ */

export interface TopRow {
  key: string;
  count: number;
}

export function getTopPages(range: DateRange, limit = 10): TopRow[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT page_path AS key, COUNT(*) AS count
        FROM analytics_events
       WHERE type = 'pageview'
         AND created_at >= ? AND created_at <= ?
         AND page_path IS NOT NULL
       GROUP BY page_path
       ORDER BY count DESC
       LIMIT ?
    `)
    .all(range.fromIso, range.toIso, limit) as TopRow[];
}

export function getTopReferrers(range: DateRange, limit = 10): TopRow[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT COALESCE(referrer, '(direkt)') AS key, COUNT(*) AS count
        FROM analytics_sessions
       WHERE started_at >= ? AND started_at <= ?
       GROUP BY key
       ORDER BY count DESC
       LIMIT ?
    `)
    .all(range.fromIso, range.toIso, limit) as TopRow[];
}

export function getTopCtas(range: DateRange, limit = 10): TopRow[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT cta_id AS key, COUNT(*) AS count
        FROM analytics_events
       WHERE type = 'cta_click'
         AND created_at >= ? AND created_at <= ?
         AND cta_id IS NOT NULL
       GROUP BY cta_id
       ORDER BY count DESC
       LIMIT ?
    `)
    .all(range.fromIso, range.toIso, limit) as TopRow[];
}

export function getTopByGroup(
  range: DateRange,
  by: "device_type" | "browser" | "os" | "language" | "country",
  limit = 12,
): TopRow[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT COALESCE(${by}, 'Unbekannt') AS key, COUNT(*) AS count
        FROM analytics_sessions
       WHERE started_at >= ? AND started_at <= ?
       GROUP BY key
       ORDER BY count DESC
       LIMIT ?
    `)
    .all(range.fromIso, range.toIso, limit) as TopRow[];
}

/* ============================================================
 *  Hour / Weekday
 * ============================================================ */

export function getHourBuckets(
  range: DateRange,
): { hour: number; count: number }[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT CAST(substr(started_at, 12, 2) AS INTEGER) AS hour, COUNT(*) AS count
         FROM analytics_sessions
        WHERE started_at >= ? AND started_at <= ?
        GROUP BY hour`,
    )
    .all(range.fromIso, range.toIso) as { hour: number; count: number }[];
  const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  for (const r of rows) {
    if (r.hour >= 0 && r.hour < 24) buckets[r.hour].count = r.count;
  }
  return buckets;
}

export function getWeekdayBuckets(
  range: DateRange,
): { weekday: number; label: string; count: number }[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT started_at FROM analytics_sessions
        WHERE started_at >= ? AND started_at <= ?`,
    )
    .all(range.fromIso, range.toIso) as { started_at: string }[];
  const labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const buckets = labels.map((l, i) => ({ weekday: i, label: l, count: 0 }));
  for (const r of rows) {
    const d = new Date(r.started_at);
    const day = (d.getDay() + 6) % 7;
    buckets[day].count += 1;
  }
  return buckets;
}

/* ============================================================
 *  Returning vs New
 * ============================================================ */

export interface ReturningSplit {
  newVisitors: number;
  returningVisitors: number;
}

export function getReturningSplit(range: DateRange): ReturningSplit {
  const db = getDb();
  if (range.days.length === 0)
    return { newVisitors: 0, returningVisitors: 0 };
  const placeholders = range.days.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT visitor_id, MAX(is_returning) AS ret
         FROM analytics_visitors
        WHERE date IN (${placeholders})
        GROUP BY visitor_id`,
    )
    .all(...range.days) as { visitor_id: string; ret: number }[];
  let n = 0;
  let r = 0;
  for (const v of rows) (v.ret ? r++ : n++);
  return { newVisitors: n, returningVisitors: r };
}

/* ============================================================
 *  Funnel
 * ============================================================ */

export interface FunnelStep {
  label: string;
  count: number;
}

export function getFunnel(range: DateRange): FunnelStep[] {
  const db = getDb();
  const distinctSessions = (type: string): number => {
    const row = db
      .prepare(
        `SELECT COUNT(DISTINCT session_id) AS c
           FROM analytics_events
          WHERE type = ?
            AND created_at >= ? AND created_at <= ?`,
      )
      .get(type, range.fromIso, range.toIso) as { c: number } | undefined;
    return row?.c ?? 0;
  };
  return [
    { label: "Sessions mit Seitenaufruf", count: distinctSessions("pageview") },
    { label: "Formular gestartet", count: distinctSessions("form_start") },
    { label: "Formular abgeschickt", count: distinctSessions("form_submit") },
  ];
}

/* ============================================================
 *  Recent Events
 * ============================================================ */

export interface RecentEvent {
  id: string;
  type: string;
  page_path: string | null;
  cta_id: string | null;
  form_id: string | null;
  device_type: string | null;
  country: string | null;
  created_at: string;
}

export function getRecentEvents(
  range: DateRange,
  limit = 50,
): RecentEvent[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT id, type, page_path, cta_id, form_id, device_type, country, created_at
        FROM analytics_events
       WHERE created_at >= ? AND created_at <= ?
       ORDER BY created_at DESC
       LIMIT ?
    `)
    .all(range.fromIso, range.toIso, limit) as RecentEvent[];
}

/* ============================================================
 *  Consent Overview
 * ============================================================ */

export interface ConsentOverview {
  total: number;
  acceptedAnalytics: number;
  acceptedMarketing: number;
  acceptedFunctional: number;
  withdrawn: number;
}

export function getConsentOverview(range: DateRange): ConsentOverview {
  return {
    total: c(
      `SELECT COUNT(*) AS c FROM consents WHERE created_at >= ? AND created_at <= ?`,
      [range.fromIso, range.toIso],
    ),
    acceptedAnalytics: c(
      `SELECT COUNT(*) AS c FROM consents WHERE created_at >= ? AND created_at <= ? AND analytics = 1`,
      [range.fromIso, range.toIso],
    ),
    acceptedMarketing: c(
      `SELECT COUNT(*) AS c FROM consents WHERE created_at >= ? AND created_at <= ? AND marketing = 1`,
      [range.fromIso, range.toIso],
    ),
    acceptedFunctional: c(
      `SELECT COUNT(*) AS c FROM consents WHERE created_at >= ? AND created_at <= ? AND functional = 1`,
      [range.fromIso, range.toIso],
    ),
    withdrawn: c(
      `SELECT COUNT(*) AS c FROM consents WHERE created_at >= ? AND created_at <= ? AND withdrawn = 1`,
      [range.fromIso, range.toIso],
    ),
  };
}

/* ============================================================
 *  Helpers
 * ============================================================ */

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
