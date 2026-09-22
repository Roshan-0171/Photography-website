import type { Metadata } from "next";

import WorkFilter, { type FilterOption } from "@/components/WorkFilter";
import WorkGallery, { isCategory } from "../work/WorkGallery";
import { byWorkGroup, photos, workGroups, workGroupFor, type WorkGroupId } from "@/data/photos";

export const metadata: Metadata = {
  title: "Galleries",
  description:
    "Portrait, editorial, wedding and personal photography and videography, available nationwide.",
};

export default async function GalleriesPage({ searchParams }: PageProps<"/galleries">) {
  const params = await searchParams;
  const raw = Array.isArray(params.type) ? params.type[0] : params.type;
  const selected: "all" | WorkGroupId = isCategory(raw) ? workGroupFor(raw)! : "all";
  const nonEmpty = workGroups.filter((group) => byWorkGroup(group.id).length > 0);
  const options: FilterOption[] = [
    { value: "all", label: "All", count: photos.length },
    ...nonEmpty.map((group) => ({
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