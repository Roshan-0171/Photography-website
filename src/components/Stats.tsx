import { stats } from "@/data/stats";

/**
 * Three facts, not a marketing flourish — see the sourcing comments in
 * src/data/stats.ts. Same three-column dl pattern already used for the
 * summary strip in the admin enquiries list, reused here for consistency
 * rather than inventing a second visual language for the same kind of data.
 */
export default function Stats() {
  return (
    <dl className="grid grid-cols-3 divide-x divide-line border-y border-line text-center">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-8 sm:px-8">
          <dt className="text-xs uppercase tracking-[0.14em] text-muted-fg">
            {s.label}
          </dt>
          <dd className="mt-2 font-display text-3xl tabular-nums sm:text-4xl">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
