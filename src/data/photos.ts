import { generatedPhotos } from "./photos.generated";
import type { GeneratedPhoto } from "./photo-types";

export type Photo = GeneratedPhoto;
export type Category = "portrait" | "editorial" | "wedding" | "personal";

/** The three galleries, in the order they appear on /work. */
export const categories: { id: Category; label: string; blurb: string }[] = [
  {
    id: "portrait",
    label: "Portrait",
    blurb:
      "Individuals, families and founders. Unhurried sessions, mostly daylight, mostly on your own ground.",
  },
  {
    id: "editorial",
    label: "Editorial",
    blurb:
      "Commissioned work for magazines, brands and hospitality — people photographed at what they do.",
  },
  {
    id: "wedding",
    label: "Wedding",
    blurb:
      "The day as it happened — the waiting, the veil, the first look. Unposed where it matters, directed only where it helps.",
  },
  {
    id: "personal",
    label: "Personal",
    blurb:
      "Work made for no client. The valley, its weather, and the reason I picked up a camera.",
  },
];

const GALLERY: Category[] = ["portrait", "editorial", "wedding", "personal"];

function required(id: string): Photo {
  const photo = generatedPhotos.find((p) => p.id === id);
  if (!photo) {
    throw new Error(
      `Missing photograph "${id}". Add the file to photos-source/ and run \`npm run photos\`.`,
    );
  }
  return photo;
}

/** Everything that appears in a gallery. Hero and portrait-of-me are excluded. */
export const photos: Photo[] = generatedPhotos.filter((p) =>
  GALLERY.includes(p.category as Category),
);

export const byCategory = (c: Category) => photos.filter((p) => p.category === c);

export const hero = required("patan-sunset");
export const selfPortrait = required("self-portrait");

/**
 * Curated home selection — six pieces, deliberately mixed across categories.
 * Edit this list to change what appears on the front page.
 */
export const curated: Photo[] = [
  "window-light-sitting",
  "bride-in-red",
  "saree-in-the-forest",
  "swayambhu-eyes",
  "doorway-smile",
  "under-the-veil",
].map(required);
