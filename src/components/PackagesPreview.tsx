import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { packages } from "@/data/packages";

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * The compact version of /services' package cards, for the home page — full
 * price, top three inclusions, a link through to the complete card. Reads the
 * same src/data/packages.ts as /services, so nothing here can quote a price
 * or an inclusion that the full page has since changed.
 */
export default function PackagesPreview() {
  return (
    <section aria-labelledby="packages-heading" className="border-t border-line pt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <h2 id="packages-heading" className="text-2xl sm:text-3xl">
          Packages
        </h2>
        <Link
          href="/services"
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-fg underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
        >
          Full details and the small print
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            className={`relative flex min-w-0 flex-col border p-6 sm:p-8 ${
              pkg.featured ? "border-fg" : "border-line"
            }`}
          >
            {pkg.featured && (
              <span className="absolute -top-3 left-6 bg-fg px-3 py-1 text-xs uppercase tracking-[0.12em] text-bg">
                Most booked
              </span>
            )}
            <h3 className="text-xl">{pkg.name}</h3>
            <p className="mt-4">
              <span className="font-display text-2xl tracking-tight">{pkg.price}</span>{" "}
              <span className="text-sm text-muted-fg">/ {pkg.unit}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-fg">
              {pkg.includes.slice(0, 3).map((line) => (
                <li key={line} className="flex min-w-0 items-start gap-2">
                  <Check className="mt-1 size-4 shrink-0 text-fg" aria-hidden="true" />
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/services#${slug(pkg.name)}`}
              className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm underline-offset-4 hover:underline"
            >
              See full package
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-fg">
        Weddings and commercial projects are quoted individually — see the{" "}
        <Link href="/work?type=wedding" className="underline underline-offset-4 hover:text-fg">
          wedding gallery
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="underline underline-offset-4 hover:text-fg">
          start an enquiry
        </Link>
        .
      </p>
    </section>
  );
}
