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
alter table inquiries add column if not exists status text not null default 'new';
create index if not exists inquiries_status_idx on inquiries (status, created_at desc);
alter table inquiries add column if not exists phone text;
`;

export const STATUSES = ["new", "replied", "archived"] as const;
export type Status = (typeof STATUSES)[number];
export const isStatus = (v: unknown): v is Status => STATUSES.includes(v as Status);

export const INSERT_SQL = `
insert into inquiries
  (name, email, phone, shoot_type, preferred_date, flexible, budget, message, ip)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
returning id
`;

export const MARK_SENT_SQL = `
update inquiries set notified = $2, confirmed = $3 where id = $1
`;

export const RECENT_SQL = `
select id, created_at, name, email, phone, shoot_type, preferred_date, flexible,
       budget, message, notified, confirmed, status
from inquiries
order by created_at desc
limit $1
`;

/**
 * Filtered list. $1 status or null for all; $2 search or null; $3 limit.
 * The search is a case-insensitive substring over name and email. The caller
 * escapes LIKE wildcards in the term, so a visitor typing "%" finds nobody.
 */
export const LIST_SQL = `
select id, created_at, name, email, phone, shoot_type, preferred_date, flexible,
       budget, message, notified, confirmed, status
from inquiries
where ($1::text is null or status = $1)
  and ($2::text is null or name ilike $2 or email ilike $2)
order by created_at desc
limit $3
`;

export const COUNTS_SQL = `
select status, count(*)::int as n from inquiries group by status
`;

export const WEEK_SQL = `
select count(*)::int as n from inquiries where created_at > now() - interval '7 days'
`;

export const GET_SQL = `
select id, created_at, name, email, phone, shoot_type, preferred_date, flexible,
       budget, message, notified, confirmed, status
