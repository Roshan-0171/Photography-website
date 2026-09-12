import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, CircleAlert, LogOut, Mail, RotateCcw, Search, Send, Check } from "lucide-react";

import { isSignedIn } from "@/lib/admin-auth";
import {
  countInquiries,
  isConfigured,
  isStatus,
  listInquiries,
  type Status,
  type StoredInquiry,
} from "@/lib/inquiry-store";
import { signOut } from "../actions";
import { resendNotification, updateStatus } from "./actions";

export const metadata: Metadata = { title: "Enquiries" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

const when = (row: StoredInquiry) =>
  row.flexible
    ? "Flexible"
    : row.preferred_date
      ? new Date(row.preferred_date).toLocaleDateString("en-GB", { dateStyle: "medium" })
      : "No date given";

const TABS: { key: Status | "all"; label: string }[] = [
  { key: "new", label: "New" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

const BTN =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 border border-line px-4 text-sm transition-colors duration-200 hover:bg-muted";

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  // Signed out, this URL is a 404 — not a redirect. A redirect would confirm
  // to anyone probing that something lives here. You sign in at /admin.
  if (!(await isSignedIn())) notFound();

  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || "";
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;

  // A search looks across every status. Scoping it to the current tab meant
  // searching for a name you knew existed and getting nothing, because it had
  // been marked replied or archived — indistinguishable from search being
  // broken. Tabs are for browsing; a query overrides them.
  const status: Status | null = q
    ? null
    : isStatus(rawStatus) ? rawStatus : rawStatus === "all" ? null : "new";
  const tab = q ? "all" : (status ?? "all");

  // Only reached once authenticated. Nothing is read before this line.
  const [rows, counts] = isConfigured()
    ? await Promise.all([listInquiries({ status, q: q || null }), countInquiries()])
    : [[], { new: 0, replied: 0, archived: 0, week: 0, all: 0 }];

  // Tab links clear the search: picking a tab means "browse this", not "narrow this".
  const href = (t: Status | "all") => `/admin/enquiries?status=${t}`;

  return (
    <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <h1 className="text-3xl sm:text-4xl">Enquiries</h1>
        <form action={signOut}>
          <button type="submit" className={BTN}>
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>

      {/* The three numbers that matter at a glance. */}
      <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6 text-center">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-muted-fg">Awaiting reply</dt>
          <dd className="mt-1 font-display text-3xl tabular-nums">{counts.new}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-muted-fg">This week</dt>
          <dd className="mt-1 font-display text-3xl tabular-nums">{counts.week}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-muted-fg">Total</dt>
          <dd className="mt-1 font-display text-3xl tabular-nums">{counts.all}</dd>
        </div>
      </dl>

      {!isConfigured() && (
        <p className="mt-8 flex max-w-prose items-start gap-2 border border-destructive p-6 text-sm">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <span>
            No database is configured, so nothing is being stored. Set{" "}
            <code>DATABASE_URL</code> — until then the notification email is the
            only record of an enquiry.
          </span>
        </p>
      )}

      {/* Filters are links and search is a GET form: bookmarkable, shareable to
          yourself, and working with no JavaScript at all. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filter by status">
          <ul className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <li key={t.key}>
                <Link
                  href={href(t.key)}
                  aria-current={tab === t.key ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 px-4 text-sm transition-colors duration-200 ${
                    tab === t.key ? "bg-fg text-bg" : "border border-line hover:bg-muted"
                  }`}
                >
                  {t.label}
                  <span className={`text-xs tabular-nums ${tab === t.key ? "text-bg/70" : "text-muted-fg"}`}>
                    {t.key === "all" ? counts.all : counts[t.key]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form method="get" className="flex min-w-0 gap-2">
          <label htmlFor="q" className="sr-only">Search all enquiries by name or email</label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search all by name or email"
            className="min-h-11 w-48 min-w-0 border border-field bg-bg px-3 text-sm sm:w-64"
          />
          <button type="submit" className={BTN} aria-label="Search">
            <Search className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      {q && rows.length > 0 && (
        <p className="mt-8 text-sm text-muted-fg">
          {rows.length} {rows.length === 1 ? "match" : "matches"} for &ldquo;{q}&rdquo; across
          every status.{" "}
          <Link href="/admin/enquiries" className="underline underline-offset-4">Clear</Link>
        </p>
      )}

      {rows.length === 0 && (
        <p className="mt-12 text-muted-fg">
          {q ? (
            <>Nothing matches &ldquo;{q}&rdquo; in any status.{" "}
              <Link href="/admin/enquiries" className="underline underline-offset-4">Clear</Link></>
          ) : tab === "new" ? "Nothing awaiting a reply." : "Nothing here."}
        </p>
      )}

      {/* Cards, not a table: read on a phone, and a ten-column table is
          unreadable at 375px however it is styled. */}
      <ul className="mt-8 space-y-8">
        {rows.map((row) => (
          <li key={row.id} className={`border p-6 ${row.status === "new" ? "border-fg" : "border-line"}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 className="text-lg">{row.name}</h2>
              <p className="text-xs tabular-nums text-muted-fg">
                #{row.id} · {fmt(row.created_at)}
                {row.status !== "new" && <> · <span className="uppercase tracking-[0.12em]">{row.status}</span></>}
              </p>
            </div>

            <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex min-w-0 gap-2">
                <dt className="shrink-0 text-muted-fg">Email</dt>
                <dd className="min-w-0 [overflow-wrap:anywhere]">
                  <a href={`mailto:${row.email}?subject=${encodeURIComponent("Re: your enquiry")}`} className="underline underline-offset-4">
                    {row.email}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2"><dt className="shrink-0 text-muted-fg">Shoot</dt><dd>{row.shoot_type}</dd></div>
              <div className="flex gap-2"><dt className="shrink-0 text-muted-fg">Date</dt><dd>{when(row)}</dd></div>
              <div className="flex gap-2"><dt className="shrink-0 text-muted-fg">Budget</dt><dd>{row.budget}</dd></div>
            </dl>

            <p className="mt-4 max-w-prose whitespace-pre-wrap text-secondary">{row.message}</p>

            {!row.notified && (
              <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                The notification email for this enquiry never sent.
              </p>
            )}

            {/* Each button is its own form: works without JavaScript, and the
                server action re-checks the session on every click. */}
            <div className="mt-6 flex flex-wrap gap-2">
              {row.status !== "replied" && (
                <form action={updateStatus}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="replied" />
                  <button type="submit" className={BTN}><Check className="size-4" aria-hidden="true" />Mark replied</button>
                </form>
              )}
              {row.status !== "archived" ? (
                <form action={updateStatus}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="archived" />
                  <button type="submit" className={BTN}><Archive className="size-4" aria-hidden="true" />Archive</button>
                </form>
              ) : (
                <form action={updateStatus}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="new" />
                  <button type="submit" className={BTN}><RotateCcw className="size-4" aria-hidden="true" />Restore</button>
                </form>
              )}
              {!row.notified && (
                <form action={resendNotification}>
                  <input type="hidden" name="id" value={row.id} />
                  <button type="submit" className={BTN}><Send className="size-4" aria-hidden="true" />Resend email</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
