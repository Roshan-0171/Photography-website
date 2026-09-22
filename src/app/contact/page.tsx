import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle } from "lucide-react";

import InquiryForm from "@/components/InquiryForm";
import Picture from "@/components/Picture";
import { site } from "@/data/site";
import { selfPortrait } from "@/data/photos";
import { SHOOT_TYPES } from "@/data/inquiry";

export const metadata: Metadata = {
  title: "Contact",
  description: `Enquire about a portrait, family, editorial or wedding photography and videography session with ${site.name}.`,
};

/** Services page deep-links carry ?package=… — map it onto a shoot type. */
const PACKAGE_TO_TYPE: Record<string, (typeof SHOOT_TYPES)[number]> = {
  "Portrait sitting": "Portrait sitting",
  "Family & group": "Family & group",
  "Editorial & commercial": "Editorial / commercial",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const params = await searchParams;
  const raw = Array.isArray(params.package) ? params.package[0] : params.package;
  const defaultShootType = raw ? (PACKAGE_TO_TYPE[raw] ?? "") : "";

  return (
    <div className="wrap py-12 sm:py-16">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <div className="min-w-0">
          <h1 className="text-display-1">Start an enquiry</h1>
          <p className="mt-6 max-w-prose text-lg text-muted-fg">
            Seven fields. I read them all myself and reply within two working
            days — including when the answer is that I&rsquo;m not the right
            photographer or videographer for what you have in mind.
          </p>

          <div className="mt-10">
            <InquiryForm defaultShootType={defaultShootType} />
          </div>
        </div>

        <aside className="min-w-0 lg:border-l lg:border-line lg:pl-12">
          {selfPortrait && (
            <span className="print-frame mb-10 block max-w-[14rem] p-2">
              <Picture
                photo={selfPortrait}
                sizes="224px"
                className="bg-muted"
              />
            </span>
          )}

          <h2 className="text-xs uppercase tracking-[0.14em] text-muted-fg">
            Or reach me directly
          </h2>
          <ul className="mt-6 space-y-6">
            <li className="flex min-w-0 items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center">
                <Mail className="size-5 text-muted-fg" aria-hidden="true" />
              </span>
              <a href={`mailto:${site.email}`} className="min-w-0 [overflow-wrap:anywhere] py-0.5 text-base leading-snug underline-offset-4 hover:underline">
                {site.email}
              </a>
            </li>
            <li className="flex min-w-0 items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center">
                <MapPin className="size-5 text-muted-fg" aria-hidden="true" />
              </span>
              <span className="min-w-0 py-0.5 text-base leading-snug">{site.location}</span>
            </li>
          </ul>

          {/* Opens a DM thread directly — https://ig.me/m/<username> — rather
              than just the profile, so a visitor who'd rather not fill in the
              form has a one-tap way to reach out instead. */}
          <a
            href={site.instagramDm}
            rel="noopener noreferrer"
            target="_blank"
            className="mt-8 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 border border-fg px-5 py-3 text-sm text-fg transition-colors duration-200 hover:bg-fg hover:text-bg sm:w-auto"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Message me on Instagram
          </a>

          <h2 className="mt-16 text-xs uppercase tracking-[0.14em] text-muted-fg">
            What happens next
          </h2>
          <ol className="mt-6 space-y-6 text-sm text-secondary">
            <li>
              <span className="text-muted-fg">1 — </span>I reply with
              availability and a firm quote, within two working days.
            </li>
            <li>
              <span className="text-muted-fg">2 — </span>A short call to talk
              through location, light and what you want the pictures for.
            </li>
            <li>
              <span className="text-muted-fg">3 — </span>A 30% deposit holds the
              date. It moves once, free, if plans change.
            </li>
          </ol>
        </aside>
      </div>
    </div>
  );
}
