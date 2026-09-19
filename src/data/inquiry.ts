/**
 * Shared shape and option lists for the enquiry form.
 *
 * Deliberately NOT in actions.ts: a "use server" module may only export async
 * functions. Constants declared there are stripped from the client/SSR build and
 * arrive as undefined, which takes the whole page down with it.
 */

export type InquiryState = {
  /**
   * idle    — nothing submitted yet
   * error   — the visitor's input needs fixing; errors are populated
   * failed  — input was fine but we could not accept or deliver it; `message`
   *           explains, and the UI offers the studio email as a way through
   * success — the notification email reached the photographer
   */
  status: "idle" | "error" | "failed" | "success";
  errors: Record<string, string>;
  values: Record<string, string>;
  /** Shown on `failed`. Never mentions which defence rejected the submission. */
  message?: string;
};

export const emptyInquiry: InquiryState = {
  status: "idle",
  errors: {},
  values: {},
};

/**
 * Shown for BOTH a tripped honeypot and an exhausted rate limit. The two must
 * stay word-for-word identical: a bot that can tell them apart learns which
 * defence to work around.
 */
export const REJECTED_MESSAGE =
  "We could not accept this enquiry. Please email the studio directly and it will be picked up from there.";

/** Shown when the enquiry was good but the notification email did not go out. */
export const DELIVERY_FAILED_MESSAGE =
  "Something went wrong on our side and your enquiry was not delivered. Nothing you did caused this. Please email the studio directly — that address is monitored.";

export const SHOOT_TYPES = [
  "Portrait sitting",
  "Family & group",
  "Editorial / commercial",
  "Wedding or event",
  "Something else",
] as const;

export const BUDGETS = [
  "Under 1,000$", 
  "1,000$ – 5,000$",
  "5,000$ and above",
  "Not sure yet",
] as const;

export const FIELD_LABELS: Record<string, string> = {
  name: "Your name",
  email: "Email",
  phone: "Phone number",
  shootType: "Kind of shoot",
  date: "Preferred date",
  budget: "Budget range",
  message: "About the shoot",
};
