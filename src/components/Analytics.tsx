import Script from "next/script";

/**
 * Privacy-friendly analytics, off unless configured.
 *
 * Renders nothing at all until NEXT_PUBLIC_ANALYTICS_DOMAIN is set, so the site
 * ships with no third-party script by default. Plausible sets no cookies and
 * collects no personal data, which is why this needs no consent banner — swap
 * the src for a self-hosted instance if you would rather not use theirs.
 *
 * What it is for: knowing which gallery a booking came from. The enquiry form
 * fires an "Enquiry sent" goal on success, so you can see the whole path.
 */
export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.outbound-links.js"
      strategy="afterInteractive"
    />
  );
}
