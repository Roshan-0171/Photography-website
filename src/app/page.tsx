import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Gallery from "@/components/Gallery";
import Picture from "@/components/Picture";
import Reveal from "@/components/Reveal";
import { curated, hero } from "@/data/photos";

export default function HomePage() {
  return (
    <>
      {/* Full-bleed hero. The LCP element — priority, no lazy load, no
          animation to wait on. */}
      <div className="relative h-[clamp(22rem,66vh,48rem)] w-full overflow-hidden bg-muted">
        <Picture photo={hero} fill priority sizes="100vw" />
      </div>

      {/* Curated selection — twelve pieces, three per category. */}
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

        <Gallery photos={curated} label="Selected work" />
      </section>
    </>
  );
}
