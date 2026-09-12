/**
 * What clients have said, in their own words.
 *
 * ── EMPTY ON PURPOSE ─────────────────────────────────────────────────────
 * I have not written these. Testimonials are statements by real people about
 * real work, and inventing them — even as filler — produces a fabricated
 * review that is indistinguishable from a genuine one once it ships.
 *
 * The Story page renders this section only when the array has entries, so the
 * page reads correctly while it is empty. Add three or four and it appears.
 *
 * Ask for them by email after you deliver a gallery; that is when people are
 * most willing and most specific. A sentence naming what they were worried
 * about beforehand is worth more than a paragraph of praise.
 * ─────────────────────────────────────────────────────────────────────────
 */
export type Testimonial = {
  /** Their words, unedited beyond trimming. Two or three sentences is plenty. */
  quote: string;
  /** The person's name. Attributing a quote to "a client" persuades nobody. */
  name: string;
  /** What they came for — "Family sitting, Patan" or "Feature commission". */
  context: string;
};

export const testimonials: Testimonial[] = [
  // {
  //   quote: "…",
  //   name: "…",
  //   context: "…",
  // },
];
