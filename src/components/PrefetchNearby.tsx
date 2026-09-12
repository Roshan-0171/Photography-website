"use client";

import { useEffect } from "react";

/**
 * Starts loading lazy images slightly before they scroll into view.
 *
 * Native `loading="lazy"` already applies a viewport margin, but it is the
 * browser's choice and not tunable. This widens it deliberately, so a photograph
 * is decoded by the time it arrives rather than fading in under the reader.
 *
 * Purely additive: every image still carries `loading="lazy"` in the HTML, so
 * with no JavaScript the browser's own behaviour applies unchanged.
 */
export default function PrefetchNearby({ rootMargin = "600px" }: { rootMargin?: string }) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]'),
    );
    if (images.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Zero-area targets are the hidden breakpoint layouts; leave them alone.
          if (!entry.isIntersecting || entry.boundingClientRect.width === 0) continue;
          const img = entry.target as HTMLImageElement;
          // Flipping to eager makes the browser begin the fetch immediately.
          img.loading = "eager";
          io.unobserve(img);
        }
      },
      { rootMargin },
    );

    for (const img of images) {
      if (!img.complete) io.observe(img);
    }
    return () => io.disconnect();
  }, [rootMargin]);

  return null;
}
