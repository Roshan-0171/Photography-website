import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { categories } from "@/data/photos";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-8 sm:py-32">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">404</p>
      <h1 className="mt-6 max-w-2xl text-4xl sm:text-5xl">
        That page isn&rsquo;t here.
      </h1>
      <p className="mt-6 max-w-prose text-lg text-muted-fg">
        The link may be old, or I may have moved something. The galleries are
        all still where they were.
      </p>

      <nav aria-label="Galleries" className="mt-12 border-y border-line py-4">
        <ul className="flex flex-wrap gap-x-8 gap-y-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/work#${c.id}`}
                className="inline-flex min-h-11 items-center text-sm uppercase tracking-[0.12em] underline-offset-4 hover:underline"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12 flex flex-wrap items-center gap-6">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-2 bg-fg px-7 py-3.5 text-base text-bg transition-colors duration-200 hover:bg-secondary active:bg-secondary"
        >
          Back to the front page
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href="/contact"
          className="text-base text-muted-fg underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
        >
          Or send an enquiry
        </Link>
      </div>
    </div>
  );
}
