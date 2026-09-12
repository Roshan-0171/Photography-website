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

if (!process.env.DATABASE_URL) {
  console.error(
    "\nDATABASE_URL is not set, so nothing is being stored.\n" +
      "Add it to .env.local — see .env.example. Until then the notification\n" +
      "email is the only record of an enquiry.\n",
  );
  process.exit(1);
}

const src = await fs.readFile("src/lib/inquiry-store.ts", "utf8");
const RECENT = /export const RECENT_SQL = `([\s\S]*?)`/.exec(src)[1];

const limit = Number(process.argv[2]) || 20;
const rows = await neon(process.env.DATABASE_URL).query(RECENT, [limit]);

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
  console.log(`${bold(`#${r.id}  ${r.name}`)}  ${dim(when)}${warn}`);
  console.log(dim(`  ${r.email}   ${r.shoot_type}   ${date}   ${r.budget}`));
  console.log(`  ${r.message.replace(/\s+/g, " ").slice(0, 150)}`);
  console.log();
}
