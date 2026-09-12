#!/usr/bin/env node
/**
 * Reads recent enquiries out of the database.
 *
 * The point of storing them is being able to look — without opening a Postgres
 * client or trusting your inbox to still have the email.
 *
 * Usage:  npm run inquiries        (latest 20)
 *         npm run inquiries -- 50
 */
import { neon } from "@neondatabase/serverless";
import fs from "node:fs/promises";

const src = await fs.readFile("src/lib/inquiry-store.ts", "utf8");
const RECENT = /export const RECENT_SQL = `([\s\S]*?)`/.exec(src)[1];
const LOCAL_DIR = /export const LOCAL_DIR = "([^"]+)"/.exec(src)[1];

const limit = Number(process.argv[2]) || 20;

/** Reads whichever database the site is actually writing to. */
async function read() {
  if (process.env.DATABASE_URL) {
    return neon(process.env.DATABASE_URL).query(RECENT, [limit]);
  }
  if (!(await fs.stat(LOCAL_DIR).catch(() => null))) {
    console.error(
      `\nNo enquiries stored yet.\n\n` +
        `DATABASE_URL is not set, so development writes to ${LOCAL_DIR}/ — which\n` +
        `does not exist until the first enquiry is submitted. Run the site and\n` +
        `send one, or set DATABASE_URL in .env.local for a real database.\n`,
    );
    process.exit(1);
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(LOCAL_DIR);
  const res = await db.query(RECENT, [limit]);
  await db.close();
  return res.rows;
}

const rows = await read();
if (!process.env.DATABASE_URL) {
  console.log(`\n\x1b[2mreading the local development database (${LOCAL_DIR}/)\x1b[0m`);
}

if (rows.length === 0) {
  console.log("\nNo enquiries yet.\n");
  process.exit(0);
}

const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

console.log(`\n${rows.length} most recent enquiries\n`);
for (const r of rows) {
  const when = new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const date = r.flexible ? "flexible" : r.preferred_date
    ? new Date(r.preferred_date).toLocaleDateString("en-GB", { dateStyle: "medium" })
    : "not given";
  // A stored enquiry whose email never went out is the one you must act on.
  const warn = r.notified ? "" : `  ${bold("\x1b[33m← email never sent\x1b[0m")}`;
  const status = r.status && r.status !== "new" ? dim(`  [${r.status}]`) : "";
  console.log(`${bold(`#${r.id}  ${r.name}`)}  ${dim(when)}${status}${warn}`);
  console.log(dim(`  ${r.email}   ${r.shoot_type}   ${date}   ${r.budget}`));
  console.log(`  ${r.message.replace(/\s+/g, " ").slice(0, 150)}`);
  console.log();
}
