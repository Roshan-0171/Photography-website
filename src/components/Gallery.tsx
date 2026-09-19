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
 * Tiles are 4:5 and the same size, so every row lines up — one column of
 * their own on a phone, four on a desktop, decided by the gallery's width.
 * The image is centre-cropped (weighted a little toward the top, where a face
 * usually is) to fill the tile; the whole, uncropped frame is what the
 * lightbox shows. So the grid is a symmetric contact sheet, and the picture
 * itself is never cut — you just click through to see all of it.
 */
const SIZES = "(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw";

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
          className="grid grid-cols-2 gap-(--gap-tile) @min-[48rem]:grid-cols-3 @min-[64rem]:grid-cols-4"
        >
          {entries.map((entry) => (
            <li key={entry.id} className="reveal">
              <button
                type="button"
                data-tilt
                onClick={() => setOpenAt(entry.index)}
                className="group block w-full cursor-pointer text-left"
              >
                {/* Mat board around the print, then the fixed-ratio window the
                    photograph fills. The mat is padding, never a crop. */}
                <span className="print-frame block p-1 sm:p-2">
                  <span className="relative block aspect-[4/5] overflow-clip bg-muted">
                    <Picture photo={entry} sizes={SIZES} fill className="object-[50%_35%]" />
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
