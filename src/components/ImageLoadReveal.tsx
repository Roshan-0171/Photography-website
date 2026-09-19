"use client";

import { useEffect } from "react";

/**
 * Marks each photograph as it finishes loading, so the stylesheet can sharpen
 * it in from a blur rather than snapping it onto the page.
 *
 * One capture-phase listener on the document rather than an onLoad per image:
 * `load` does not bubble, but it does pass through the capture phase, and
 * Picture is a server component that cannot hold a handler of its own anyway.
 *
 * Order matters here. Anything already decoded before this effect runs — a
 * cached image, or one that beat hydration — is marked first, and only then
 * is <html> flagged to switch the pre-load blur on. Doing it the other way
 * round would blur a finished picture for a frame.
 */
export default function ImageLoadReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const mark = (img: HTMLImageElement) => {
      img.dataset.loaded = "";
    };

    for (const img of document.querySelectorAll<HTMLImageElement>("img.photo-img")) {
      if (img.complete) mark(img);
    }
    root.dataset.imgReveal = "";

    const onLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement) mark(e.target);
    };
    document.addEventListener("load", onLoad, true);
    return () => {
      document.removeEventListener("load", onLoad, true);
      delete root.dataset.imgReveal;
    };
  }, []);

  return null;
}
