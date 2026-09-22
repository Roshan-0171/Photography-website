/**
 * Testimonials shown on the site.
 *
 * Add real client quotes here after receiving permission to publish them.
 */
export type Testimonial = {
  /** Their words, unedited beyond trimming. Two or three sentences is plenty. */
  quote: string;
  /** The person's name. Attributing a quote to "a client" persuades nobody. */
  name: string;
  /** What they came for — "Family sitting, Patan" or "Feature commission". */
  context: string;
};

export const testimonials: Testimonial[] = [];
