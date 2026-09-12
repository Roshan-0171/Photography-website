import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isEnabled } from "@/lib/admin-auth";

/**
 * Everything under /admin inherits this: never indexed, never cached, and
 * absent entirely unless ADMIN_PASSWORD is set. An unconfigured deployment has
 * no sign-in surface to probe — the whole subtree is a 404.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!isEnabled()) notFound();
  return children;
}
