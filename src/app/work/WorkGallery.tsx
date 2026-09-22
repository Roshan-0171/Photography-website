import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import { byWorkGroup, photos, workGroups, workGroupFor, type WorkGroupId } from "@/data/photos";

export const VALID_CATEGORY_IDS = new Set<string>(workGroups.map((group) => group.id));

export const isCategory = (value: unknown): value is WorkGroupId =>
  typeof value === "string" && workGroupFor(value) !== null;

export default function WorkGallery({ selected }: { selected: "all" | WorkGroupId }) {
  const nonEmpty = workGroups.filter((group) => byWorkGroup(group.id).length > 0);
  const visible = selected === "all" ? nonEmpty : nonEmpty.filter((group) => group.id === selected);
  const intro =
    selected === "all"
      ? `${photos.length} pictures, across ${nonEmpty.length} collections. Every frame is shown whole — nothing here is cropped to fit a grid.`
      : `${byWorkGroup(selected).length} pictures. Every frame is shown whole — nothing here is cropped to fit a grid.`;

  return (
    <div className="wrap py-12 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-display-1">Galleries</h1>
        <p className="mt-6 text-lg text-muted-fg">{intro}</p>
      </header>

      {visible.map((group) => (
        <section
          key={group.id}
          id={group.id}
          aria-labelledby={`${group.id}-heading`}
          className="scroll-mt-28 pt-12"
        >
          <Reveal as="header" className="max-w-2xl pb-6">
            <h2 id={`${group.id}-heading`} className="text-display-3">
              {group.label}
            </h2>
            <p className="mt-2 text-muted-fg">{group.blurb}</p>
          </Reveal>

          <Gallery photos={byWorkGroup(group.id)} label={`${group.label} gallery`} />
        </section>
      ))}
    </div>
  );
}