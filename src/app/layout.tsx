import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import Analytics from "@/components/Analytics";
import ImageLoadReveal from "@/components/ImageLoadReveal";
import ImageProtection from "@/components/ImageProtection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/data/site";
import "./globals.css";

/* Cormorant for titles — a light, high-contrast Garamond with the feel of a
   film title card — over Inter for everything read at body size, where a
   quiet sans lets the photographs carry the mood. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}, ${site.city}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  jobTitle: site.role,
  email: site.email,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  areaServed: site.address.areaServed,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The inline script below writes data-theme onto this element before React
      // hydrates. React never renders that attribute, so it must be told not to
      // treat the difference as a mismatch.
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} h-full`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Two-pixel reading-progress hairline along the top edge, driven by
            the page scroll in CSS. Purely decorative; hidden without support. */}
        <div aria-hidden="true" className="scroll-progress" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ImageProtection />
        <ImageLoadReveal />
        <Analytics />
        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
