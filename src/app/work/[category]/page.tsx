import { notFound } from "next/navigation";

import WorkGallery, { isCategory } from "../WorkGallery";
import { workGroupFor } from "@/data/photos";

export default async function WorkCategoryPage({ params }: PageProps<"/work/[category]">) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  return <WorkGallery selected={workGroupFor(category)!} />;
}