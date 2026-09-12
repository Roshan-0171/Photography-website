/**
 * Height-balanced column distribution.
 *
 * CSS multi-column fills top-down and only approximates balance once the blocks
 * inside it cannot be broken, which is why the third Portrait column kept coming
 * out nearly empty. This assigns each photograph to a column using its stored
 * aspect ratio to know how tall it will render.
 *
 * Heights are relative, not pixels: every column in a row is the same width, so
 * a photograph's rendered height is proportional to `1 / aspectRatio`. The
 * result is therefore independent of viewport size — the same input always
 * produces the same layout, on the server and on the client, so there is nothing
 * for hydration to disagree about.
 *
 * Two passes:
 *   1. Greedy — walk the photographs in order, each into the shortest column.
 *   2. Refine — repeatedly move or swap photographs between the tallest and
 *      shortest columns while that narrows the spread.
 *
 * Greedy alone is order-dependent and can finish well out of balance (it left
 * one column 1.3 tile-heights short on a seven-photograph gallery). The refine
 * pass fixes that without resorting the gallery: photographs are re-inserted in
 * their original order, so each column still reads top-to-bottom in sequence.
 *
 * Determinism comes from scanning candidates in fixed order and breaking every
 * tie toward the lowest index — never from randomness or measurement.
 */

/**
 * Fixed vertical cost per tile as a fraction of column width: the gap below it,
 * its metadata line, and the mat board and frame edge around the print. All are
 * the same for every tile, so counting them keeps the balance honest.
 */
const GAP = 0.22;

/** Enough to settle any realistic gallery; bounds the worst case regardless. */
const MAX_PASSES = 200;

type Sized = { aspectRatio: number };
type Slot<T> = { item: T; order: number; height: number };

const totalHeight = <T,>(column: Slot<T>[]) =>
  column.reduce((sum, slot) => sum + slot.height + GAP, 0);

const spreadOf = <T,>(columns: Slot<T>[][]) => {
  const heights = columns.map(totalHeight);
  return Math.max(...heights) - Math.min(...heights);
};

/** Keep each column in the gallery's own order, so it still reads in sequence. */
const insertInOrder = <T,>(column: Slot<T>[], slot: Slot<T>) => {
  const at = column.findIndex((s) => s.order > slot.order);
  if (at === -1) column.push(slot);
  else column.splice(at, 0, slot);
};

export function balanceColumns<T extends Sized>(
  items: readonly T[],
  columns: number,
): T[][] {
  if (columns < 1) return [];
  if (columns === 1) return [items.slice()];

  const slots: Slot<T>[] = items.map((item, order) => ({
    item,
    order,
    // Guard a zero or missing ratio rather than producing Infinity.
    height: 1 / (item.aspectRatio > 0 ? item.aspectRatio : 1),
  }));

  const result: Slot<T>[][] = Array.from({ length: columns }, () => []);

  // Pass 1 — greedy.
  for (const slot of slots) {
    let shortest = 0;
    for (let i = 1; i < columns; i += 1) {
      if (totalHeight(result[i]) < totalHeight(result[shortest])) shortest = i;
    }
    result[shortest].push(slot);
  }

  // Pass 2 — refine.
  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    const heights = result.map(totalHeight);
    let tall = 0;
    let short = 0;
    for (let i = 1; i < columns; i += 1) {
      if (heights[i] > heights[tall]) tall = i;
      if (heights[i] < heights[short]) short = i;
    }
    if (tall === short) break;

    const before = spreadOf(result);
    let best: { spread: number; apply: () => void } | null = null;

    // Try moving one photograph from the tallest column to the shortest.
    for (let i = 0; i < result[tall].length; i += 1) {
      const moved = result[tall][i];
      const trial = result.map((col) => col.slice());
      trial[tall].splice(i, 1);
      insertInOrder(trial[short], moved);
      const spread = spreadOf(trial);
      if (spread < (best?.spread ?? before) - 1e-9) {
        best = {
          spread,
          apply: () => {
            result[tall] = trial[tall];
            result[short] = trial[short];
          },
        };
      }
    }

    // Then try swapping a pair, which can balance where no single move does.
    for (let i = 0; i < result[tall].length; i += 1) {
      for (let j = 0; j < result[short].length; j += 1) {
        const a = result[tall][i];
        const b = result[short][j];
        if (b.height >= a.height) continue; // only a smaller-for-larger swap helps
        const trial = result.map((col) => col.slice());
        trial[tall].splice(i, 1);
        trial[short].splice(j, 1);
        insertInOrder(trial[tall], b);
        insertInOrder(trial[short], a);
        const spread = spreadOf(trial);
        if (spread < (best?.spread ?? before) - 1e-9) {
          best = {
            spread,
            apply: () => {
              result[tall] = trial[tall];
              result[short] = trial[short];
            },
          };
        }
      }
    }

    if (!best) break;
    best.apply();
  }

  return result.map((column) => column.map((slot) => slot.item));
}
