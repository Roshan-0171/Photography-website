/** Shape of one entry in photos.generated.ts. */
export type GeneratedPhoto = {
  id: string;
  category: "portrait" | "editorial" | "personal" | "hero" | "about";
  /** Intrinsic pixel dimensions, read from the original file — never hand-entered. */
  width: number;
  height: number;
  /** width / height. Used to reserve layout space before the image arrives. */
  aspectRatio: number;
  /** Derivative widths actually written to /public for this photograph. */
  widths: number[];
  /** URL stem: `${base}-${width}.${ext}` */
  base: string;
  /** Display name, derived from the filename. "studio-north-light" → "Studio North Light". */
  title: string;
  /** Year the photograph was made. Set it in photo-text.json; null hides it. */
  year: number | null;
  /** Yours to write, in photo-text.json. Empty means nobody using a screen reader can see it. */
  alt: string;
  /** Shown under the photograph in the lightbox. Optional. */
  caption: string;
  /** Tiny inlined WebP, painted while the real file loads. */
  blurDataURL: string;
  /**
   * Give one photograph per gallery the full content width instead of a single
   * column, breaking the grid rhythm. Set it in photo-text.json. Optional — the
   * layout reads correctly with no photograph flagged at all.
   */
  featured?: boolean;
};
