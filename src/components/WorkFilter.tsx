"use client";

import { useRouter } from "next/navigation";

export type FilterOption = { value: string; label: string; count: number };

type Props = {
  options: FilterOption[];
  selected: string;
};

/**
 * The one control for narrowing /work by category.
 *
 * A native <select>, not a custom dropdown: it gets the correct mobile picker,
 * keyboard support and screen-reader behaviour for free, none of which a
 * hand-built listbox reproduces without real work.
 *
 * Selecting a value navigates — the page itself re-renders server-side with the
 * filtered set, so there is no client-side list to keep in sync and no flash of
 * the unfiltered view. A hidden submit button keeps the underlying <form> usable
 * with no JavaScript at all: focus it (Tab) or view source and it is there,
 * unlike a select with only an onChange handler.
 */
export default function WorkFilter({ options, selected }: Props) {
  const router = useRouter();

  return (
    <form
      method="get"
      action="/work"
      className="flex flex-wrap items-center gap-3"
    >
      <label htmlFor="work-type" className="text-sm text-muted-fg">
        Filter by category
      </label>
      <select
        id="work-type"
        name="type"
        value={selected}
        onChange={(e) => {
          const v = e.target.value;
          router.push(v === "all" ? "/work" : `/work?type=${v}`);
        }}
        className="min-h-11 w-full min-w-0 border border-field bg-bg px-3 text-sm text-fg md:w-auto"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {/* An em dash, not a run-together count: "Portrait07" reads to a
                screen reader as "Portrait zero seven". This reads as
                "Portrait — 7 pictures". */}
            {o.label} — {o.count} {o.count === 1 ? "picture" : "pictures"}
          </option>
        ))}
      </select>
      {/* Visible on keyboard focus only — the same pattern as the skip link in
          the root layout. With JavaScript the select navigates on change and
          this is never needed; without it, it is the only way to submit. */}
      <button
        type="submit"
        className="sr-only focus:not-sr-only focus:static focus:min-h-11 focus:border focus:border-field focus:bg-bg focus:px-4 focus:text-sm"
      >
        Filter
      </button>
    </form>
  );
}
