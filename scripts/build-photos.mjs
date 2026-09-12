#!/usr/bin/env node
/**
 * Photograph pipeline.
 *
 *   photos-source/<category>/<name>.jpg   (originals, gitignored, never served)
 *        ↓
 *   public/photos/<category>/<name>-<width>.{avif,webp,jpg}   (committed)
 *   src/data/photos.generated.ts                              (committed)
 *
 * Run: npm run photos
 *
 * Idempotent: each original is fingerprinted, and one whose fingerprint and
 * settings are unchanged is skipped entirely. Delete .photo-cache.json to force
 * a full rebuild.
 */

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

// --- settings --------------------------------------------------------------

/**
 * Largest derivative. 2000px fills a 1440pt viewport at roughly 1.4x and a
 * phone at well over 2x, so it looks sharp everywhere — while being small
 * enough that nobody can lift a print-quality file off the site. The original
 * never leaves photos-source/.
 */
const MAX_WIDTH = 2000;

/** Widths emitted, clipped to MAX_WIDTH and to the original's own width. */
const WIDTHS = [400, 600, 800, 1200, 1600, 2000];

const FORMATS = /** @type {const} */ (["avif", "webp", "jpg"]);
const QUALITY = { avif: 55, webp: 76, jpg: 82 };

/** Categories that appear in the galleries, in the order they are shown. */
const GALLERY_CATEGORIES = ["portrait", "editorial", "wedding", "personal"];
/** Single-purpose images that live outside the galleries. */
const SINGLETON_CATEGORIES = ["hero", "about"];

const SOURCE_DIR = "photos-source";
const OUT_DIR = path.join("public", "photos");
const CACHE_FILE = ".photo-cache.json";
const DATA_FILE = path.join("src", "data", "photos.generated.ts");
const ALT_FILE = path.join("src", "data", "photo-text.json");

const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"]);

// --- helpers ---------------------------------------------------------------

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

