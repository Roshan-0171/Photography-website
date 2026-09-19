import Link from "next/link";

export type FilterOption = { value: string; label: string; count: number };

type Props = {
  options: FilterOption[];
  selected: string;
};

/**
 * The one control for narrowing /work by category: a row of tabs, each a real
 * link to its filtered URL.
 *
 * Links rather than a <select>: every category and its count is visible at a
 * glance instead of hidden behind a dropdown, the current one is marked, and
 * switching is one click. Because they are plain anchors the filter works with
 * no JavaScript, is keyboard- and screen-reader-native, and gives crawlers a
 * href to every ?type= view — which the old select needed a hidden nav for.
 *
 * The row wraps rather than scrolls, so nothing is ever off-screen on a phone.
 */
export default function WorkFilter({ options, selected }: Props) {
  return (
    <nav aria-label="Filter by category" className="border-b border-line">
      <ul className="-mb-px flex flex-wrap gap-x-7 gap-y-1">
        {options.map((o) => {
          const active = o.value === selected;
          return (
            <li key={o.value}>
              <Link
                href={o.value === "all" ? "/work" : `/work?type=${o.value}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-baseline gap-2 border-b-2 pb-2 pt-3 text-sm transition-colors duration-200 ${
                  active
                    ? "border-fg text-fg"
                    : "border-transparent text-muted-fg hover:border-line hover:text-fg"
                }`}
              >
                {o.label}
                <span className="text-xs tabular-nums text-muted-fg">
                  {o.count}
                  <span className="sr-only"> {o.count === 1 ? "picture" : "pictures"}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
