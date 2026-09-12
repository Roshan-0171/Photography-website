import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Gallery from "@/components/Gallery";
import PreviewIndex from "@/components/PreviewIndex";
import TypeIndex from "@/components/TypeIndex";
import Reveal from "@/components/Reveal";
import { curated, hero } from "@/data/photos";
import { site } from "@/data/site";

export default function HomePage() {
  /** The first three of the curated set become the featured index rows. */
  const featuredRows = curated
    .slice(0, 3)
    .map((photo) => ({ photo, index: curated.indexOf(photo) }));

  return (
    <>
      {/* Preview panel + featured index. The panel holds the LCP image and is
          taken over by whichever index row is hovered or focused. */}
      <PreviewIndex
        hero={hero}
        all={curated}
        rows={featuredRows}
        label="Featured work"
      >
        <div className="mx-auto max-w-[90rem] px-6 py-12 sm:px-8 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">
              {site.role} · {site.city}
            </p>
            <h1 className="mt-6 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-fg">
              Ten years photographing people across the Kathmandu Valley — for
              magazines, for brands, and for families who wanted one honest
              picture of themselves.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Link
                href="/contact"
                className="inline-flex cursor-pointer items-center gap-2 bg-fg px-7 py-3.5 text-base text-bg transition-colors duration-200 hover:bg-secondary active:bg-secondary"
              >
                Book a shoot
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="text-base text-muted-fg underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
              >
                Packages from NPR 18,000
              </Link>
            </div>
          </div>
        </div>
      </PreviewIndex>

      <div className="mx-auto mt-16 max-w-[90rem] px-6 sm:px-8">
        <TypeIndex />
      </div>

      {/* Curated selection — six pieces, mixed across categories. */}
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

      {/* Single closing CTA. One primary action per page. */}
      <section className="border-y border-line bg-muted/50">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-8 px-6 py-16 sm:px-8">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl">Planning a shoot?</h2>
            <p className="mt-2 text-muted-fg">
              Tell me who it&rsquo;s for and roughly when. I reply to every
              enquiry within two working days, and I&rsquo;ll say plainly if
              I&rsquo;m not the right photographer for it.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex cursor-pointer items-center gap-2 bg-fg px-7 py-3.5 text-base text-bg transition-colors duration-200 hover:bg-secondary active:bg-secondary"
          >
            Start an enquiry
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
