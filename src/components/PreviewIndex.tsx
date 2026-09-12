"use client";

import { useRef, useState } from "react";

import type { Photo } from "@/data/photos";
import Lightbox from "./Lightbox";
import { categoryLabel } from "./PhotoMeta";
import Picture from "./Picture";

type Row = { photo: Photo; index: number };

type Props = {
  /** Shown in the panel until a row takes it over. Also the LCP element. */
  hero: Photo;
  /** Full set the lightbox steps through. */
  all: Photo[];
  /** The featured rows, each carrying its position in `all`. */
  rows: Row[];
  label: string;
  children?: React.ReactNode;
};

/**
 * A preview panel above a text index, after the reference site: the panel holds
 * one large photograph and swaps to whichever row you are pointing at or have
 * tabbed to, so the list can be read as a list without losing the pictures.
 *
 * Rows are real anchors pointing at the gallery the photograph belongs to. With
 * JavaScript they open the lightbox instead; without it they still land you on
 * that gallery, so the index is never a dead list. They deliberately do NOT
 * target an individual frame: each photograph is rendered once per breakpoint
 * layout, so a per-photo id would appear three times in the document.
 */
export default function PreviewIndex({ hero, all, rows, label, children }: Props) {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const active = activeRow === null ? hero : rows[activeRow].photo;
  const isHero = active.id === hero.id;

  /** Arrow keys walk the index; Enter follows the focused row. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const from = activeRow ?? -1;
    const next =
      e.key === "ArrowDown"
        ? Math.min(from + 1, rows.length - 1)
        : Math.max(from - 1, 0);
    setActiveRow(next);
    linkRefs.current[next]?.focus();
  };

  return (
    <section aria-label={label}>
      {/* Fixed-height banner: swapping photographs of different shapes inside it
          cannot shift the page. This is the one place a photograph is cropped. */}
      <div className="relative h-[clamp(22rem,66vh,48rem)] w-full overflow-hidden bg-muted">
        <Picture
          key={active.id}
          photo={active}
          fill
          priority={isHero}
          sizes="100vw"
          className="transition-opacity duration-300 motion-reduce:transition-none"
        />
      </div>

      {children}

      <div className="mx-auto max-w-[90rem] px-6 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-3">
          <h2 className="text-xs uppercase tracking-[0.14em] text-muted-fg">
            Featured
          </h2>
          <p className="text-xs tabular-nums text-muted-fg">
            ({activeRow === null ? rows.length : activeRow + 1} of {rows.length})
          </p>
        </div>

        <ul onKeyDown={onKeyDown}>
          {rows.map((row, i) => (
            <li key={row.photo.id}>
              <a
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                href={`/work#${row.photo.category}`}
                onMouseEnter={() => setActiveRow(i)}
                onMouseLeave={() => setActiveRow(null)}
                onFocus={() => setActiveRow(i)}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenAt(row.index);
                }}
                className={`flex min-h-11 cursor-pointer flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line py-4 transition-colors duration-200 ${
                  activeRow === i ? "text-fg" : "text-muted-fg"
                }`}
              >
                <span className="min-w-0 text-sm uppercase tracking-[0.12em] text-fg">
                  {row.photo.title}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] tabular-nums text-muted-fg">
                  {row.photo.year ? `${row.photo.year} · ` : ""}
                  {categoryLabel(row.photo.category)}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-3 hidden text-xs uppercase tracking-[0.12em] text-muted-fg sm:block">
          ↑↓ navigate · ↵ open · esc close
        </p>
      </div>

      {openAt !== null && (
        <Lightbox
          photos={all}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </section>
  );
}