/** "studio-north-light" → "Studio North Light". Small words stay lowercase. */
const MINOR = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "the", "to"]);
const titleize = (id) =>
  id
    .split("-")
    .map((word, i) =>
      i > 0 && MINOR.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

/** Fingerprint the bytes, so touching a file without editing it changes nothing. */
async function fingerprint(file) {
  const buf = await fs.readFile(file);
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

/**
 * Verify no identifying metadata survived into a derivative.
 *
 * sharp drops metadata unless withMetadata() is called, but "should be absent"
 * is not the same as "is absent" — this is a privacy requirement, so it is
 * checked on the actual output bytes rather than assumed.
 */
async function assertNoMetadata(file) {
  const meta = await sharp(file).metadata();
  const leaked = [];
  if (meta.exif) leaked.push("EXIF");
  if (meta.iptc) leaked.push("IPTC");
  if (meta.xmp) leaked.push("XMP");
  if (meta.orientation && meta.orientation !== 1) leaked.push("orientation tag");
  if (leaked.length > 0) {
    throw new Error(
      `Metadata survived into ${file}: ${leaked.join(", ")}. ` +
        `This can leak GPS coordinates, camera serial numbers and timestamps. Build stopped.`,
    );
  }
}

// --- pipeline --------------------------------------------------------------

async function listSources() {
  const out = [];
  for (const category of [...GALLERY_CATEGORIES, ...SINGLETON_CATEGORIES]) {
    const dir = path.join(SOURCE_DIR, category);
    let entries;
    try {
      entries = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const entry of entries.sort()) {
      if (!SOURCE_EXT.has(path.extname(entry).toLowerCase())) continue;
      out.push({ category, file: path.join(dir, entry), id: slugify(entry) });
    }
  }
  return out;
}

async function processOne(src, cache, force) {
  const fp = await fingerprint(src.file);
  const settings = `${MAX_WIDTH}|${WIDTHS.join(",")}|${FORMATS.join(",")}|${JSON.stringify(QUALITY)}`;
  const cached = cache[src.id];

  const image = sharp(src.file, { failOn: "error" });
  const meta = await image.metadata();
  // autoOrient bakes the rotation into the pixels so the orientation EXIF tag
  // can be discarded without the picture ending up sideways.
  const rotated = meta.orientation && meta.orientation >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  if (cached && cached.fingerprint === fp && cached.settings === settings && !force) {
    return { ...cached.photo, skipped: true };
  }

  const outDir = path.join(OUT_DIR, src.category);
  await fs.mkdir(outDir, { recursive: true });

  const widths = WIDTHS.filter((w) => w <= Math.min(MAX_WIDTH, width));
  if (widths.length === 0) widths.push(Math.min(MAX_WIDTH, width));

  for (const w of widths) {
    for (const ext of FORMATS) {
      const out = path.join(outDir, `${src.id}-${w}.${ext}`);
      let pipe = sharp(src.file).autoOrient().resize({ width: w, withoutEnlargement: true });
      if (ext === "avif") pipe = pipe.avif({ quality: QUALITY.avif });
      if (ext === "webp") pipe = pipe.webp({ quality: QUALITY.webp });
      if (ext === "jpg") pipe = pipe.jpeg({ quality: QUALITY.jpg, mozjpeg: true });
      await pipe.toFile(out);
      await assertNoMetadata(out);
    }
  }

  // Tiny blurred stand-in, inlined as a data URI so it paints with the HTML.
  const blur = await sharp(src.file)
    .autoOrient()
    .resize({ width: 16 })
    .blur(1.2)
    .webp({ quality: 40 })
    .toBuffer();

  const photo = {
    id: src.id,
    category: src.category,
    width,
    height,
    aspectRatio: Number((width / height).toFixed(4)),
    widths,
    base: `/photos/${src.category}/${src.id}`,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };

  cache[src.id] = { fingerprint: fp, settings, photo };
  return { ...photo, skipped: false };
}

async function writeDataFile(photos, text) {
  const entries = photos
    .map((p) => {
      const t = text[p.id] ?? {};
      const alt = t.alt ?? "";
      const caption = t.caption ?? "";
      const featured = t.featured === true ? "\n    featured: true," : "";
      const year = Number.isInteger(t.year) ? t.year : null;
      const todo = alt ? "" : `\n    // TODO: write alt text for this photograph in ${ALT_FILE}`;
      return `  {
    id: ${JSON.stringify(p.id)},
    category: ${JSON.stringify(p.category)},
    width: ${p.width},
    height: ${p.height},
    aspectRatio: ${p.aspectRatio},
    widths: [${p.widths.join(", ")}],
    base: ${JSON.stringify(p.base)},
    title: ${JSON.stringify(titleize(p.id))},
    year: ${year === null ? "null" : year},${todo}
    alt: ${JSON.stringify(alt)},
    caption: ${JSON.stringify(caption)},${featured}
    blurDataURL: ${JSON.stringify(p.blurDataURL)},
  },`;
    })
    .join("\n");

  const file = `// GENERATED FILE — DO NOT EDIT.
// Written by scripts/build-photos.mjs from ${SOURCE_DIR}/. Run \`npm run photos\`.
// Alt text and captions are yours to write, in ${ALT_FILE}; they are merged in
// here and survive every regeneration.

import type { GeneratedPhoto } from "./photo-types";

export const generatedPhotos: GeneratedPhoto[] = [
${entries}
];
`;
  await fs.writeFile(DATA_FILE, file);
}

/** Add a blank entry for every new photo without disturbing what is already written. */
async function syncTextFile(photos, text) {
  let added = 0;
  for (const p of photos) {
    if (!text[p.id]) {
      text[p.id] = { alt: "", caption: "", year: null, featured: false };
      added += 1;
    } else {
      // Backfill keys added since this file was written, without touching
      // anything already there.
      const entry = text[p.id];
      if (entry.alt === undefined) entry.alt = "";
      if (entry.caption === undefined) entry.caption = "";
      if (entry.featured === undefined) entry.featured = false;
      if (entry.year === undefined) entry.year = null;
    }
  }
  const ordered = Object.fromEntries(photos.map((p) => [p.id, text[p.id]]));
  await fs.writeFile(ALT_FILE, `${JSON.stringify(ordered, null, 2)}\n`);
  return added;
}

// --- main ------------------------------------------------------------------

const force = process.argv.includes("--force");

const sources = await listSources();
if (sources.length === 0) {
  console.error(
    c.red(`No photographs found under ${SOURCE_DIR}/.`) +
      `\nExpected subfolders: ${[...GALLERY_CATEGORIES, ...SINGLETON_CATEGORIES].join(", ")}`,
  );
  process.exit(1);
}

const duplicates = sources.map((s) => s.id).filter((id, i, a) => a.indexOf(id) !== i);
if (duplicates.length > 0) {
  console.error(c.red(`Duplicate photo ids: ${[...new Set(duplicates)].join(", ")}`));
  console.error("Two files slugify to the same name. Rename one.");
  process.exit(1);
}

const cache = force ? {} : await readJson(CACHE_FILE, {});
const text = await readJson(ALT_FILE, {});

console.log(c.bold(`\nProcessing ${sources.length} photographs\n`));

const photos = [];
let built = 0;
for (const src of sources) {
  const photo = await processOne(src, cache, force);
  photos.push(photo);
  if (photo.skipped) {
    console.log(`  ${c.dim("unchanged")}  ${src.category}/${src.id}`);
  } else {
    built += 1;
    console.log(
      `  ${c.green("built")}      ${src.category}/${src.id}  ` +
        c.dim(`${photo.width}×${photo.height} → ${photo.widths.length} widths × 3 formats`),
    );
  }
}

// Remove derivatives whose original is gone, so /public cannot drift.
const live = new Set(photos.map((p) => `${p.category}/${p.id}`));
for (const category of [...GALLERY_CATEGORIES, ...SINGLETON_CATEGORIES]) {
  const dir = path.join(OUT_DIR, category);
  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    continue;
  }
  for (const f of files) {
    const id = f.replace(/-\d+\.(avif|webp|jpg)$/, "");
    if (!live.has(`${category}/${id}`)) {
      await fs.unlink(path.join(dir, f));
      console.log(`  ${c.yellow("removed")}    ${category}/${f}  ${c.dim("(no original)")}`);
    }
  }
}

const addedText = await syncTextFile(photos, text);
await writeDataFile(photos, text);
await fs.writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);

