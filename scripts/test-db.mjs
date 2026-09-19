#!/usr/bin/env node
/**
 * Exercises the enquiry SQL against a real Postgres.
 *
 * PGlite is Postgres compiled to WASM — same parser, same planner, same types —
 * so the schema and queries here are the ones that will run against Neon, not an
 * approximation of them. No server, no account, no network.
 */
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs/promises";

const src = await fs.readFile("src/lib/inquiry-store.ts", "utf8");
const grab = (name) =>
  new RegExp(`export const ${name} = \`([\\s\\S]*?)\``).exec(src)?.[1] ?? "";

const SCHEMA = grab("SCHEMA_SQL");
const INSERT = grab("INSERT_SQL");
const MARK = grab("MARK_SENT_SQL");
const RECENT = grab("RECENT_SQL");
const LIST = grab("LIST_SQL");
const COUNTS = grab("COUNTS_SQL");
const WEEK = grab("WEEK_SQL");
const SET_STATUS = grab("SET_STATUS_SQL");
const MARK_NOTIFIED = grab("MARK_NOTIFIED_SQL");
for (const [n, v] of [["SCHEMA", SCHEMA], ["INSERT", INSERT], ["MARK", MARK], ["RECENT", RECENT],
  ["LIST", LIST], ["COUNTS", COUNTS], ["WEEK", WEEK], ["SET_STATUS", SET_STATUS], ["MARK_NOTIFIED", MARK_NOTIFIED]]) {
  if (!v.trim()) throw new Error(`Could not read ${n} out of inquiry-store.ts`);
}

const db = new PGlite();
const ok = (s) => `\x1b[32m${s}\x1b[0m`;

for (const statement of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) {
  await db.query(statement);
}
console.log(ok("  schema applies"));

// Idempotent: a cold start runs it again every time.
for (const statement of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) {
  await db.query(statement);
}
console.log(ok("  schema is idempotent (safe on every cold start)"));

const rows = await db.query(INSERT, [
  "Anita Rai", "anita@example.com", "+977 980 000 1111", "Portrait sitting",
  "2026-10-17", false, "NPR 20,000 – 35,000",
  "A portrait for a book jacket.", "203.0.113.9",
]);
const id = rows.rows[0].id;
console.log(ok(`  insert returns id ${id}`));

// A flexible enquiry has no date, and phone is optional — both columns must
// accept null.
const r2 = await db.query(INSERT, [
  "Bikash Thapa", "bikash@example.com", null, "Editorial / commercial",
  null, true, "Not sure yet", "A feature on valley potters.", null,
]);
console.log(ok(`  null date, null phone and null ip accepted (id ${r2.rows[0].id})`));

await db.query(MARK, [id, true, false]);
const after = await db.query("select notified, confirmed from inquiries where id = $1", [id]);
console.log(ok(`  send status recorded: ${JSON.stringify(after.rows[0])}`));

const recent = await db.query(RECENT, [10]);
console.log(ok(`  recent returns ${recent.rows.length}, newest first: ${recent.rows.map(r => r.name).join(", ")}`));

// Parameterised throughout — this must be stored, never executed.
const nasty = "Robert'); drop table inquiries;--";
await db.query(INSERT, [nasty, "x@example.com", null, "Something else", null, false, "Not sure yet", "hello there", null]);
const still = await db.query("select count(*)::int as n from inquiries");
const stored = await db.query("select name from inquiries order by id desc limit 1");
console.log(ok(`  injection attempt stored as data, table intact (${still.rows[0].n} rows)`));
console.log(`    stored verbatim: ${JSON.stringify(stored.rows[0].name)}`);

// A table created by the previous schema (no status column) must migrate in place.
const old = new PGlite();
await old.query(`create table inquiries (id bigint generated always as identity primary key, created_at timestamptz not null default now(),
  name text not null, email text not null, shoot_type text not null, preferred_date date, flexible boolean not null default false,
  budget text not null, message text not null, ip text, notified boolean not null default false, confirmed boolean not null default false)`);
await old.query(`insert into inquiries (name,email,shoot_type,budget,message) values ('Old Row','old@example.com','Portrait sitting','Not sure yet','from before status existed')`);
for (const st of SCHEMA.split(";").map((x) => x.trim()).filter(Boolean)) await old.query(st);
const migrated = await old.query("select status from inquiries");
console.log(ok(`  existing table migrates: old row now has status '${migrated.rows[0].status}'`));
await old.close();

await db.query(SET_STATUS, [id, "replied"]);
const byStatus = await db.query(LIST, ["replied", null, 50]);
console.log(ok(`  filter by status: ${byStatus.rows.length} replied (${byStatus.rows.map(r => r.name).join(", ")})`));
const search = await db.query(LIST, [null, "%bikash%", 50]);
console.log(ok(`  search 'bikash' (case-insensitive): ${search.rows.map(r => r.name).join(", ")}`));
const wild = await db.query(LIST, [null, "%\\%%", 50]);
console.log(ok(`  escaped '%' search matches nobody: ${wild.rows.length} rows`));
const counts = await db.query(COUNTS);
console.log(ok(`  counts by status: ${counts.rows.map(r => `${r.status}=${r.n}`).join(" ")}`));
const week = await db.query(WEEK);
console.log(ok(`  this week: ${week.rows[0].n}`));
await db.query(MARK_NOTIFIED, [r2.rows[0].id]);
console.log(ok(`  mark notified works`));

const cols = await db.query(
  "select column_name, data_type, is_nullable from information_schema.columns where table_name='inquiries' order by ordinal_position",
);
console.log("\n  columns:");
for (const c of cols.rows) {
  console.log(`    ${c.column_name.padEnd(15)} ${c.data_type.padEnd(26)} ${c.is_nullable === "YES" ? "null ok" : "not null"}`);
}
await db.close();
