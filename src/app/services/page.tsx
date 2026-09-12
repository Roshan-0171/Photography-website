import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";

import Reveal from "@/components/Reveal";
import { faq } from "@/data/faq";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Portrait, family and editorial photography packages in Kathmandu, with prices listed in full.",
};

const packages = [
  {
    name: "Portrait sitting",
    price: "NPR 18,000",
    unit: "one person",
    summary:
      "For one person who needs a picture that actually looks like them — a profile, a book jacket, a birthday, no reason at all.",
    includes: [
      "2–3 hours, one location of your choosing",
      "Pre-shoot call to talk through wardrobe and light",
      "A gallery of 40–60 frames within 10 days",
      "12 finished images, retouched and colour-graded",
      "Full-resolution files plus web-sized versions",
      "Personal print licence, unlimited",
    ],
  },
  {
    name: "Family & group",
    price: "NPR 32,000",
    unit: "up to 8 people",
    summary:
      "Two or more people in one frame, at home or somewhere that matters to you. Children, grandparents and reluctant teenagers all welcome.",
    includes: [
      "3 hours, up to two locations in the valley",
      "Everything in the portrait sitting",
      "25 finished images, retouched and colour-graded",
      "Individual portraits of each person included",
      "One 12×16in archival print of your chosen frame",
      "Additional people: NPR 2,500 each",
    ],
    featured: true,
  },
  {
    name: "Editorial & commercial",
    price: "NPR 55,000",
    unit: "per shoot day",
    summary:
      "Commissioned work for magazines, hospitality and brands. Half-day assignments are NPR 32,000; multi-day rates are lower per day.",
    includes: [
      "Full shoot day, up to 9 hours on location",
      "Concept call and shot list agreed in advance",
      "Assistant and lighting kit when the brief needs them",
      "Selects delivered within 48 hours, full edit in 7 days",
      "30+ finished images, retouched to spec",
      "12-month commercial licence (extensions quoted)",
    ],
  },
];

const notes = [
  ["Travel", "Free inside Ring Road. NPR 4,000 elsewhere in the valley; outside the valley quoted with transport and lodging at cost."],
  ["Booking", "A 30% deposit holds the date. It moves once, free, if either of us needs to reschedule."],
  ["Turnaround", "Standard is listed per package. A 72-hour rush is available at +40% when the calendar allows."],
  ["Prints", "Archival prints from NPR 3,500 (8×10in) to NPR 14,000 (20×30in), printed in Lalitpur and inspected by hand."],
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-6 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Services</h1>
        <p className="mt-6 text-lg text-muted-fg">
          Every price is on this page. If a shoot doesn&rsquo;t fit one of these
          three shapes, tell me what you need and I&rsquo;ll quote it plainly —
          there is no hidden tier.
        </p>
      </header>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {packages.map((pkg, i) => (
          <Reveal
            as="section"
            key={pkg.name}
            delay={i * 70}
            className={`flex min-w-0 flex-col border p-6 sm:p-8 ${
              pkg.featured ? "border-fg" : "border-line"
            }`}
          >
            <h2 className="text-xl">{pkg.name}</h2>
            <p className="mt-6">
              <span className="font-display text-3xl tracking-tight">
                {pkg.price}
              </span>{" "}
              <span className="text-sm text-muted-fg">/ {pkg.unit}</span>
            </p>
            <p className="mt-6 text-muted-fg">{pkg.summary}</p>

            <h3 className="mt-8 text-xs uppercase tracking-[0.14em] text-muted-fg">
              What&rsquo;s included
            </h3>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {pkg.includes.map((line) => (
                <li key={line} className="flex min-w-0 items-start gap-2">
                  <Check
                    className="mt-1 size-4 shrink-0 text-fg"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/contact?package=${encodeURIComponent(pkg.name)}`}
              className={`mt-8 inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 px-6 py-3 text-center text-sm text-balance transition-colors duration-200 ${
                pkg.featured
                  ? "bg-fg text-bg hover:bg-secondary active:bg-secondary"
                  : "border border-fg text-fg hover:bg-fg hover:text-bg active:bg-fg active:text-bg"
              }`}
            >
              Enquire about {pkg.name.toLowerCase()}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        ))}
      </div>

      <section
        aria-labelledby="faq-heading"
        className="mt-24 border-t border-line pt-16"
      >
        <h2 id="faq-heading" className="text-2xl sm:text-3xl">
          Questions people ask
        </h2>
        {/* Plain markup rather than an accordion: every answer is short, and a
            question worth answering is not worth hiding behind a click. */}
        <dl className="mt-12 grid gap-8 md:grid-cols-2 md:gap-x-16">
          {faq.map((item) => (
            <div key={item.q} className="min-w-0">
              <dt className="text-base font-medium text-fg">{item.q}</dt>
              <dd className="mt-2 max-w-prose text-muted-fg">{item.a}</dd>
            </div>
          ))}
        </dl>
        <script
          type="application/ld+json"
          // Static, author-written content — no user input reaches this string.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            }),
          }}
        />
      </section>

      <section
        aria-labelledby="notes-heading"
        className="mt-24 border-t border-line pt-16"
      >
        <h2 id="notes-heading" className="text-2xl sm:text-3xl">
          The small print, in full
        </h2>
        <dl className="mt-12 grid gap-8 sm:grid-cols-2">
          {notes.map(([term, detail]) => (
            <div key={term}>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted-fg">
                {term}
              </dt>
              <dd className="mt-2 max-w-prose">{detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-12 text-sm text-muted-fg">
          Prices include VAT. Quoted in Nepali rupees; international clients are
          invoiced in USD at the day&rsquo;s rate.
        </p>
      </section>
    </div>
  );
}
