import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Camera, Clock, Handshake } from "lucide-react";

import Picture from "@/components/Picture";
import Reveal from "@/components/Reveal";
import { selfPortrait } from "@/data/photos";
import { testimonials } from "@/data/testimonials";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Story",
  description: `How ${site.name} works, who he photographs and films, and what to expect from a session.`,
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
    <div className="wrap py-12 sm:py-16">
      <div
        className={
          selfPortrait
            ? "grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16"
            : "grid gap-12"
        }
      >
        {selfPortrait && (
          <div className="min-w-0 lg:order-2">
            <Picture
              photo={selfPortrait}
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="bg-muted"
            />
          </div>
        )}

        <div className="min-w-0 lg:order-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">
            About
          </p>
          <h1 className="mt-6 text-display-1">
            I photograph people where they already are.
          </h1>

          <div className="mt-8 max-w-prose space-y-6 text-lg leading-relaxed text-secondary">
            <p>
              I&rsquo;m Rohit Shrestha, and {site.name} is the name I work
              under. Wedding and event photography and video, based in{" "}
              {site.city}, and happy to travel for it.
            </p>
            <p>
              Most of what I shoot is the wedding day and everything around
              it: the vows, the reception, the families who flew in for it, the
              groom pulling up in style. A good deal of it is Nepali weddings
              and celebrations, where everyone turns up dressed in culture and
              the family portrait is the one that matters most. I also cover
              the days on either side of the ceremony, and the events that
              follow &mdash; engagements, receptions, birthdays, anniversaries,
              the milestones a family wants on record.
            </p>
            <p>
              I film as well as photograph, so a day can come back as stills, a
              short film, or both. The ceremony in full, the speeches, the parts
              people miss while they&rsquo;re busy living them.
            </p>
            <p>
              Alongside the events: family and individual portraits, usually at
              home, at work, or somewhere that means something to the person in
              front of the camera. And personal work from wherever I&rsquo;ve
              travelled, most recently the coastline at Big Sur. That last
              category pays nothing and is the reason I do the rest.
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="approach-heading" className="pt-24">
        <Reveal as="h2" className="text-display-3">
          <span id="approach-heading">How I work</span>
        </Reveal>
        <ul className="mt-12 grid gap-12 md:grid-cols-3">
          {approach.map((item) => (
            <Reveal as="li" key={item.title}>
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

      <div className="mt-24 border-t border-line pt-16">
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-1 text-sm text-fg underline-offset-4 hover:underline"
        >
          More on Instagram, @roh_portraits
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>

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
