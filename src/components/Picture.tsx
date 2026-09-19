import type { Photo } from "@/data/photos";

type Props = {
  photo: Photo;
  /**
   * How wide this image renders at each breakpoint. Get this wrong and phones
   * download desktop-width files — it is the single highest-leverage attribute
   * on the element.
   */
  sizes: string;
  /**
   * LCP element. Adds a preload hint and a high fetch priority, and never lazy
   * loads. Use on exactly one image per page.
   */
  priority?: boolean;
  /** Overrides the default lazy loading for images known to be in view. */
  loading?: "lazy" | "eager";
  className?: string;
  /** Stretch to fill a positioned parent. Crops — the hero banner and the
   *  gallery's fixed-ratio tiles; the lightbox always shows the whole frame. */
  fill?: boolean;
  /**
   * "column"  — fills its column, height follows the aspect ratio (default).
   * "contain" — for the featured frame: spans the content width but is capped in
   *             height, so a tall photograph cannot swallow the viewport. The
   *             ratio is untouched; nothing is cropped.
   */
  variant?: "column" | "contain";
  style?: React.CSSProperties;
};

const srcSet = (photo: Photo, ext: "avif" | "webp" | "jpg") =>
  photo.widths.map((w) => `${photo.base}-${w}.${ext} ${w}w`).join(", ");

/**
 * Serves the pre-generated derivatives directly: AVIF first, WebP next, JPEG
 * for anything else. No image optimiser runs at request time.
 *
 * The blur placeholder is painted as a background behind the image, so it needs
 * no JavaScript and cannot get stuck if a script fails. Intrinsic width and
 * height are always emitted, which is what reserves the space and keeps CLS at
 * zero — the browser knows the shape before a single byte of the photo lands.
 *
 * Dragging is disabled as a casual deterrent against saving a copy — the
 * right-click context menu is handled separately, site-wide, by
 * ImageProtection (this stays a server component, so it cannot hold its own
 * event handler). Neither is real protection: the file is still a public URL
 * anyone can fetch directly or lift via devtools. It is just enough friction
 * to stop an ordinary right-click-and-save.
 */
export default function Picture({
  photo,
  sizes,
  priority = false,
  loading,
  className = "",
  fill = false,
  variant = "column",
  style,
}: Props) {
  const avif = srcSet(photo, "avif");
  const largest = photo.widths[photo.widths.length - 1];

  return (
    <>
      {priority && (
        <link
          rel="preload"
          as="image"
          type="image/avif"
          imageSrcSet={avif}
          imageSizes={sizes}
          fetchPriority="high"
        />
      )}
      <picture>
        <source type="image/avif" srcSet={avif} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(photo, "webp")} sizes={sizes} />
        <img
          src={`${photo.base}-${largest}.jpg`}
          srcSet={srcSet(photo, "jpg")}
          sizes={sizes}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          decoding="async"
          loading={priority ? "eager" : (loading ?? "lazy")}
          fetchPriority={priority ? "high" : undefined}
          draggable={false}
          style={{
            backgroundImage: `url("${photo.blurDataURL}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitUserSelect: "none",
            userSelect: "none",
            WebkitTouchCallout: "none",
            ...style,
          }}
          className={
            fill
              ? `photo-img absolute inset-0 size-full object-cover ${className}`
              : variant === "contain"
                ? `photo-img mx-auto h-auto max-h-[80vh] w-auto max-w-full ${className}`
                : `photo-img h-auto w-full ${className}`
          }
        />
      </picture>
    </>
  );
}
