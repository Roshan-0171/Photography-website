import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Picture from "@/components/Picture";
import { generatedPhotos } from "@/data/photos.generated";
import { isSignedIn } from "@/lib/admin-auth";
import { saveHomepagePhotos } from "./actions";

export const metadata: Metadata = { title: "Homepage photos" };

export default async function AdminPhotosPage({ searchParams }: PageProps<"/admin/photos">) {
  if (!(await isSignedIn())) redirect("/admin");
  const params = await searchParams;
  const saved = params.saved === "1";

  const photos = generatedPhotos.filter((photo) => !["hero", "about"].includes(photo.category));
  const selectedPhotos = photos
    .filter((photo) => photo.home !== null)
    .sort((a, b) => (a.home ?? 0) - (b.home ?? 0));
  const availablePhotos = photos
    .filter((photo) => photo.home === null)
    .sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));

  return (
    <div className="wrap py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-fg">Admin</p>
        <h1 className="mt-4 text-display-1">Homepage photos</h1>
        <p className="mt-5 text-muted-fg">
          Select the photos you want on the homepage and give them an order.
          The lowest number appears first. Unchecked photos stay hidden.
        </p>
      </header>

      {saved && <p className="mt-8 border border-fg p-4 text-sm">Homepage photos saved.</p>}

      <form action={saveHomepagePhotos}>
        <section aria-labelledby="selected-photos-heading" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
            <h2 id="selected-photos-heading" className="text-display-3">
              Selected for homepage
            </h2>
            <p className="text-sm text-muted-fg">{selectedPhotos.length} photos</p>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {selectedPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="available-photos-heading" className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
            <h2 id="available-photos-heading" className="text-display-3">
              Available photos
            </h2>
            <p className="text-sm text-muted-fg">{availablePhotos.length} photos</p>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {availablePhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </ul>
        </section>
        <button
          type="submit"
          className="mt-12 inline-flex min-h-11 cursor-pointer bg-fg px-7 py-3.5 text-base text-bg transition-colors hover:bg-secondary"
        >
          Save homepage selection
        </button>
      </form>
    </div>
  );
}

function PhotoCard({ photo }: { photo: (typeof generatedPhotos)[number] }) {
  return (
    <li className="min-w-0">
      <label className="block cursor-pointer">
        <input
          type="checkbox"
          name="selected"
          value={photo.id}
          defaultChecked={photo.home !== null}
          className="sr-only peer"
        />
        <span className="block border-2 border-transparent p-1 transition-colors peer-checked:border-fg sm:p-2">
          <span className="print-frame block overflow-hidden">
            <Picture
              photo={photo}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            />
          </span>
        </span>
        <span className="mt-3 block truncate text-sm text-fg" title={photo.id}>
          {photo.id}
        </span>
      </label>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-fg">
        <span className="capitalize">{photo.category}</span>
        <label className="ml-auto flex items-center gap-1">
          Order
          <input
            type="number"
            name={`order-${photo.id}`}
            min="1"
            defaultValue={photo.home ?? ""}
            className="w-14 border border-field bg-bg px-2 py-1 text-fg"
          />
        </label>
      </div>
    </li>
  );
}