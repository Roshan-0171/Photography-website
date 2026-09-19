import { generatedPhotos } from "./photos.generated";
import type { GeneratedPhoto } from "./photo-types";

export type Photo = GeneratedPhoto;
export type Category = Exclude<Photo["category"], "hero" | "about">;

/**
 * The galleries, in the order they appear on /work. Each id matches an entry
 * in scripts/photo-folders.mjs, which maps it to its folder in photos-source/.
 * A gallery with no photographs is hidden automatically.
 */
export const categories: { id: Category; label: string; blurb: string }[] = [
  {
    id: "wedding",
    label: "Wedding",
    blurb:
      "The day as it happened — the waiting, the veil, the first look. Unposed where it matters, directed only where it helps.",
  },
  {
    id: "proposal",
    label: "Proposal",
    blurb: "The question, the answer, and the minute after. Planned quietly so it still feels like a surprise.",
  },
  {
    id: "maternity",
    label: "Maternity",
    blurb: "The months of waiting, photographed slowly and in soft light.",
  },
  {
    id: "pasni",
    label: "Pasni",
    blurb: "A child's first taste of rice, and the family gathered around it.",
  },
  {
    id: "graduation",
    label: "Graduation",
    blurb: "Caps, gowns and the people who got you there.",
  },
  {
    id: "cultural",
    label: "Cultural",
    blurb: "Festivals, rituals and the everyday traditions of the valley.",
  },
  {
    id: "concert",
    label: "Concert",
    blurb: "Stage light, crowds and the moments between songs.",
  },
  {
    id: "events",
    label: "Outdoor Events",
    blurb: "Gatherings in the open air, photographed as they unfold.",
  },
  {
    id: "halloween",
    label: "Halloween",
    blurb: "Costumes, parties and a little theatre.",
  },
  {
    id: "pets",
    label: "Pets",
    blurb: "The other members of the family, photographed on their own terms.",
  },
];

const GALLERY: Category[] = categories.map((c) => c.id);

/**
 * Which gallery folders are even eligible to appear on the home page. Remove
 * a category here and every one of its photographs drops off the home page
 * immediately, regardless of any individual `home` value set on them in
 * photo-text.json — a fast, coarse switch for "no weddings on the front page"
 * without editing every wedding photograph's entry by hand.
 *
 * This only gates which folders are allowed on; it does not put anything on
 * the home page by itself. Which specific photographs actually appear, and
 * in what order, is still set per-photograph by `home` in photo-text.json.
 */
export const homeCategories: Category[] = GALLERY;

/** Sorts by the given numeric field, unset (null) values last. */
const byField =
  (key: "order" | "home") =>
  (a: Photo, b: Photo) =>
    (a[key] ?? Number.POSITIVE_INFINITY) - (b[key] ?? Number.POSITIVE_INFINITY);
const byOrder = byField("order");
const byHome = byField("home");

/**
 * hero/ and about/ hold at most one photograph each — enforced at build time
 * in build-photos.mjs — so the site can look each up by folder rather than by
 * filename. Swapping the file in photos-source/ is enough on its own; nothing
 * here ever needs editing.
 */
const singleton = (category: "hero" | "about"): Photo | null =>
  generatedPhotos.find((p) => p.category === category) ?? null;

/** Everything that appears in a gallery. Hero and portrait-of-me are excluded. */
export const photos: Photo[] = generatedPhotos.filter((p) =>
  GALLERY.includes(p.category as Category),
);

export const byCategory = (c: Category) => photos.filter((p) => p.category === c).sort(byOrder);

/**
 * The home page's curated selection, drawn across every gallery. The
 * grid's tiles are one fixed shape, so orientation no longer matters here.
 *
 * Which photographs appear, and in what order, is set entirely by the `home`
 * field in photo-text.json — nothing here needs editing to change the front
 * page.
 */
export const curated: Photo[] = photos
  .filter((p) => homeCategories.includes(p.category as Category) && p.home !== null)
  .sort(byHome);

/**
 * The home page banner. Falls back to the first home-page photograph, then to
 * the first gallery photograph, so an empty hero/ folder never breaks the site.
 */
export const hero: Photo = (() => {
  const photo = singleton("hero") ?? curated[0] ?? photos[0];
  if (!photo) {
    throw new Error("No photographs at all under photos-source/. Add some and run `npm run photos`.");
  }
  return photo;
})();

/** The photograph of me on /story and /contact. Null (and not shown) while about/ is empty. */
export const selfPortrait: Photo | null = singleton("about");
