import { randomBytes } from "node:crypto";
import { getDb, type ReservationRow, type ReservationStatus } from "./db";

export function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export function createReservation(input: {
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  partySize: number;
  notes?: string;
}): ReservationRow {
  const db = getDb();
  const token = generateToken();
  const stmt = db.prepare(`
    INSERT INTO reservations
      (token, created_at, reservation_date, reservation_time, name, email, phone, party_size, notes, status)
    VALUES
      (@token, @created_at, @reservation_date, @reservation_time, @name, @email, @phone, @party_size, @notes, 'pending')
  `);
  const info = stmt.run({
    token,
    created_at: new Date().toISOString(),
    reservation_date: input.date,
    reservation_time: input.time,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    party_size: input.partySize,
    notes: input.notes ?? null,
  });
  return getReservationById(Number(info.lastInsertRowid))!;
}

export function getReservationById(id: number): ReservationRow | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM reservations WHERE id = ?`)
    .get(id) as ReservationRow | undefined;
  return row ?? null;
}

export function listReservations(filter?: {
  status?: ReservationStatus;
  upcoming?: boolean;
}): ReservationRow[] {
  const db = getDb();
  let sql = `SELECT * FROM reservations WHERE 1=1`;
  const params: Record<string, unknown> = {};
  if (filter?.status) {
    sql += ` AND status = @status`;
    params.status = filter.status;
  }
  if (filter?.upcoming) {
    sql += ` AND reservation_date >= @today`;
    params.today = new Date().toISOString().slice(0, 10);
  }
  sql += ` ORDER BY reservation_date ASC, reservation_time ASC, id ASC`;
  return db.prepare(sql).all(params) as ReservationRow[];
}

export function updateReservationStatus(
  id: number,
  update: {
    status: ReservationStatus;
    admin_note?: string | null;
    proposed_date?: string | null;
    proposed_time?: string | null;
  },
): ReservationRow | null {
  const db = getDb();
  db.prepare(`
    UPDATE reservations
       SET status         = @status,
           admin_note     = @admin_note,
           proposed_date  = @proposed_date,
           proposed_time  = @proposed_time,
           decided_at     = @decided_at
     WHERE id = @id
  `).run({
    id,
    status: update.status,
    admin_note: update.admin_note ?? null,
    proposed_date: update.proposed_date ?? null,
    proposed_time: update.proposed_time ?? null,
    decided_at: new Date().toISOString(),
  });
  return getReservationById(id);
}
