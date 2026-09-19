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
  name: "Roh Portraits",
  role: "Photographer & Videographer",
  city: "Texas, USA",
  /** The slogan — the hero headline's second line and the footer's. */
  tagline: "Turning moments into memories",
  /** One full sentence for search results and link previews, where a
   *  four-word slogan on its own says too little. */
  description:
    "Portrait, wedding and editorial photography and videography — based in Texas, available to travel nationwide.",

  // Published in the footer, on /contact, in the JSON-LD, and it is what a
  // visitor is told to write to when an enquiry fails to send.
  email: "rohportraits@gmail.com",

  // No fixed studio address is published — the business is travel-based.
  // Shown on /contact, in /story, and in the confirmation email signature.
  location: "Texas, USA — open to travel nationwide",

  instagram: "https://instagram.com/roh_portraits",

  // Opens Instagram straight into a DM with the account above, rather than its
  // profile — used by the "Message me on Instagram" button on /contact.
  instagramDm: "https://ig.me/m/roh_portraits",

  // The live domain. Drives metadataBase, canonical URLs and Open Graph, and
  // is the domain that needs the Resend DNS records.
  url: "https://rohportraits.com",

  /** Used in the JSON-LD business record. Deliberately state-level, not a
   *  street address — there is no fixed studio to publish one for. */
  address: {
    region: "Texas",
    country: "US",
    areaServed: "United States — available to travel nationwide",
  },
} as const;

export const nav = [
  { href: "/home", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/story", label: "Story" },
  // { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;
