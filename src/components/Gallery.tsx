"use client";

import { useEffect, useState } from "react";

import type { Photo } from "@/data/photos";
import { balanceColumns } from "@/lib/balance-columns";
import Lightbox from "./Lightbox";
import PhotoMeta from "./PhotoMeta";
import Picture from "./Picture";
import PrefetchNearby from "./PrefetchNearby";
import Tilt from "./Tilt";

type Props = {
  photos: Photo[];
  label: string;
  /**
   * The full sequence the lightbox should step through, when it is bigger
   * than what this Gallery instance renders as tiles. Defaults to `photos`.
   *
   * The home page shows one logical set of curated photographs as two visual
   * grids — portrait-shaped and landscape-shaped, kept ratio-pure so their
   * rows align. Without this, each grid's Lightbox only ever knew about its
   * own half: opening a photo showed "1 of 9" and arrow keys wrapped after 9,
   * silently never reaching the other group. Passing the combined list here
   * makes arrow-key navigation walk the whole set in order, regardless of
   * which visual grid a photograph was opened from.
   *
   * /work's per-category galleries deliberately do NOT pass this — there,
   * each category is its own independent browsing context, and that
   * separation is correct, not a bug.
   */
  navigationPhotos?: Photo[];
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
const LAYOUTS = [
  { cols: 1, visibility: "sm:hidden" },
  { cols: 2, visibility: "hidden sm:flex lg:hidden" },
  { cols: 3, visibility: "hidden lg:flex" },
];

const COLUMN_SIZES: Record<number, string> = {
  1: "100vw",
  2: "50vw",
  3: "33vw",
};

export default function Gallery({ photos, label, navigationPhotos }: Props) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const navList = navigationPhotos ?? photos;

  /**
   * A shared link lands with #photo-<id>: open straight to that photograph.
   * Only the gallery that actually holds it responds.
   *
   * Also bound to hashchange, because a link to a photograph in the page you
   * are already on is a same-document navigation — nothing remounts, so the
   * mount pass alone would silently do nothing.
   */
  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.replace("#photo-", "");
      if (!id) return;
      // Only the Gallery whose own tiles actually include this photo should
      // react — otherwise, when navList is shared across two instances, both
      // would independently open a Lightbox for the same hash.
      if (!photos.some((p) => p.id === id)) return;
      const at = navList.findIndex((p) => p.id === id);
      // Read after hydration, never during render: deriving it during render
      // would make the client's first paint differ from the server's.
      if (at !== -1) setOpenAt(at);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [photos, navList]);

  // Each tile's index is its position in navList (the full navigable set),
  // not its position in `photos` (what this instance happens to render) —
  // otherwise every grid's tiles would number 0..N-1 independently and the
  // Lightbox would open on the wrong photo whenever the two disagree.
  const entries: Entry[] = photos.map((photo) => ({
    ...photo,
    index: navList.findIndex((p) => p.id === photo.id),
  }));

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
      {LAYOUTS.map(({ cols, visibility }) => (
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
          photos={navList}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
