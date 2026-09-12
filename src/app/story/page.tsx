import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Camera, Clock, Handshake } from "lucide-react";

import Picture from "@/components/Picture";
import Reveal from "@/components/Reveal";
import { selfPortrait } from "@/data/photos";
import { testimonials } from "@/data/testimonials";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Story",
  description: `How ${site.name} works, who he photographs, and what to expect from a session in Kathmandu.`,
};

const approach = [
  {
    icon: Clock,
    title: "Unhurried",
    body: "A portrait session runs two to three hours. Most of the pictures I keep come from the second hour, once the camera has stopped being the point.",
  },
  {
    icon: Camera,
    title: "Available light",
    body: "I shoot in the light you actually live in — a window, a courtyard, a doorway at five o'clock. Strobes only when a commission genuinely needs them.",
  },
  {
    icon: Handshake,
    title: "Nothing published without you",
    body: "You see a full edit before anything goes anywhere. Family and private sittings stay off this site and off social media unless you tell me otherwise.",
  },
];

export default function StoryPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-6 py-12 sm:px-8 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="min-w-0 lg:order-2">
          <Picture
            photo={selfPortrait}
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="bg-muted"
          />
        </div>

        <div className="min-w-0 lg:order-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">
            About
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl">
            I photograph people where they already are.
          </h1>

          <div className="mt-8 max-w-prose space-y-6 text-lg leading-relaxed text-secondary">
            <p>
              I&rsquo;m {site.name}, a portrait and editorial photographer based
              in {site.city}. I started in 2015 assisting on magazine shoots
              around Durbar Square, mostly carrying other people&rsquo;s bags,
              and I have been making my own pictures full time since 2018.
            </p>
            <p>
              The work divides roughly in three. Commissioned portraits —
              families, founders, musicians, anyone who needs one good picture
              of themselves. Editorial assignments for magazines and hospitality
              brands, usually people photographed at their trade. And personal
              work: the valley in monsoon, festival crowds, the ridge at dusk.
              That last category pays nothing and is the reason I do the rest.
            </p>
            <p>
              I work in English and Nepali. My studio is in{" "}
              {site.studio.split("—")[0].trim()}, but most sittings happen at
              home, at work, or somewhere that means something to the person in
              front of the camera.
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="approach-heading" className="pt-24">
        <Reveal as="h2" className="text-2xl sm:text-3xl">
          <span id="approach-heading">How I work</span>
        </Reveal>
        <ul className="mt-12 grid gap-12 md:grid-cols-3">
          {approach.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 70}>
              <item.icon className="size-6 text-fg" aria-hidden="true" />
              <h3 className="mt-6 text-lg">{item.title}</h3>
              <p className="mt-2 text-muted-fg">{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Appears only once there are real testimonials to show. The page reads
          correctly with none, so nothing invented has to stand in meanwhile. */}
      {testimonials.length > 0 && (
        <section
          aria-labelledby="said-heading"
          className="mt-24 border-t border-line pt-16"
        >
          <h2
            id="said-heading"
            className="text-xs uppercase tracking-[0.14em] text-muted-fg"
          >
            What people say
          </h2>
          <ul className="mt-8 grid gap-12 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.name} className="min-w-0">
                <blockquote className="text-lg leading-relaxed text-secondary">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="mt-4 text-sm text-fg">{t.name}</p>
                <p className="text-sm text-muted-fg">{t.context}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="clients-heading"
        className="mt-24 border-t border-line pt-16"
      >
        <h2
          id="clients-heading"
          className="text-xs uppercase tracking-[0.14em] text-muted-fg"
        >
          Commissioned by
        </h2>
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-secondary">
          {[
            "A national daily",
            "A Kathmandu hospitality group",
            "Two heritage-textile labels",
            "A travel quarterly",
            "An independent record label",
          ].map((client) => (
            <li key={client}>{client}</li>
          ))}
        </ul>
      </section>

      <div className="mt-16">
        <Link
          href="/contact"
          className="inline-flex cursor-pointer items-center gap-2 bg-fg px-7 py-3.5 text-base text-bg transition-colors duration-200 hover:bg-secondary active:bg-secondary"
        >
          Talk to me about a sitting
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
