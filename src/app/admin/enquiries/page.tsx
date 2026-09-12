import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlert, LogOut } from "lucide-react";

import EnquiryList, { type EnquiryView, type Tab } from "@/components/EnquiryList";
import { isSignedIn } from "@/lib/admin-auth";
import { countInquiries, isConfigured, isStatus, listInquiries } from "@/lib/inquiry-store";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Enquiries" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  // Signed out, this URL is a 404 — not a redirect. A redirect would confirm
  // to anyone probing that something lives here. You sign in at /admin.
  if (!(await isSignedIn())) notFound();

  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || "";
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const initialTab: Tab = isStatus(rawStatus) ? rawStatus : rawStatus === "all" ? "all" : "new";

  // Only reached once authenticated. Nothing is read before this line.
  //
  // Every row comes down, not just the current tab's: filtering happens in the
  // browser as you type, and a search has to see every status to be useful.
  // A photographer's enquiries number in the hundreds at most.
  const [stored, counts] = isConfigured()
    ? await Promise.all([listInquiries({ status: null, q: null, limit: 200 }), countInquiries()])
    : [[], { new: 0, replied: 0, archived: 0, week: 0, all: 0 }];

  // Dates are formatted HERE, on the server, and sent down as strings. Doing it
  // in the client component would run toLocaleString in the phone's timezone
  // and produce different text from the server's — a hydration mismatch.
  const rows: EnquiryView[] = stored.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    shootType: r.shoot_type,
    budget: r.budget,
    message: r.message,
    notified: r.notified,
    status: r.status,
    createdLabel: fmt(r.created_at),
    dateLabel: r.flexible
      ? "Flexible"
      : r.preferred_date
        ? new Date(r.preferred_date).toLocaleDateString("en-GB", { dateStyle: "medium" })
        : "No date given",
  }));

  return (
    <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <h1 className="text-3xl sm:text-4xl">Enquiries</h1>
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

      <EnquiryList rows={rows} counts={counts} initialTab={initialTab} initialQ={q} />
    </div>
  );
}
