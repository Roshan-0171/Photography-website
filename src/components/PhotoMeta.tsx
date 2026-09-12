import { categories, type Photo } from "@/data/photos";

const LABELS = Object.fromEntries(categories.map((c) => [c.id, c.label]));

/** "portrait" → "Portrait". One lookup so the grid and the index agree. */
export const categoryLabel = (id: string) => LABELS[id] ?? id;

/**
 * The metadata line that sits under a photograph and beside an index row:
 * title, then year and category. Year is omitted rather than invented when it
 * has not been set in photo-text.json.
 */
export default function PhotoMeta({
  photo,
  className = "",
}: {
  photo: Photo;
  className?: string;
}) {
  const type = categoryLabel(photo.category);

  return (
    <span className={`block text-xs uppercase tracking-[0.12em] ${className}`}>
      <span className="block text-fg">{photo.title}</span>
      <span className="mt-1 block text-muted-fg">
        {photo.year ? `${photo.year} · ${type}` : type}
      </span>
    </span>
  );
}
