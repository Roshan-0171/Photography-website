import type { Metadata } from "next";

import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import WorkFilter, { type FilterOption } from "@/components/WorkFilter";
import WorkHashRedirect from "@/components/WorkHashRedirect";
import { byCategory, categories, photos, type Category } from "@/data/photos";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Portrait, editorial, wedding and personal photography from across the Kathmandu Valley.",
};

const VALID_IDS = new Set<string>(categories.map((c) => c.id));
const isCategory = (v: unknown): v is Category =>
  typeof v === "string" && VALID_IDS.has(v);

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  const params = await searchParams;
  const raw = Array.isArray(params.type) ? params.type[0] : params.type;

  // An unrecognised value — a typo, an old value from a deleted category —
  // falls back to "all" rather than rendering nothing.
  const selected: "all" | Category = isCategory(raw) ? raw : "all";

  // Categories with no photos in them drop out of both the filter and the
  // page entirely, rather than the select offering a choice that renders empty.
  const nonEmpty = categories.filter((c) => byCategory(c.id).length > 0);
  const visible = selected === "all" ? nonEmpty : nonEmpty.filter((c) => c.id === selected);

  const options: FilterOption[] = [
    { value: "all", label: "All", count: photos.length },
    ...nonEmpty.map((c) => ({ value: c.id, label: c.label, count: byCategory(c.id).length })),
  ];

  // Generated from the data, so it cannot go stale the way "grouped three
  // ways" did the moment a fourth category was added.
  const intro =
    selected === "all"
      ? `${photos.length} pictures, across ${nonEmpty.length} categories. Every frame is shown whole — nothing here is cropped to fit a grid.`
      : `${byCategory(selected).length} pictures. Every frame is shown whole — nothing here is cropped to fit a grid.`;

  return (
    <div className="mx-auto max-w-[90rem] px-6 py-12 sm:px-8 sm:py-16">
      {/* Fragment-only safety net for old /work#portrait links — see the
          component for why this can't be done server-side. */}
      <WorkHashRedirect />

      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Work</h1>
        <p className="mt-6 text-lg text-muted-fg">{intro}</p>
      </header>

      {/* Real links to every filtered view, for crawlers. Hidden from sighted
          users and screen readers alike (aria-hidden + sr-only) because the
          select below is the actual control for both — this exists only so
          each ?type= URL has an <a href> pointing at it somewhere in the page,
          the same way a search engine would otherwise have no way to discover
          a filter that lives behind a select's onChange. */}
      <nav aria-hidden="true" className="sr-only">
        <a href="/work">All — {photos.length} pictures</a>
        {nonEmpty.map((c) => (
          <a key={c.id} href={`/work?type=${c.id}`}>
            {c.label} — {byCategory(c.id).length} pictures
          </a>
        ))}
      </nav>

      <div className="mt-12">
        <WorkFilter options={options} selected={selected} />
      </div>

      {visible.map((c) => (
        <section
          key={c.id}
          id={c.id}
          aria-labelledby={`${c.id}-heading`}
          className="scroll-mt-28 pt-16"
        >
          <Reveal as="header" className="max-w-2xl pb-8">
            <h2 id={`${c.id}-heading`} className="text-2xl sm:text-3xl">
              {c.label}
            </h2>
            <p className="mt-2 text-muted-fg">{c.blurb}</p>
          </Reveal>

          <Gallery photos={byCategory(c.id)} label={`${c.label} gallery`} />
        </section>
      ))}
    </div>
  );
}
