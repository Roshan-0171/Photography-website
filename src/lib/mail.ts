import { Resend } from "resend";

import { notificationEmail, toHtml, type InquiryValues } from "@/data/emails";
import { site } from "@/data/site";

/** Testing switch, ignored in production so it cannot be left on by accident. */
const devOnly = (name: string) =>
  process.env.NODE_ENV !== "production" && process.env[name] === "1";

export async function send(opts: {
  kind: "notification" | "confirmation";
  to: string;
  replyTo?: string;
  subject: string;
  body: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM;

  // Deliberate failure, for seeing the error states without breaking anything.
  // "1" fails every send; "confirmation" fails only the courtesy email, which
  // is how you check that a failed confirmation does not fail the enquiry.
  const forced =
    process.env.NODE_ENV !== "production" ? process.env.INQUIRY_FORCE_FAIL : undefined;
  if (forced === "1" || forced === opts.kind)
    throw new Error(`INQUIRY_FORCE_FAIL=${forced}`);

  // Dry run: print the composed email instead of sending it. Useful for editing
  // the copy in src/data/emails.ts without spending sends.
  if (devOnly("INQUIRY_DRY_RUN")) {
    console.info(
      `[inquiry] DRY RUN — not sent\n  to:      ${opts.to}\n  replyTo: ${opts.replyTo ?? "—"}\n  subject: ${opts.subject}\n\n${opts.body}\n`,
    );
    return { id: "dry-run" };
  }

  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  if (!from) throw new Error("INQUIRY_FROM is not set");

  const { data, error } = await new Resend(apiKey).emails.send({
    from,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.body,
    html: toHtml(opts.body),
  });

  // The SDK reports delivery problems in `error` rather than by throwing.
  if (error) throw new Error(`${error.name}: ${error.message}`);
  return data;
}

/** The notification to the photographer. Used by the form and by admin "resend". */
export async function sendNotification(values: InquiryValues) {
  const notification = notificationEmail(values);
  return send({
    kind: "notification",
    to: process.env.INQUIRY_TO || site.email,
    replyTo: values.email,
    subject: notification.subject,
    body: notification.body,
  });
}
