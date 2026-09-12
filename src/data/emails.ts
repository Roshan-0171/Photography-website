/**
 * ALL ENQUIRY EMAIL COPY LIVES IN THIS FILE.
 *
 * You can edit everything below without touching any other file. The parts in
 * ${curly braces} are filled in from the enquiry — leave those spelled exactly
 * as they are and they will be replaced with the real values. Everything else
 * is plain prose: rewrite it however you like.
 *
 * Plain text only. It is sent as text and converted to simple HTML paragraphs
 * automatically, so blank lines become paragraph breaks and nothing else needs
 * doing.
 */

import { site } from "./site";

/** How long you actually take to reply. Used in the confirmation email. */
export const RESPONSE_TIME = "two working days";

export type InquiryValues = {
  name: string;
  email: string;
  shootType: string;
  /** ISO date, or empty when none was given. */
  date: string;
  /** "on" when the enquirer said they have no date yet. */
  flexible: string;
  budget: string;
  message: string;
};

/**
 * "2026-03-14" → "Sat 14 Mar 2026".
 * Says plainly which kind of "no date" this is, so you can tell someone who is
 * genuinely open from someone who simply skipped the field.
 */
function readableDate(v: InquiryValues): string {
  const iso = v.date;
  if (v.flexible === "on") return "flexible — no date yet";
  if (!iso) return "not given";
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

// ---------------------------------------------------------------------------
// 1. NOTIFICATION — goes to you. The subject is built to be scannable in a
//    crowded inbox, so the shoot type and date come first.
// ---------------------------------------------------------------------------

export function notificationEmail(v: InquiryValues) {
  const when = readableDate(v);

  const subject = `Enquiry · ${v.shootType} · ${when} · ${v.name}`;

  const body = `
${v.name} has sent an enquiry through the website.

Shoot type:  ${v.shootType}
Date:        ${when}
Budget:      ${v.budget}
Email:       ${v.email}

What they wrote:

${v.message}

Hit reply to answer them directly — this email is already addressed back to ${v.email}.
`;

  return { subject, body: body.trim() };
}

// ---------------------------------------------------------------------------
// 2. CONFIRMATION — goes to the person who enquired. Keep it short and human.
//    Say what actually happens next, and when.
// ---------------------------------------------------------------------------

export function confirmationEmail(v: InquiryValues) {
  const subject = `Thanks for your enquiry — ${site.name}`;

  const body = `
Dear ${v.name},

Thank you for writing. Your enquiry about a ${v.shootType.toLowerCase()} has reached me and I have read it.

I reply to every enquiry myself, within ${RESPONSE_TIME}. If the date you mentioned is already booked I will say so straight away and suggest the nearest one I have. If I am not the right photographer for what you have in mind, I will tell you that too.

There is nothing you need to do in the meantime.

${site.name}
${site.role}
${site.studio}
${site.email}
`;

  return { subject, body: body.trim() };
}

// ---------------------------------------------------------------------------
// Nothing below this line is copy. You can stop reading here.
// ---------------------------------------------------------------------------

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Blank-line-separated blocks become paragraphs; single newlines become <br>. */
export function toHtml(body: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#171717;">${paragraphs}</div>`;
}
