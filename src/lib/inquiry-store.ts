import { neon } from "@neondatabase/serverless";

import type { InquiryValues } from "@/data/emails";

/**
 * Durable record of every enquiry.
 *
 * Optional by design: with no DATABASE_URL the site behaves exactly as it did
 * before — the notification email is the only record. Set one and each enquiry
 * is also written to Postgres, which means a deleted email no longer loses it,
 * and you can finally answer questions the inbox cannot ("how many editorial
 * enquiries last quarter", "which budget band actually converts").
 *
 * Spoken to over Neon's HTTP driver rather than a TCP pool: serverless functions
 * come and go too quickly for connection pooling to behave.
 *
 * The SQL below is kept as plain strings, not hidden behind an ORM, so it can be
 * run verbatim against a real Postgres in the test script — and so you can read
 * exactly what touches your data.
 */

export const SCHEMA_SQL = `
create table if not exists inquiries (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  name           text        not null,
  email          text        not null,
  shoot_type     text        not null,
  preferred_date date,
  flexible       boolean     not null default false,
  budget         text        not null,
  message        text        not null,
  ip             text,
  notified       boolean     not null default false,
  confirmed      boolean     not null default false
);
create index if not exists inquiries_created_at_idx on inquiries (created_at desc);
`;

export const INSERT_SQL = `
insert into inquiries
  (name, email, shoot_type, preferred_date, flexible, budget, message, ip)
values ($1, $2, $3, $4, $5, $6, $7, $8)
returning id
`;

export const MARK_SENT_SQL = `
update inquiries set notified = $2, confirmed = $3 where id = $1
`;

export const RECENT_SQL = `
select id, created_at, name, email, shoot_type, preferred_date, flexible,
       budget, message, notified, confirmed
from inquiries
order by created_at desc
limit $1
`;

/** No DATABASE_URL means no database, and that is a supported configuration. */
export const isConfigured = () => Boolean(process.env.DATABASE_URL);

const client = () => neon(process.env.DATABASE_URL as string);

let schemaReady: Promise<void> | null = null;

/**
 * Creates the table on first use. `if not exists` makes it safe to run on every
 * cold start, and the promise is cached so concurrent requests do it once.
 */
function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const sql = client();
    for (const statement of SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
      await sql.query(statement);
    }
  })();
  return schemaReady;
}

/** Returns the new row's id, or null when storage is off or unreachable. */
export async function saveInquiry(
  values: InquiryValues,
  ip: string,
): Promise<number | null> {
  if (!isConfigured()) return null;

  await ensureSchema();
  const rows = (await client().query(INSERT_SQL, [
    values.name,
    values.email,
    values.shootType,
    values.date || null,
    values.flexible === "on",
    values.budget,
    values.message,
    ip,
  ])) as { id: number }[];

  return rows[0]?.id ?? null;
}

/** Best-effort: records which emails actually went out, never blocks the reply. */
export async function markSent(
  id: number,
  notified: boolean,
  confirmed: boolean,
): Promise<void> {
  if (!isConfigured()) return;
  await client().query(MARK_SENT_SQL, [id, notified, confirmed]);
}