console.log(
  `\n${built} built, ${photos.length - built} unchanged.  ` +
    c.dim(`→ ${DATA_FILE}`),
);
if (addedText > 0) console.log(c.dim(`  ${addedText} new entries added to ${ALT_FILE}`));

// At most one featured photograph per gallery — a second one silently loses.
for (const category of GALLERY_CATEGORIES) {
  const flagged = photos.filter((p) => p.category === category && text[p.id]?.featured === true);
  if (flagged.length > 1) {
    console.log(
      c.yellow(
        `\n  ${flagged.length} photographs are featured in "${category}": ${flagged.map((p) => p.id).join(", ")}.` +
          `\n  Only the first will span the full width. Unset the others in ${ALT_FILE}.`,
      ),
    );
  }
}

const missingYear = photos.filter((p) => !Number.isInteger(text[p.id]?.year));
if (missingYear.length > 0) {
  console.log(
    c.dim(
      `\n  ${missingYear.length} of ${photos.length} photographs have no year set in ${ALT_FILE}.` +
        `\n  Index rows simply omit it until you fill it in — no year is invented.`,
    ),
  );
}

const missingAlt = photos.filter((p) => !(text[p.id]?.alt ?? "").trim());
if (missingAlt.length > 0) {
  const banner = "─".repeat(66);
  console.log(`\n${c.yellow(banner)}`);
  console.log(c.yellow(c.bold(`  ${missingAlt.length} of ${photos.length} photographs have NO ALT TEXT`)));
  console.log(c.yellow(`  They are published, but unreadable to anyone using a screen`));
  console.log(c.yellow(`  reader, and invisible to image search.`));
  console.log(c.yellow(`\n  Write one line per photograph in ${c.bold(ALT_FILE)}:`));
  for (const p of missingAlt.slice(0, 8)) console.log(c.yellow(`    · ${p.id}`));
  if (missingAlt.length > 8) console.log(c.yellow(`    · …and ${missingAlt.length - 8} more`));
  console.log(c.yellow(banner));
  if (process.env.PHOTOS_REQUIRE_ALT === "1") {
    console.error(c.red("\nPHOTOS_REQUIRE_ALT=1 — failing the build.\n"));
    process.exit(1);
  }
  console.log(c.dim("\nSet PHOTOS_REQUIRE_ALT=1 to make this a hard failure (do this in CI).\n"));
} else {
  console.log(c.green("\nEvery photograph has alt text.\n"));
}
