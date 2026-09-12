import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No next/image configuration: every derivative is generated ahead of time by
  // scripts/build-photos.mjs and served straight from /public, so no image
  // optimiser runs at request time.
  poweredByHeader: false,

  // PGlite backs the local development database and is a devDependency. It is
  // loaded through a runtime specifier in src/lib/inquiry-store.ts rather than
  // being listed here, because an external package is still resolved at build
  // time — which breaks a production install that has pruned devDependencies.
};

export default nextConfig;
