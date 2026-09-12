import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Gallery from "@/components/Gallery";
import Picture from "@/components/Picture";
import Reveal from "@/components/Reveal";
import { curated, curatedLandscape, curatedPortrait, hero } from "@/data/photos";

export default function HomePage() {
  return (
    <>
      {/* Full-bleed hero. The LCP element — priority, no lazy load, no
          animation to wait on. */}
      <div className="relative h-[clamp(22rem,66vh,48rem)] w-full overflow-hidden bg-muted">
        <Picture photo={hero} fill priority sizes="100vw" />
      </div>

      {/* Curated selection — eighteen pieces, split by orientation into two ratio-pure grids. */}
      <section
        aria-labelledby="selected-heading"
        className="mx-auto max-w-[90rem] px-6 pb-16 pt-16 sm:px-8"
      >
        <Reveal as="div" className="flex flex-wrap items-baseline justify-between gap-6 pb-8">
          <h2 id="selected-heading" className="text-2xl sm:text-3xl">
            Selected work
          </h2>
          <Link
            href="/work"
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-fg underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
          >
            See all galleries
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>

        {/* Two ratio-pure groups, not one mixed grid: every photograph here was
            sourced at one of exactly two fixed ratios, so a group that is
            internally one orientation renders as a true aligned grid — same
            box size, rows synced — with nothing cropped or padded to force it.
            Mixing orientations in one masonry pass is what produced the drift
            this replaces. */}
        <div className="space-y-12 sm:space-y-16">
          <Gallery photos={curatedPortrait} navigationPhotos={curated} label="Selected work, portrait-shaped" />
          <Gallery photos={curatedLandscape} navigationPhotos={curated} label="Selected work, landscape-shaped" />
        </div>
      </section>
    </>
  );
}
