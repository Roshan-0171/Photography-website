import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";

import { site } from "@/data/site";

/**
 * Instagram's glyph, drawn inline. lucide dropped its brand icons, and one
 * 3-shape SVG is not worth a dependency. Feather's original outline, so it
 * sits on the same 24px grid and stroke as the lucide icons beside it.
 */
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/** "https://instagram.com/roh_portraits" → "@roh_portraits". */
const handle = `@${site.instagram.replace(/\/+$/, "").split("/").pop()}`;

/**
 * Two quiet columns — the mark and the slogan; the three ways to reach out —
 * over a one-line legal strip. The pages are one tap away in the header, so
 * they are not repeated here. Both logos are in the DOM and swapped by the
 * same CSS as the header, so the footer never depends on client state.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="wrap grid gap-8 py-8 md:grid-cols-[1.5fr_1fr]">
        <div>
          <Link href="/home" className="inline-flex">
            <Image
              src="/photos/logo/logo.png"
              alt={site.name}
              width={901}
              height={756}
              className="logo-light h-10 w-auto"
            />
            <Image
              src="/photos/logo/logo2.png"
              alt={site.name}
              width={901}
              height={756}
              className="logo-dark h-10 w-auto"
            />
            <span className="sr-only"> — home</span>
          </Link>
          <p className="mt-3 max-w-xs font-display text-2xl leading-snug text-fg">
            {site.tagline}
          </p>
          <p className="mt-1 text-sm text-muted-fg">{site.role}</p>
        </div>

        <div className="min-w-0">
          <h2 className="text-xs uppercase tracking-[0.14em] text-muted-fg">Get in touch</h2>
          <ul className="mt-3 text-sm">
            <li className="flex min-w-0 items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-muted-fg" aria-hidden="true" />
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-9 min-w-0 items-center text-fg [overflow-wrap:anywhere] underline-offset-4 hover:underline"
              >
                {site.email}
              </a>
            </li>
            <li className="flex min-w-0 items-center gap-2.5">
              <InstagramIcon className="size-4 shrink-0 text-muted-fg" />
              <a
                href={site.instagram}
                rel="me noopener noreferrer"
                target="_blank"
                className="inline-flex min-h-9 items-center text-fg underline-offset-4 hover:underline"
              >
                {handle}
                <span className="sr-only"> on Instagram</span>
              </a>
            </li>
            <li className="flex min-w-0 items-center gap-2.5">
              <MapPin className="size-4 shrink-0 text-muted-fg" aria-hidden="true" />
              <span className="inline-flex min-h-9 items-center text-muted-fg">{site.location}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap flex flex-col gap-2 border-t border-line py-3 text-xs text-muted-fg sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. All photographs are the
          photographer&rsquo;s own work.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-fg underline-offset-4 hover:underline"
        >
          Book a shoot
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </footer>
  );
}
