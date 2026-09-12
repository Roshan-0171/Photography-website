"use client";

import { useState } from "react";

import type { Photo } from "@/data/photos";
import { balanceColumns } from "@/lib/balance-columns";
import Lightbox from "./Lightbox";
import PhotoMeta from "./PhotoMeta";
import Picture from "./Picture";
import PrefetchNearby from "./PrefetchNearby";
import Tilt from "./Tilt";

type Props = {
  photos: Photo[];
  /** Column count at the widest breakpoint. */
  columns?: 2 | 3;
  label: string;
};

/** A photograph plus its position in the original list, so the lightbox order
 *  stays the same no matter which column a tile ends up in. */
type Entry = Photo & { index: number };

/**
 * One layout per breakpoint.
 *
 * Balanced columns cannot be expressed in CSS alone — the assignment depends on
 * how many columns there are, and CSS cannot restructure the DOM. So each
 * breakpoint gets its own pre-computed arrangement and exactly one is displayed.
 *
 * The hidden ones cost markup but no bandwidth: every tile is `loading="lazy"`,
 * and a lazy image inside a `display: none` subtree is never fetched.
 */
const LAYOUTS: Record<2 | 3, { cols: number; visibility: string }[]> = {
  3: [
    { cols: 1, visibility: "sm:hidden" },
    { cols: 2, visibility: "hidden sm:flex lg:hidden" },
    { cols: 3, visibility: "hidden lg:flex" },
  ],
  2: [
    { cols: 1, visibility: "sm:hidden" },
    { cols: 2, visibility: "hidden sm:flex" },
  ],
};

const COLUMN_SIZES: Record<number, string> = {
  1: "100vw",
  2: "50vw",
  3: "33vw",
};

export default function Gallery({ photos, columns = 3, label }: Props) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const entries: Entry[] = photos.map((photo, index) => ({ ...photo, index }));

  // At most one featured photograph, by construction: `find` stops at the first.
  // With none flagged the page is simply a balanced grid, which is the normal case.
  const featured = entries.find((e) => e.featured);
  const rest = featured ? entries.filter((e) => e !== featured) : entries;

  const tile = (entry: Entry, sizes: string, variant: "column" | "contain" = "column") => (
    <button
      type="button"
      data-tilt
      onClick={() => setOpenAt(entry.index)}
      className="group block w-full cursor-zoom-in text-left"
    >
      {/* Mat board around the print. Padding, never a crop — the photograph
          keeps its own aspect ratio inside the frame. */}
      <span className="print-frame block p-2.5 sm:p-3">
        <span className={`block ${variant === "contain" ? "" : "bg-muted"}`}>
          <Picture photo={entry} sizes={sizes} variant={variant} />
        </span>
      </span>
      <PhotoMeta photo={entry} className="mt-3" />
      <span className="sr-only">View larger</span>
    </button>
  );

  return (
    <>
      {/* The featured frame, when one is flagged. It breaks the column rhythm by
          running the full content width — but its height is capped, because a
          4:5 photograph at 1376px wide is 1720px tall and would swallow the page.
          Nothing is cropped: a portrait-orientation feature simply centres
          within the band rather than filling it edge to edge. */}
      {featured && (
        <div className="mb-6 sm:mb-8">
          {tile(featured, "(min-width: 1024px) 90vw, 100vw", "contain")}
        </div>
      )}

      <Tilt>
      {LAYOUTS[columns].map(({ cols, visibility }) => (
        <div key={cols} className={`gap-6 sm:gap-8 ${visibility} ${cols === 1 ? "block" : "flex"}`}>
          {balanceColumns(rest, cols).map((column, i) => (
            <ul
              key={i}
              aria-label={cols === 1 ? label : `${label}, column ${i + 1} of ${cols}`}
              className="flex min-w-0 flex-1 flex-col gap-6 sm:gap-8"
            >
              {column.map((entry) => (
                <li key={entry.id}>{tile(entry, COLUMN_SIZES[cols])}</li>
              ))}
            </ul>
          ))}
        </div>
      ))}
      </Tilt>

      <PrefetchNearby />

      {openAt !== null && (
        <Lightbox
          photos={photos}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
