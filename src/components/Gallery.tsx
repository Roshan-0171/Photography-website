"use client";

import { useEffect, useState } from "react";

import type { Photo } from "@/data/photos";
import Lightbox from "./Lightbox";
import Picture from "./Picture";
import PrefetchNearby from "./PrefetchNearby";
import Tilt from "./Tilt";

type Props = {
  photos: Photo[];
  label: string;
  layout?: "masonry" | "grid";
  /**
   * The full sequence the lightbox should step through, when it is bigger
   * than what this Gallery instance renders as tiles. Defaults to `photos`.
   * /work's per-category galleries deliberately do NOT pass this — each
   * category is its own browsing context.
   */
  navigationPhotos?: Photo[];
};

/** A photograph plus its position in the navigable list, so the lightbox
 *  opens on the right frame no matter which tile was clicked. */
type Entry = Photo & { index: number };

/**
 * Each frame keeps its own intrinsic ratio in the contact sheet. Equal grid
 * columns, shared gaps, and a mat around every print keep mixed orientations
 * tidy without cropping the photographs.
 */
const SIZES = "(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw";

export default function Gallery({ photos, label, navigationPhotos, layout = "masonry" }: Props) {
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
  // not its position in `photos` — otherwise the Lightbox would open on the
  // wrong photo whenever the two lists disagree.
  const entries: Entry[] = photos.map((photo) => ({
    ...photo,
    index: navList.findIndex((p) => p.id === photo.id),
  }));

  return (
    <>
      <Tilt className="@container">
        <ul
          aria-label={label}
          className={
            layout === "grid"
              ? "grid grid-cols-2 gap-(--gap-tile) @min-[48rem]:grid-cols-3 @min-[64rem]:grid-cols-4"
              : "columns-2 @min-[48rem]:columns-3 @min-[64rem]:columns-4"
          }
          style={layout === "masonry" ? { columnGap: "var(--gap-tile)" } : undefined}
        >
          {entries.map((entry) => (
            <li
              key={entry.id}
              className={
                layout === "grid"
                  ? "reveal min-w-0"
                  : "reveal mb-(--gap-tile) w-full break-inside-avoid"
              }
            >
              <button
                type="button"
                data-tilt
                onClick={() => setOpenAt(entry.index)}
                className="group block w-full cursor-pointer text-left"
              >
                {/* Reserve the photograph's real shape before it loads, so a
                    landscape frame never flashes or renders as a portrait. */}
                <span className="print-frame block p-1 sm:p-2">
                  <span
                    className={
                      layout === "grid"
                        ? "relative block aspect-[4/5] overflow-clip bg-muted"
                        : "relative block overflow-clip bg-muted"
                    }
                    style={layout === "masonry" ? { aspectRatio: entry.aspectRatio } : undefined}
                  >
                    <Picture
                      photo={entry}
                      sizes={SIZES}
                      fill={layout === "grid"}
                      className={layout === "grid" ? "object-contain" : undefined}
                    />
                  </span>
                </span>
                <span className="sr-only">View larger</span>
              </button>
            </li>
          ))}
        </ul>
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
