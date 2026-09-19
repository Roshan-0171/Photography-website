"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Archive, Check, Mail, RotateCcw, Search, Send, X } from "lucide-react";

import { resendNotification, updateStatus } from "@/app/admin/enquiries/actions";
import type { Status } from "@/lib/inquiry-store";

/** Everything pre-formatted on the server, so nothing locale- or timezone-
 *  dependent is computed during render on the client. */
export type EnquiryView = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  shootType: string;
  budget: string;
  message: string;
  notified: boolean;
  status: Status;
  createdLabel: string;
  dateLabel: string;
};

export type Tab = Status | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "new", label: "New" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

const BTN =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 border border-line px-4 text-sm transition-colors duration-200 hover:bg-muted";

/**
 * One pure filter used by the server for the first paint and by the client
 * for every keystroke after it. Same function, same input, same output — so
 * the markup React hydrates is byte-identical to what it renders next.
 *
 * A query searches every status; tabs only apply when there is no query.
 */
export function filterRows(rows: EnquiryView[], tab: Tab, q: string): EnquiryView[] {
  const term = q.trim().toLowerCase();
  if (term) {
    return rows.filter(
      (r) => r.name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term),
    );
  }
  return tab === "all" ? rows : rows.filter((r) => r.status === tab);
}

type Props = {
  rows: EnquiryView[];
  counts: Record<Status, number> & { all: number };
  initialTab: Tab;
  initialQ: string;
};

export default function EnquiryList({ rows, counts, initialTab, initialQ }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [q, setQ] = useState(initialQ);

  const shown = useMemo(() => filterRows(rows, tab, q), [rows, tab, q]);
  const searching = q.trim().length > 0;

  // Keep the address bar truthful without a navigation, so a filtered view can
  // be bookmarked or sent to yourself. Debounced: typing should not thrash it.
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (searching) params.set("q", q.trim());
      else if (tab !== "new") params.set("status", tab);
      const next = params.toString() ? `?${params}` : window.location.pathname;
      if (next !== window.location.search && next !== window.location.pathname + window.location.search) {
        window.history.replaceState(null, "", next);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [tab, q, searching]);

  const pick = (t: Tab) => {
    setQ("");
    setTab(t);
  };

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        {/* Real links with real hrefs: they work before hydration and without
            JavaScript. With it, the click is handled in place. */}
        <nav aria-label="Filter by status">
          <ul className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const active = !searching && tab === t.key;
              return (
                <li key={t.key}>
                  <Link
                    href={`/admin/enquiries${t.key === "new" ? "" : `?status=${t.key}`}`}
                    onClick={(e) => {
                      e.preventDefault();
                      pick(t.key);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center gap-2 px-4 text-sm transition-colors duration-200 ${
                      active ? "bg-fg text-bg" : "border border-line hover:bg-muted"
                    }`}
                  >
                    {t.label}
                    <span className={`text-xs tabular-nums ${active ? "text-bg/70" : "text-muted-fg"}`}>
                      {counts[t.key]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Filters live as you type. The form is still a real GET form, so
            Enter — or no JavaScript at all — submits to the server instead. */}
        <form
          method="get"
          action="/admin/enquiries"
          onSubmit={(e) => e.preventDefault()}
          className="flex min-w-0 gap-2"
        >
          <label htmlFor="q" className="sr-only">
            Search all enquiries by name or email
          </label>
          <div className="relative min-w-0">
            <input
              id="q"
              name="q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search all by name or email"
              autoComplete="off"
              className="min-h-11 w-52 min-w-0 border border-field bg-bg px-3 pr-10 text-sm sm:w-72"
            />
            {searching && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 grid w-10 cursor-pointer place-items-center text-muted-fg hover:text-fg"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <button type="submit" className={BTN} aria-label="Search">
            <Search className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <p className="mt-8 text-sm text-muted-fg" aria-live="polite">
        {searching
          ? shown.length === 0
            ? <>Nothing matches &ldquo;{q.trim()}&rdquo; in any status.</>
            : <>{shown.length} {shown.length === 1 ? "match" : "matches"} for &ldquo;{q.trim()}&rdquo; across every status.</>
          : shown.length === 0
            ? tab === "new" ? "Nothing awaiting a reply." : "Nothing here."
            : null}
      </p>

      {/* Cards, not a table: read on a phone, and a ten-column table is
          unreadable at 375px however it is styled. */}
      <ul className="mt-4 space-y-8">
        {shown.map((row) => (
          <li key={row.id} className={`border p-6 ${row.status === "new" ? "border-fg" : "border-line"}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 className="text-lg">{row.name}</h2>
              <p className="text-xs tabular-nums text-muted-fg">
                #{row.id} · {row.createdLabel}
                {row.status !== "new" && (
                  <> · <span className="uppercase tracking-[0.12em]">{row.status}</span></>
                )}
              </p>
            </div>

            <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex min-w-0 gap-2">
                <dt className="shrink-0 text-muted-fg">Email</dt>
                <dd className="min-w-0 [overflow-wrap:anywhere]">
                  <a
                    href={`mailto:${row.email}?subject=${encodeURIComponent("Re: your enquiry")}`}
                    className="underline underline-offset-4"
                  >
                    {row.email}
                  </a>
                </dd>
              </div>
              {row.phone && (
                <div className="flex min-w-0 gap-2">
                  <dt className="shrink-0 text-muted-fg">Phone</dt>
                  <dd className="min-w-0 [overflow-wrap:anywhere]">
                    <a
                      href={`tel:${row.phone.replace(/\s/g, "")}`}
                      className="underline underline-offset-4"
                    >
                      {row.phone}
                    </a>
                  </dd>
                </div>
              )}
              <div className="flex gap-2"><dt className="shrink-0 text-muted-fg">Shoot</dt><dd>{row.shootType}</dd></div>
              <div className="flex gap-2"><dt className="shrink-0 text-muted-fg">Date</dt><dd>{row.dateLabel}</dd></div>
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
    </>
  );
}
