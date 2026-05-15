/**
 * Reservierungs-Regeln — pure Funktionen, Client + Server.
 *
 * Öffnungszeiten:
 *   Mi-Sa: 12:00 – 22:00 (Küche bis 21:00)
 *   So:    12:00 – 18:00
 *   Mo+Di: geschlossen (außer Veranstaltungen)
 *
 * Reservier-Regeln:
 *   - Slots in 30-Minuten-Schritten ab 12:00
 *   - Letzte Reservierung max. 2 Stunden vor Schluss
 *     → Mi-Sa: bis einschl. 20:00, So: bis einschl. 16:00
 *   - Mindest-Vorlauf: 2 Öffnungstage (Mo+Di werden übersprungen)
 *
 * Datumsformat: ISO "YYYY-MM-DD" — keine Timezone-Verwirrung.
 * Zeitformat: "HH:MM" 24h.
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = So

const CLOSED_DAYS: Weekday[] = [1, 2]; // Mo, Di

// Endzeiten (= letztmöglicher Slot, NICHT Schließzeit)
const LAST_SLOT_BY_WEEKDAY: Record<Weekday, string | null> = {
  0: "16:00", // Sonntag
  1: null,
  2: null,
  3: "20:00", // Mittwoch
  4: "20:00", // Donnerstag
  5: "20:00", // Freitag
  6: "20:00", // Samstag
};

const FIRST_SLOT = "12:00";

export function isClosedDay(d: Date): boolean {
  return CLOSED_DAYS.includes(d.getDay() as Weekday);
}

/**
 * Gibt das ISO-Datum (YYYY-MM-DD) zurück — in der LOKALEN Zeitzone des
 * Servers/Clients. Wichtig, damit kein UTC-Shift „den Tag stiehlt".
 */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Frühstes erlaubtes Reservierungsdatum:
 * Aktuelles Datum + 2 Öffnungstage (Mo+Di übersprungen).
 *
 * Beispiel:
 *   Mi → frühestens Fr (Do=1, Fr=2)
 *   Sa → frühestens Mi (So=1, Mi=2; Mo+Di übersprungen)
 *   So → frühestens Do (Mi=1, Do=2)
 */
export function earliestAllowedDate(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  let counted = 0;
  while (counted < 2) {
    d.setDate(d.getDate() + 1);
    if (!isClosedDay(d)) counted += 1;
  }
  return d;
}

export function isDateAllowed(iso: string, now: Date = new Date()): boolean {
  const d = fromIsoDate(iso);
  if (isClosedDay(d)) return false;
  const earliest = earliestAllowedDate(now);
  return d.getTime() >= earliest.getTime();
}

/**
 * Alle möglichen Slots eines Tages (30-Min-Schritte).
 * Gibt [] zurück, wenn Tag geschlossen.
 */
export function slotsForDate(iso: string): string[] {
  const d = fromIsoDate(iso);
  const weekday = d.getDay() as Weekday;
  const last = LAST_SLOT_BY_WEEKDAY[weekday];
  if (!last) return [];

  const result: string[] = [];
  const [startH, startM] = FIRST_SLOT.split(":").map(Number);
  const [endH, endM] = last.split(":").map(Number);

  let h = startH;
  let m = startM;
  while (h < endH || (h === endH && m <= endM)) {
    result.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }
  return result;
}

export function isTimeAllowedForDate(iso: string, time: string): boolean {
  return slotsForDate(iso).includes(time);
}

/**
 * Liefert die nächsten N erlaubten Daten ab `earliestAllowedDate`.
 * Praktisch für eine Auswahl-Dropdown-Liste.
 */
export function nextAllowedDates(count: number, now: Date = new Date()): Date[] {
  const result: Date[] = [];
  const cursor = earliestAllowedDate(now);
  while (result.length < count) {
    if (!isClosedDay(cursor)) {
      result.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

const WEEKDAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function formatDateGerman(d: Date | string): string {
  const date = typeof d === "string" ? fromIsoDate(d) : d;
  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()}. ${
    MONTH_NAMES[date.getMonth()]
  } ${date.getFullYear()}`;
}
