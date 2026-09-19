"use client";

import { useEffect, useRef } from "react";

/**
 * Pointer-follow tilt for the framed prints inside it.
 *
 * One delegated listener on the container rather than one per tile: a gallery
 * renders every photograph three times (once per breakpoint layout), so
 * per-element handlers would mean ~50 listeners for 18 pictures.
 *
 * Writes CSS custom properties and lets CSS do the transform, so the rotation
 * limit, the easing and the reduced-motion and coarse-pointer opt-outs all live
 * in one place in the stylesheet.
 */
export default function Tilt({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Never runs where it could not be used or would not be wanted.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    let frame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;
    let active: HTMLElement | null = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      el.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
      el.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
    };

    const reset = (el: HTMLElement) => {
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
    };

    const onMove = (e: PointerEvent) => {
      const tile =
        (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tile !== active) {
        if (active) reset(active);
        active = tile;
      }
      if (!tile) return;

      const r = tile.getBoundingClientRect();
      // −1..1 from the centre, then scaled by the max angle set in CSS.
      const max = parseFloat(
        getComputedStyle(tile).getPropertyValue("--tilt-max") || "6",
      );
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      pending = { el: tile, x: nx * max, y: -ny * max };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (active) reset(active);
      active = null;
      pending = null;
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      if (active) reset(active);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
