"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { Photo } from "@/data/photos";
import Picture from "./Picture";

type Props = {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Lightbox({ photos, index, onClose, onIndexChange }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const photo = photos[index];
  const many = photos.length > 1;

  const go = useCallback(
    (delta: number) => {
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange],
  );

  // Remember what had focus so it can be handed back on close.
  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => restoreRef.current?.focus?.();
  }, []);

  // Lock the page behind the overlay without shifting it sideways.
  useEffect(() => {
    const { overflow, paddingRight } = document.body.style;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, []);

  // Keyboard: Escape closes, arrows navigate, Tab stays inside the dialog.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight" && many) {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === "ArrowLeft" && many) {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        // tabIndex >= 0 excludes the aria-hidden click-away layer, which is
        // first in the DOM and would otherwise be mistaken for the first stop —
        // letting Shift+Tab walk straight out of the dialog.
        (el) =>
          el.tabIndex >= 0 &&
          el.getAttribute("aria-hidden") !== "true" &&
          (el.offsetParent !== null || el === document.activeElement),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [go, many, onClose]);

  // Only ever mounted in response to a click, so `document` is present; the
  // guard keeps it safe if it is ever rendered during SSR.
  if (!photo || typeof document === "undefined") return null;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !many) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Horizontal intent only — never hijack a vertical scroll gesture.
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    go(dx < 0 ? 1 : -1);
  };

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer, ${index + 1} of ${photos.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-box/95 text-box-fg backdrop-blur-sm"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Click-away target, kept out of the accessibility tree — Escape and the
          close button are the documented ways out. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out"
      />

      <header className="relative flex items-center justify-between gap-6 border-b border-box-line/60 px-6 py-2">
        <p className="font-sans text-sm tabular-nums text-box-fg/70">
          <span className="sr-only">Image </span>
          {index + 1} / {photos.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-box-line px-5 py-2 text-sm text-box-fg transition-colors duration-200 hover:bg-box-fg hover:text-box active:bg-box-fg active:text-box focus-visible:outline-box-fg"
        >
          <X className="size-4" aria-hidden="true" />
          Close
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 py-6 sm:px-16">
        {many && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-2 z-10 grid size-12 cursor-pointer place-items-center rounded-full border border-box-line/70 bg-box/60 text-box-fg transition-colors duration-200 hover:bg-box-fg hover:text-box active:bg-box-fg active:text-box focus-visible:outline-box-fg sm:left-4"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
        )}

        <figure className="relative flex max-h-full flex-col items-center gap-6">
          <Picture
            key={photo.id}
            photo={photo}
            sizes="100vw"
            loading="eager"
            className="max-h-[72vh] !w-auto object-contain"
          />
          <figcaption className="max-w-prose px-6 text-center text-sm text-box-fg/70">
            {photo.caption}
          </figcaption>
        </figure>

        {many && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-2 z-10 grid size-12 cursor-pointer place-items-center rounded-full border border-box-line/70 bg-box/60 text-box-fg transition-colors duration-200 hover:bg-box-fg hover:text-box active:bg-box-fg active:text-box focus-visible:outline-box-fg sm:right-4"
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="relative hidden px-6 pb-6 text-center text-xs text-box-fg/50 sm:block">
        Arrow keys to move between images · Esc to close
      </p>
    </div>,
    document.body,
  );
}
