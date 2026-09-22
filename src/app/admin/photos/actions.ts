"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generatedPhotos } from "@/data/photos.generated";
import { isSignedIn } from "@/lib/admin-auth";

const TEXT_FILE = path.join(process.cwd(), "src", "data", "photo-text.json");
const GENERATED_FILE = path.join(process.cwd(), "src", "data", "photos.generated.ts");

export async function saveHomepagePhotos(formData: FormData): Promise<void> {
  if (!(await isSignedIn())) redirect("/admin");

  const validIds = new Set(
    generatedPhotos
      .filter((photo) => !["hero", "about"].includes(photo.category))
      .map((photo) => photo.id),
  );
  const selectedIds = new Set(
    formData
      .getAll("selected")
      .map(String)
      .filter((id) => validIds.has(id)),
  );

  const requested = [...selectedIds]
    .map((id) => ({ id, order: Number(formData.get(`order-${id}`)) }))
    .filter((item) => Number.isFinite(item.order) && item.order > 0)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const homeById = new Map(requested.map((item, index) => [item.id, index + 1]));

  const text = JSON.parse(await fs.readFile(TEXT_FILE, "utf8")) as Record<string, Record<string, unknown>>;
  for (const id of validIds) {
    if (!text[id]) text[id] = {};
    text[id].home = homeById.get(id) ?? null;
  }
  await fs.writeFile(TEXT_FILE, `${JSON.stringify(text, null, 2)}\n`, "utf8");

  let generated = await fs.readFile(GENERATED_FILE, "utf8");
  for (const photo of generatedPhotos) {
    const home = homeById.get(photo.id) ?? null;
    const escapedId = photo.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(id: "${escapedId}"[\\s\\S]*?\\n\\s+home: )(?:null|\\d+)(,)`);
    generated = generated.replace(pattern, `$1${home ?? "null"}$2`);
  }
  await fs.writeFile(GENERATED_FILE, generated, "utf8");

  revalidatePath("/home");
  revalidatePath("/admin/photos");
  redirect("/admin/photos?saved=1");
}