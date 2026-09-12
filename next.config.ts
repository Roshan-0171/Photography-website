import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No next/image configuration: every derivative is generated ahead of time by
  // scripts/build-photos.mjs and served straight from /public, so no image
  // optimiser runs at request time.
  poweredByHeader: false,
};

export default nextConfig;
