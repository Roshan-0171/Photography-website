"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { categories } from "@/data/photos";

const VALID = new Set<string>(categories.map((c) => c.id));

/**
 * Old links point at /work#portrait etc. — anchors from before this page
 * became a query-string filter. A URL fragment is never sent to the server, so
 * there is no way to redirect it there; this is the client-side equivalent,
 * run once on mount.
 *
 * It genuinely cannot be flash-free the way the ?type= route is: the browser
 * has already painted the unfiltered page (or jumped to the in-page anchor,
 * which still exists) before this effect fires and swaps the URL. That
 * trade-off is inherent to fragments, not a shortcut taken here — it only
 * matters for old bookmarks and backlinks, since every link inside this site
 * now points at ?type= directly.
 */
export default function WorkHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (VALID.has(id)) router.replace(`/work?type=${id}`);
  }, [router]);

  return null;
}
