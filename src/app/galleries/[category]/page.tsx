import { notFound } from "next/navigation";

import WorkFilter, { type FilterOption } from "@/components/WorkFilter";
import WorkGallery, { isCategory } from "../../work/WorkGallery";
import { byWorkGroup, photos, workGroups, workGroupFor } from "@/data/photos";

export default async function GalleriesCategoryPage({
  params,
}: PageProps<"/galleries/[category]">) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  const selected = workGroupFor(category)!;
  const options: FilterOption[] = [
    { value: "all", label: "All galleries", count: photos.length },
    ...workGroups
      .filter((group) => byWorkGroup(group.id).length > 0)
      .map((group) => ({
        value: group.id,
        label: group.label,
        count: byWorkGroup(group.id).length,
      })),
  ];

  return (
    <>
      <div className="wrap pt-12 sm:pt-16">
        <WorkFilter options={options} selected={selected} />
      </div>
      <WorkGallery selected={selected} />
    </>
  );
}