import type { Metadata } from "next";

import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import TypeIndex from "@/components/TypeIndex";
import { byCategory, categories, photos } from "@/data/photos";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Portrait, editorial and personal photography from across the Kathmandu Valley.",
};

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-6 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Work</h1>
        <p className="mt-6 text-lg text-muted-fg">
          {photos.length} pictures, grouped three ways. Every frame is shown
          whole — nothing here is cropped to fit a grid.
        </p>
      </header>

      <div className="mt-12">
        <TypeIndex base="" />
      </div>

      {categories.map((c) => (
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

          <Gallery
            photos={byCategory(c.id)}
            label={`${c.label} gallery`}
          />
        </section>
      ))}
    </div>
  );
}