from inquiries where id = $1
`;

export const SET_STATUS_SQL = `
update inquiries set status = $2 where id = $1
`;

export const MARK_NOTIFIED_SQL = `
update inquiries set notified = true where id = $1
`;

/**
 * Where a row actually goes.
 *
 *   DATABASE_URL set          → Neon, over HTTP. This is production.
 *   unset, and not production → a local Postgres file under .pgdata/, so
 *                               storage works in development with no account
 *                               and no server to install.
 *   unset, in production      → storage is off, and that is supported: the
 *                               notification email remains the only record.
 *
 * The local backend is PGlite — Postgres compiled to WASM, the same engine the
 * SQL is tested against. It is a devDependency and is only ever imported when
 * the branch above is taken, so it never reaches a production bundle.
 */
export const LOCAL_DIR = ".pgdata";

const localBacked = () =>
  !process.env.DATABASE_URL && process.env.NODE_ENV !== "production";

export const isConfigured = () => Boolean(process.env.DATABASE_URL) || localBacked();

/** Survives hot reloads, which would otherwise open a new database per edit. */
const globalForPglite = globalThis as typeof globalThis & {
  __pglite?: Promise<LocalDb>;
};

type LocalDb = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  exec: (sql: string) => Promise<unknown>;
};

/**
 * Loaded through a specifier assembled at runtime, so no bundler can resolve it
 * statically. That matters: PGlite is a devDependency, and a production install
 * prunes it — a static import makes the build fail there even though this code
 * path can never be reached in production. `serverExternalPackages` alone is not
 * enough, because the module is still resolved while building.
 */
async function loadPglite(): Promise<new (dir: string) => LocalDb> {
  const specifier = ["@electric-sql", "pglite"].join("/");
  const mod = (await import(/* turbopackIgnore: true */ /* webpackIgnore: true */ specifier)) as {
    PGlite: new (dir: string) => LocalDb;
  };
  return mod.PGlite;
}

function localClient() {
  globalForPglite.__pglite ??= (async () => {
    const PGlite = await loadPglite();
    console.info(
      `[inquiry] no DATABASE_URL — storing enquiries locally in ${LOCAL_DIR}/. ` +
        `Set DATABASE_URL before deploying.`,
    );
    return new PGlite(LOCAL_DIR);
  })();
  return globalForPglite.__pglite;
}

/** One entry point, so the two backends cannot drift apart. */
async function query(sql: string, params: unknown[] = []): Promise<unknown[]> {
  if (localBacked()) return (await (await localClient()).query(sql, params)).rows;
  return (await neon(process.env.DATABASE_URL as string).query(sql, params)) as unknown[];
}

let schemaReady: Promise<void> | null = null;

/**
 * Creates the table on first use. `if not exists` makes it safe to run on every
 * cold start, and the promise is cached so concurrent requests do it once.
 *
 * All statements go in a single request. Neon's HTTP endpoint takes one
 * statement per query, so they were four sequential round trips — from
 * Kathmandu to us-east-2 that alone was over a second on every cold start.
 */
function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const statements = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean);
    if (localBacked()) {
      await (await localClient()).exec(SCHEMA_SQL);
      return;
    }
    const sql = neon(process.env.DATABASE_URL as string);
    await sql.transaction(statements.map((st) => sql.query(st)));
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
  const rows = (await query(INSERT_SQL, [
    values.name,
    values.email,
    values.phone || null,
    values.shootType,
    values.date || null,
    values.flexible === "on",
    values.budget,
    values.message,
    ip,
  ])) as { id: number }[];

  return rows[0]?.id ?? null;
}

export type StoredInquiry = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  shoot_type: string;
  preferred_date: string | null;
  flexible: boolean;
  budget: string;
  message: string;
  notified: boolean;
  confirmed: boolean;
  status: Status;
};

/** Most recent first. Only ever called behind authentication. */
export async function recentInquiries(limit = 50): Promise<StoredInquiry[]> {
  if (!isConfigured()) return [];
  await ensureSchema();
  return (await query(RECENT_SQL, [Math.min(limit, 200)])) as StoredInquiry[];
}

/** Turns a person's search into a LIKE pattern that cannot become a wildcard. */
const likePattern = (term: string) =>
  `%${term.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export async function listInquiries(opts: {
  status?: Status | null;
  q?: string | null;
  limit?: number;
}): Promise<StoredInquiry[]> {
  if (!isConfigured()) return [];
  await ensureSchema();
  const q = opts.q?.trim();
  return (await query(LIST_SQL, [
    opts.status ?? null,
    q ? likePattern(q) : null,
    Math.min(opts.limit ?? 100, 200),
  ])) as StoredInquiry[];
}

export async function countInquiries(): Promise<Record<Status, number> & { week: number; all: number }> {
  const zero = { new: 0, replied: 0, archived: 0, week: 0, all: 0 };
  if (!isConfigured()) return zero;
  await ensureSchema();
  const rows = (await query(COUNTS_SQL)) as { status: Status; n: number }[];
  const week = (await query(WEEK_SQL)) as { n: number }[];
  const out = { ...zero, week: week[0]?.n ?? 0 };
  for (const r of rows) if (isStatus(r.status)) out[r.status] = r.n;
  out.all = out.new + out.replied + out.archived;
  return out;
}

export async function getInquiry(id: number): Promise<StoredInquiry | null> {
  if (!isConfigured()) return null;
  await ensureSchema();
  const rows = (await query(GET_SQL, [id])) as StoredInquiry[];
  return rows[0] ?? null;
}

export async function setStatus(id: number, status: Status): Promise<void> {
  if (!isConfigured()) return;
  await query(SET_STATUS_SQL, [id, status]);
}

export async function markNotified(id: number): Promise<void> {
  if (!isConfigured()) return;
  await query(MARK_NOTIFIED_SQL, [id]);
}

/** Best-effort: records which emails actually went out, never blocks the reply. */
export async function markSent(
  id: number,
  notified: boolean,
  confirmed: boolean,
): Promise<void> {
  if (!isConfigured()) return;
  await query(MARK_SENT_SQL, [id, notified, confirmed]);
}
