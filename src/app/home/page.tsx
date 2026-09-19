import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";

import Gallery from "@/components/Gallery";
import Picture from "@/components/Picture";
import Reveal from "@/components/Reveal";
import { site } from "@/data/site";
import { curated, hero } from "@/data/photos";

/** Stagger index for the hero copy's entrance — read by .hero-in in CSS. */
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export default function HomePage() {
  return (
    <>
      {/* Full-bleed hero. The LCP element — priority, no lazy load, no
          animation to wait on. A dark gradient sits over the lower half only,
          so the text reads clearly without flattening the whole photograph.

          overflow-clip, not overflow-hidden: `hidden` makes this box a scroll
          container, and the image's view() parallax timeline would then track
          its position inside this box (where it never moves) instead of the
          page. `clip` clips identically without becoming a scroller. */}
      <div className="relative flex h-[clamp(20rem,58vh,34rem)] w-full items-end overflow-clip bg-muted">
        <Picture photo={hero} fill priority sizes="100vw" className="hero-parallax" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
        />
        <div className="hero-copy wrap relative z-10 pb-12 sm:pb-16">
          <p
            className="hero-in text-xs uppercase tracking-[0.2em] text-white/85 sm:text-sm"
            style={stagger(0)}
          >
            {site.role} · {site.location}
          </p>
          <h1
            className="hero-in mt-3 font-display text-display-hero text-white"
            style={stagger(1)}
          >
            {site.name}
          </h1>
          <p className="hero-in mt-4 max-w-xl text-lead text-white/90" style={stagger(2)}>
            {site.tagline}
          </p>
          <Link
            href="/contact"
            className="hero-in mt-8 inline-flex min-h-11 cursor-pointer items-center gap-2 bg-white px-7 py-3.5 text-base text-black transition-colors duration-200 hover:bg-white/85"
            style={stagger(3)}
          >
            Book a shoot
          </Link>
        </div>
      </div>

      {/* Curated selection, in the order set by `home` in photo-text.json. */}
      <section aria-labelledby="selected-heading" className="wrap py-12">
        <Reveal as="div" className="flex flex-wrap items-baseline justify-between gap-6 pb-6">
          <h2 id="selected-heading" className="text-display-3">
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
