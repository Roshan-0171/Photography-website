"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Shared scroll-reveal runtime.
 *
 * Deliberately a position check rather than an IntersectionObserver: an observer
 * only fires when the intersection ratio *changes*, so an element jumped straight
 * past — a deep link, a restored scroll position, an in-page anchor — never gets
 * a callback and would stay invisible for good. One rAF-throttled pass over a
 * handful of elements costs nothing and cannot strand content off-screen.
 * The listeners detach as soon as everything has been shown.
 */
const pending = new Map<HTMLElement, number>();
let queued = false;
let listening = false;

function flush() {
  queued = false;
  const fold = window.innerHeight * 0.9;
  for (const [el, delay] of pending) {
    if (el.getBoundingClientRect().top >= fold) continue;
    pending.delete(el);
    if (delay > 0) window.setTimeout(() => (el.dataset.shown = "true"), delay);
    else el.dataset.shown = "true";
  }
  if (pending.size === 0 && listening) {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    listening = false;
  }
}

function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

function track(el: HTMLElement, delay: number) {
  pending.set(el, delay);
  if (!listening) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    listening = true;
  }
  schedule();
}

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger in ms, applied only when motion is allowed. */
  delay?: number;
};

/**
 * Subtle scroll reveal (opacity + 12px rise, 350ms). CSS-driven rather than a
 * motion library — it is one effect and does not justify the bytes.
 *
 * Never wrap the hero image in this: the LCP element must not wait on anything.
 */
export default function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: the final state, immediately, with nothing to observe.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.shown = "true";
      return;
    }

    track(el, delay);
    return () => {
      pending.delete(el);
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className}`} data-shown="false">
      {children}
    </Tag>
  );
}
