"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isSignedIn } from "@/lib/admin-auth";
import { getInquiry, isStatus, markNotified, setStatus } from "@/lib/inquiry-store";
import { sendNotification } from "@/lib/mail";

/**
 * Server actions are reachable by anyone who can construct the request, not
 * only by the page that renders the buttons — so every one of them re-checks
 * the session itself rather than trusting that the page already did.
 *
 * A failed check redirects to the sign-in portal rather than throwing: the
 * mutation is refused either way, but a session that expired while the page
 * was open should land you on the sign-in form, not on an error screen.
 */
async function requireAdmin() {
  if (!(await isSignedIn())) redirect("/admin");
}

const idFrom = (formData: FormData) => {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) throw new Error("Bad id");
  return id;
};

export async function updateStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const status = formData.get("status");
  if (!isStatus(status)) throw new Error("Bad status");
  await setStatus(idFrom(formData), status);
  revalidatePath("/admin/enquiries");
}

/**
 * Re-sends the notification for a stored enquiry whose email never went out —
 * the red-flagged ones. Goes through the same transport as the form, so it
 * fails for the same reasons and succeeds under the same configuration.
 */
export async function resendNotification(formData: FormData): Promise<void> {
  await requireAdmin();
  const row = await getInquiry(idFrom(formData));
  if (!row) throw new Error("No such enquiry");

  await sendNotification({
    name: row.name,
    email: row.email,
    shootType: row.shoot_type,
    date: row.preferred_date ? String(row.preferred_date).slice(0, 10) : "",
    flexible: row.flexible ? "on" : "",
    budget: row.budget,
    message: row.message,
  });
  await markNotified(row.id);
  revalidatePath("/admin/enquiries");
}
