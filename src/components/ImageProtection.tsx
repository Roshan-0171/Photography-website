"use client";

import { useEffect } from "react";

/**
 * Site-wide right-click deterrent for photographs.
 *
 * One delegated listener, mounted once in the root layout, rather than an
 * onContextMenu prop on every <img> — Picture is a server component (it is
 * rendered from server components all over the site), and a function prop
 * cannot cross that boundary. A single listener here reaches every image
 * without turning Picture itself into a client component.
 *
 * Only <img> elements are affected — the rest of the site (text, buttons, the
 * admin table) keeps its normal context menu.
 */
export default function ImageProtection() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) e.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);

  return null;
}
