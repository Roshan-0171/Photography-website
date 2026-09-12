import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminLogin from "@/components/AdminLogin";
import { isSignedIn } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Sign in" };

/** The sign-in portal. Already signed in? Straight through to the list. */
export default async function AdminSignInPage() {
  if (await isSignedIn()) redirect("/admin/enquiries");

  return (
    <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-8">
      <h1 className="text-3xl sm:text-4xl">Sign in</h1>
      <p className="mt-4 max-w-prose text-muted-fg">
        The enquiries list holds people&rsquo;s contact details. It is only
        available to you.
      </p>
      <div className="mt-12">
        <AdminLogin />
      </div>
    </div>
  );
}
