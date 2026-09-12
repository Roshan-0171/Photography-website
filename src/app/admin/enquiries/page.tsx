import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlert, LogOut, Mail } from "lucide-react";

import { isSignedIn } from "@/lib/admin-auth";
import { isConfigured, recentInquiries } from "@/lib/inquiry-store";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Enquiries" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

const when = (row: { flexible: boolean; preferred_date: string | null }) =>
  row.flexible
    ? "Flexible"
    : row.preferred_date
      ? new Date(row.preferred_date).toLocaleDateString("en-GB", { dateStyle: "medium" })
      : "No date given";

export default async function EnquiriesPage() {
  // Signed out, this URL is a 404 — not a redirect to the sign-in page. A
  // redirect would confirm to anyone probing that something lives here; a 404
  // looks exactly like a page that does not exist. You sign in at /admin.
  if (!(await isSignedIn())) notFound();

  // Only reached once authenticated. Nothing is read before this line, so no
  // unauthenticated response can ever contain enquiry data.
  const rows = isConfigured() ? await recentInquiries(100) : [];

  return (
    <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl">Enquiries</h1>
          <p className="mt-2 text-sm text-muted-fg">
            {rows.length === 0 ? "Nothing yet." : `${rows.length} most recent, newest first.`}
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-line px-5 text-sm transition-colors duration-200 hover:bg-muted"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>

      {!isConfigured() && (
        <p className="mt-12 flex max-w-prose items-start gap-2 border border-destructive p-6 text-sm">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <span>
            No database is configured, so nothing is being stored and there is
            nothing to show. Set <code>DATABASE_URL</code> — until then the
            notification email is the only record of an enquiry.
          </span>
        </p>
      )}

      {/* Cards, not a table: this is read on a phone, and a ten-column table
          is unreadable at 375px however it is styled. */}
      <ul className="mt-12 space-y-8">
        {rows.map((row) => (
          <li key={row.id} className="border border-line p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 className="text-lg">{row.name}</h2>
              <p className="text-xs tabular-nums text-muted-fg">
                #{row.id} · {fmt(row.created_at)}
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
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted-fg">Shoot</dt>
                <dd>{row.shoot_type}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted-fg">Date</dt>
                <dd>{when(row)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted-fg">Budget</dt>
                <dd>{row.budget}</dd>
              </div>
            </dl>

            <p className="mt-4 max-w-prose whitespace-pre-wrap text-secondary">{row.message}</p>

            {/* The ones that need you: stored, but you were never emailed. */}
            {!row.notified && (
              <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                The notification email for this enquiry never sent.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
