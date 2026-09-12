/**
 * Every package, once. /services renders the full cards from this list; the
 * home page reads the same array for its compact preview, so a price or an
 * included line never has to be typed twice — and never drifts between the
 * two pages the way two hand-copied lists eventually do.
 */
export type Package = {
  name: string;
  price: string;
  unit: string;
  summary: string;
  includes: string[];
  featured?: boolean;
};

export const packages: Package[] = [
  {
    name: "Portrait sitting",
    price: "NPR 18,000",
    unit: "one person",
    summary:
      "For one person who needs a picture that actually looks like them — a profile, a book jacket, a birthday, no reason at all.",
    includes: [
      "2–3 hours, one location of your choosing",
      "Pre-shoot call to talk through wardrobe and light",
      "A gallery of 40–60 frames within 10 days",
      "12 finished images, retouched and colour-graded",
      "Full-resolution files plus web-sized versions",
      "Personal print licence, unlimited",
    ],
  },
  {
    name: "Family & group",
    price: "NPR 32,000",
    unit: "up to 8 people",
    summary:
      "Two or more people in one frame, at home or somewhere that matters to you. Children, grandparents and reluctant teenagers all welcome.",
    includes: [
      "3 hours, up to two locations in the valley",
      "Everything in the portrait sitting",
      "25 finished images, retouched and colour-graded",
      "Individual portraits of each person included",
      "One 12×16in archival print of your chosen frame",
      "Additional people: NPR 2,500 each",
    ],
    featured: true,
  },
  {
    name: "Editorial & commercial",
    price: "NPR 55,000",
    unit: "per shoot day",
    summary:
      "Commissioned work for magazines, hospitality and brands. Half-day assignments are NPR 32,000; multi-day rates are lower per day.",
    includes: [
      "Full shoot day, up to 9 hours on location",
      "Concept call and shot list agreed in advance",
      "Assistant and lighting kit when the brief needs them",
      "Selects delivered within 48 hours, full edit in 7 days",
      "30+ finished images, retouched to spec",
      "12-month commercial licence (extensions quoted)",
    ],
  },
];
