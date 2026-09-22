import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";

import Gallery from "@/components/Gallery";
import Picture from "@/components/Picture";
import Reveal from "@/components/Reveal";
import { curated, hero, selfPortrait } from "@/data/photos";
import { testimonials } from "@/data/testimonials";

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
            Photography &amp; Films that tell your story.
          </p>
          <h1
            className="hero-in mt-3 font-display text-display-hero text-white"
            style={stagger(1)}
          >
            ROH PORTRAITS
          </h1>
          <p className="hero-in mt-4 max-w-xl text-lead text-white/90" style={stagger(2)}>
            Weddings &bull; Events &bull; Portraits &bull; Cultural Celebrations
          </p>
          <p className="hero-in mt-2 text-sm uppercase tracking-[0.14em] text-white/85" style={stagger(3)}>
            Dallas–Fort Worth, Texas | Available Nationwide
          </p>
          <Link
            href="/contact"
            className="hero-in mt-8 inline-flex min-h-11 cursor-pointer items-center gap-2 bg-white px-7 py-3.5 text-base text-black transition-colors duration-200 hover:bg-white/85"
            style={stagger(4)}
          >
            Book a shoot
          </Link>
        </div>
      </div>

      <section aria-labelledby="intro-heading" className="wrap py-20 sm:py-28">
        <Reveal as="div" className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">The galleries</p>
          <h2 id="intro-heading" className="mt-5 text-display-2">
            Stories made of real moments.
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-secondary">
            I&rsquo;m Roh, a Texas-based photographer and filmmaker specializing in
            weddings, portraits, cultural celebrations and events. I focus on
            authentic moments, beautiful details and the emotions that make each
            story yours.
          </p>
        </Reveal>
      </section>

      <section aria-labelledby="featured-heading" className="w-full pb-20 sm:pb-28">
        <Reveal as="div" className="wrap flex flex-wrap items-baseline justify-between gap-6 pb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">Featured galleries</p>
            <h2 id="featured-heading" className="mt-3 text-display-2">
              The moments between the planned ones.
            </h2>
          </div>
          <Link
            href="/galleries"
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-fg underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
          >
            See all galleries
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>

        <div className="wrap">
          <Gallery photos={curated} label="Featured work" layout="grid" />
        </div>
      </section>

      <section aria-labelledby="approach-heading" className="border-y border-line bg-muted">
        <div className="wrap grid gap-10 py-20 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:py-28">
          <Reveal as="div">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">Why Roh Portraits</p>
            <h2 id="approach-heading" className="mt-4 text-display-2">The feeling comes first.</h2>
          </Reveal>
          <Reveal as="div" className="max-w-2xl text-lg leading-relaxed text-secondary">
            <p>
              My approach is simple: I want my photographs to feel real. I want
              you to look back at them years from now and remember not only how
              the moment looked, but how it felt.
            </p>
            <p className="mt-6">
              I&rsquo;m there for the laughter, the excitement, the quiet moments,
              and everything in between. The camera should make space for your
              story, not interrupt it.
            </p>
          </Reveal>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section aria-labelledby="testimonials-heading" className="wrap py-20 sm:py-28">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">Client testimonials</p>
          <h2 id="testimonials-heading" className="mt-4 text-display-2">Kind words from the people I&rsquo;ve photographed.</h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <li key={testimonial.name}>
                <blockquote className="text-lg leading-relaxed text-secondary">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <p className="mt-5 text-sm text-fg">{testimonial.name}</p>
                <p className="text-sm text-muted-fg">{testimonial.context}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selfPortrait && (
        <section aria-labelledby="about-heading" className="wrap grid gap-10 py-20 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:py-28">
          <div className="relative aspect-[4/5] overflow-clip bg-muted">
            <Picture photo={selfPortrait} fill sizes="(min-width: 640px) 50vw, 100vw" />
          </div>
          <Reveal as="div" className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">About Roh</p>
            <h2 id="about-heading" className="mt-4 text-display-2">A way to tell stories.</h2>
            <p className="mt-6 text-lg leading-relaxed text-secondary">
              Photography started as a way for me to capture moments, but over
              time, it became something much more meaningful — a way to tell
              stories. I&rsquo;m drawn to genuine emotions, natural moments,
              beautiful details, and the energy that makes every person and
              celebration unique.
            </p>
            <Link href="/story" className="mt-7 inline-flex items-center gap-2 text-sm text-fg underline-offset-4 hover:underline">
              Read my story
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </section>
      )}

      <section aria-labelledby="contact-heading" className="border-y border-line bg-fg text-bg">
        <div className="wrap flex flex-col items-start justify-between gap-8 py-20 sm:flex-row sm:items-end sm:py-28">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-bg/65">Let&rsquo;s create something</p>
            <h2 id="contact-heading" className="mt-4 max-w-2xl text-display-2">Your moments, your story, your memories.</h2>
          </div>
          <Link href="/contact" className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-bg px-7 py-3.5 text-base text-fg transition-colors hover:bg-bg/85">
            Book a shoot
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

    </>
  );
}
