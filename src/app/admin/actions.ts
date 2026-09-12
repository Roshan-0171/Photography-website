"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { checkPassword, createSession, destroySession, isEnabled } from "@/lib/admin-auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

/**
 * Five attempts an hour per IP. A real person mistypes twice; anyone working
 * through a password list needs thousands, and this makes that take years. The
 * bucket is separate from the enquiry form's, so a locked-out guesser cannot
 * also block genuine enquiries.
 */
export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isEnabled()) return { error: "The admin page is not configured." };

  const ip = clientKey(await headers());
  const limit = await rateLimit(`admin:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });

  if (!limit.allowed) {
    console.warn("[admin] sign-in rate limited", { ip });
    // Same wording as a wrong password: a guesser learns nothing from being
    // told they have been throttled.
    return { error: "That password is not correct." };
  }

  if (!checkPassword(String(formData.get("password") ?? ""))) {
    console.warn("[admin] failed sign-in", { ip });
    return { error: "That password is not correct." };
  }

  await createSession();
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/admin");
}
