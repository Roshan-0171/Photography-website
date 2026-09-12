import Link from "next/link";

import { byCategory, categories } from "@/data/photos";

/** "7" → "07", matching the reference's fixed-width counts. */
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Browse by type. A count-bearing filter row rather than plain navigation —
 * the number tells you how much work sits behind each label before you click.
 */
export default function TypeIndex({ base = "/work" }: { base?: string }) {
  return (
    <nav aria-label="Browse by type" className="border-y border-line py-4">
      <h2 className="text-xs uppercase tracking-[0.14em] text-muted-fg">
        Browse by type
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`${base}#${c.id}`}
              className="inline-flex min-h-11 cursor-pointer items-baseline gap-2 text-sm uppercase tracking-[0.12em] text-fg underline-offset-4 transition-colors duration-200 hover:underline"
            >
              {c.label}
              <span className="text-xs tabular-nums text-muted-fg">
                {pad(byCategory(c.id).length)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
