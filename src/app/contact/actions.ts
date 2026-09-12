"use server";

import { headers } from "next/headers";

import {
  BUDGETS,
  DELIVERY_FAILED_MESSAGE,
  REJECTED_MESSAGE,
  SHOOT_TYPES,
  type InquiryState,
} from "@/data/inquiry";
import { confirmationEmail, type InquiryValues } from "@/data/emails";
import { send, sendNotification } from "@/lib/mail";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isConfigured as storeConfigured, markSent, saveInquiry } from "@/lib/inquiry-store";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Every field is re-checked here regardless of what the browser did. Client
 * validation is a convenience for the visitor; nothing arriving from it is
 * trusted.
 */
function validate(values: InquiryValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.name) errors.name = "Please tell me what to call you.";

  if (!values.email) errors.email = "I need an email address to reply to.";
  else if (!EMAIL.test(values.email))
    errors.email = "That doesn't look like a complete email address.";

  if (!values.shootType) errors.shootType = "Choose the closest kind of shoot.";
  else if (!SHOOT_TYPES.includes(values.shootType as (typeof SHOOT_TYPES)[number]))
    errors.shootType = "Choose one of the listed options.";

  if (!values.budget)
    errors.budget = "Pick a range — “Not sure yet” is a fine answer.";
  else if (!BUDGETS.includes(values.budget as (typeof BUDGETS)[number]))
    errors.budget = "Choose one of the listed options.";

  if (values.date && Number.isNaN(Date.parse(values.date)))
    errors.date = "Enter the date as year-month-day, or leave it blank.";

  if (!values.message) errors.message = "A sentence or two about the shoot, please.";
  else if (values.message.length < 10)
    errors.message = "A little more detail would help — a sentence or two.";

  return errors;
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  // "flexible" is the visitor saying they have no date yet. It wins over
  // whatever is in the date input — a disabled control is a client-side
  // courtesy, so the meaning is decided here, not in the browser.
  const flexible = get("flexible") === "on";

  const values: InquiryValues = {
    name: get("name"),
    email: get("email"),
    shootType: get("shootType"),
    date: flexible ? "" : get("date"),
    flexible: flexible ? "on" : "",
    budget: get("budget"),
    message: get("message"),
  };

  const ip = clientKey(await headers());

  // Layer 1 — honeypot. Bots fill every field they find; humans never see this
  // one. Checked first so spam never consumes a real visitor's rate-limit quota.
  if (get("company")) {
    console.info("[inquiry] honeypot tripped", { ip });
    return { status: "failed", errors: {}, values: {}, message: REJECTED_MESSAGE };
  }

  // Layer 2 — per-IP sliding window. Deliberately returns the identical message
  // to the honeypot above, so neither defence can be identified from outside.
  const limit = await rateLimit(ip);
  if (!limit.allowed) {
    console.warn("[inquiry] rate limited", { ip });
    return { status: "failed", errors: {}, values, message: REJECTED_MESSAGE };
  }

  const errors = validate(values);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values };
  }

  /**
   * An enquiry survives if EITHER the database row or the notification email
   * lands. Both are attempted; only losing both is a real failure.
   *
   * This widens the original rule, which treated the notification email as the
   * enquiry outright. That was correct when the inbox was the only record — it
   * is needlessly strict now that a row in Postgres is just as durable, and it
   * would turn a Resend outage into a lost booking. With no DATABASE_URL set,
   * `saveInquiry` returns null and the old behaviour applies unchanged.
   */
  let rowId: number | null = null;
  try {
    rowId = await saveInquiry(values, ip);
  } catch (error) {
    console.error("[inquiry] database write failed", { ip, error });
  }

  let notified = false;
  try {
    await sendNotification(values);
    notified = true;
  } catch (error) {
    /**
     * The payload is written to the log ONLY when there is no stored row — in
     * that case the log is the last copy of the enquiry and losing it loses a
     * booking. When the row exists the row is the record, so the log carries an
     * id instead: personal data should not sit in runtime logs, which are read
     * by anyone with access to the hosting project.
     */
    if (rowId) {
      console.error(
        `[inquiry] notification email failed. The enquiry IS stored as row ${rowId} — ` +
          `read it with \`npm run inquiries\`.`,
        { ip, error },
      );
    } else {
      console.error(
        "[inquiry] NOTIFICATION SEND FAILED and nothing was stored — enquiry NOT " +
          "delivered. Full payload follows because this log is now its only copy.",
        { ip, values, error },
      );
    }
  }

  if (!notified && rowId === null) {
    if (storeConfigured()) {
      console.error("[inquiry] both the database write and the email failed", { ip });
    }
    return {
      status: "failed",
      errors: {},
      values,
      message: DELIVERY_FAILED_MESSAGE,
    };
  }

  // The confirmation is a courtesy. Its failure does not undo the enquiry, so
  // the visitor is not punished for it — it is logged and we carry on.
  const confirmation = confirmationEmail(values);
  let confirmed = true;
  try {
    await send({
      kind: "confirmation",
      to: values.email,
      subject: confirmation.subject,
      body: confirmation.body,
    });
  } catch (error) {
    confirmed = false;
    console.warn(
      "[inquiry] confirmation email failed — the enquiry itself WAS delivered",
      { to: values.email, error },
    );
  }

  // Record what actually went out, so a stored enquiry says whether you were
  // ever told about it. Never allowed to affect the visitor's reply.
  if (rowId !== null) {
    try {
      await markSent(rowId, notified, confirmed);
    } catch (error) {
      console.warn("[inquiry] could not record send status", { rowId, error });
    }
  }

  return { status: "success", errors: {}, values: {} };
}
