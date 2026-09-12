/**
 * Single source of truth for everything name- and contact-shaped.
 * Change the photographer's details here and they propagate site-wide:
 * header, footer, page metadata, JSON-LD, both enquiry emails, and the
 * fallback address shown when an enquiry fails to send.
 *
 * ── PLACEHOLDER ──────────────────────────────────────────────────────────
 * Values marked PLACEHOLDER below are invented and must be replaced before
 * launch. They are internally consistent (the domain matches the name, the
 * email matches the domain) so nothing contradicts itself in the meantime,
 * but none of them are real.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const site = {
  name: "Rohit Shrestha",
  role: "Portrait & Editorial Photographer",
  city: "Kathmandu, Nepal",
  tagline: "Portraits made slowly, in the light people actually live in.",

  // PLACEHOLDER — must be a mailbox you actually read. It is published in the
  // footer, on /contact, in the JSON-LD, and it is what a visitor is told to
  // write to when an enquiry fails to send.
  email: "roshan.star180@gmail.com",

  // PLACEHOLDER — a real, reachable number.
  phone: "+977 9800 000 000",

  studio: "Jhamsikhel, Lalitpur — by appointment",

  // PLACEHOLDER — a real profile URL, or delete the footer link that uses it.
  instagram: "https://instagram.com/",

  // PLACEHOLDER — the live domain. Drives metadataBase, canonical URLs and
  // Open Graph, and is the domain that needs the Resend DNS records.
  url: "https://rohitshrestha.com",

  /** Used in the JSON-LD business record. Should match `studio` above. */
  address: {
    locality: "Lalitpur",
    region: "Bagmati",
    country: "NP",
    areaServed: "Kathmandu Valley",
  },
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/story", label: "Story" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;
