/**
 * Which folders under photos-source/ the site reads, shared by
 * build-photos.mjs and build-og.mjs.
 *
 * `folder` is the name on disk; `id` is what the site uses (URLs, the
 * public/photos/ path, the category field). They differ only where the folder
 * name is not a clean URL slug. Labels and blurbs for each id live in
 * src/data/photos.ts — keep the two lists in step when adding a folder.
 */

/** Gallery folders, in the order the galleries are shown. */
export const GALLERY_CATEGORIES = [
  { id: "wedding", folder: "wedding" },
  { id: "proposal", folder: "proposal" },
  { id: "maternity", folder: "maternal" },
  { id: "pasni", folder: "pasni" },
  { id: "graduation", folder: "graduation" },
  { id: "cultural", folder: "cultural" },
  { id: "concert", folder: "concert" },
  { id: "events", folder: "event outdoor" },
  { id: "halloween", folder: "hallowen" },
  { id: "pets", folder: "pets" },
];

/**
 * Single-purpose images that live outside the galleries. Each holds at most
 * one photograph and both are optional: with hero/ empty the site uses the
 * first home-page photograph instead, and with about/ empty the About and
 * Contact pages simply show no portrait.
 */
export const SINGLETON_CATEGORIES = [
  { id: "hero", folder: "hero" },
  { id: "about", folder: "about" },
];

/** Folders under photos-source/ that are deliberately not published. */
export const IGNORED_FOLDERS = ["logo"];

export const ALL_CATEGORIES = [...GALLERY_CATEGORIES, ...SINGLETON_CATEGORIES];
