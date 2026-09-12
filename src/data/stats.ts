import { categories, photos } from "./photos";

/**
 * The three-figure strip under the hero.
 *
 * Templates for this kind of site usually fill this row with invented
 * numbers — "340+ sessions", "98% satisfaction" — figures nobody could check.
 * Nothing here is invented. Two are computed from the actual photo data, so
 * they can't go stale the way a hand-typed count would; the third is a
 * commitment already made in prose elsewhere on the site, not a metric.
 */
export const stats = [
  {
    // Matches "Ten years photographing..." in the hero copy, src/app/page.tsx.
    // Update both together if it changes.
    value: "10",
    label: "Years behind the camera",
  },
  {
    value: String(photos.length),
    label: `Photographs across ${categories.length} categories`,
  },
  {
    // Matches RESPONSE_TIME in src/data/emails.ts ("two working days").
    value: "2",
    label: "Working days to reply",
  },
] as const;
