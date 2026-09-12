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
  /** Stretch to fill a positioned parent. Crops — only for the hero banner. */
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
          style={{
            backgroundImage: `url("${photo.blurDataURL}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            ...style,
          }}
          className={
            fill
              ? `absolute inset-0 size-full object-cover ${className}`
              : variant === "contain"
                ? `mx-auto h-auto max-h-[80vh] w-auto max-w-full ${className}`
                : `h-auto w-full ${className}`
          }
        />
      </picture>
    </>
  );
}
