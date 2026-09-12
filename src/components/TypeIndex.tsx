import Link from "next/link";

import { byCategory, categories } from "@/data/photos";

/**
 * Browse by type, on the home page. A count-bearing nav rather than plain
 * links — the number tells you how much work sits behind each label before
 * you click. /work itself now uses a filter (WorkFilter), not this component;
 * this is the one remaining caller.
 */
export default function TypeIndex() {
  return (
    // The nav's aria-label carries the accessible name; no visible heading
    // duplicates it — a screen reader still announces "Browse by type, navigation".
    <nav aria-label="Browse by type" className="border-y border-line py-4">
      <ul className="flex flex-wrap gap-x-8 gap-y-2">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/work?type=${c.id}`}
              className="inline-flex min-h-11 cursor-pointer items-baseline gap-2 text-sm uppercase tracking-[0.12em] text-fg underline-offset-4 transition-colors duration-200 hover:underline"
            >
              {c.label}
              {/* An em dash, not a run-together count — "Portrait07" reads to
                  a screen reader as "Portrait zero seven". */}
              <span className="text-xs tabular-nums text-muted-fg">
                — {byCategory(c.id).length}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
