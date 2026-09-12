import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { nav, site } from "@/data/site";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-6 py-6 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-fg">{site.name}</p>
        </div>

        <div className="min-w-0">
          <h2 className="text-xs uppercase tracking-[0.14em] text-muted-fg">Studio</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex min-w-0 items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-fg" aria-hidden="true" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{site.studio}</span>
            </li>
            <li className="flex min-w-0 items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted-fg" aria-hidden="true" />
              <a href={`mailto:${site.email}`} className="inline-flex min-h-11 min-w-0 items-center [overflow-wrap:anywhere] hover:underline">
                {site.email}
              </a>
            </li>
            <li className="flex min-w-0 items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-muted-fg" aria-hidden="true" />
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 min-w-0 items-center [overflow-wrap:anywhere] hover:underline">
                {site.phone}
              </a>
            </li>
            <li className="flex min-w-0 items-start gap-2">
              <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-fg" aria-hidden="true" />
              <a
                href={site.instagram}
                rel="me noopener noreferrer"
                target="_blank"
                className="inline-flex min-h-11 min-w-0 items-center [overflow-wrap:anywhere] hover:underline"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h2 className="text-xs uppercase tracking-[0.14em] text-muted-fg">Pages</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 min-w-0 items-center [overflow-wrap:anywhere] hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[90rem] border-t border-line px-6 py-3 text-xs text-muted-fg sm:px-8">
        © {new Date().getFullYear()} {site.name}. All photographs are the
        photographer&rsquo;s own work.
      </div>
    </footer>
  );
}
