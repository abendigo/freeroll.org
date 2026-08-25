import epTablesJson from './ep-tables.json';
import type { Category } from './evaluator';
import type { Street } from './streets';

type StreetTable = Partial<Record<Street, number>>;

// Generated offline by scripts/generate-ep-tables.ts (Monte Carlo over real hole+board deals —
// see that file's header for why). Re-run that script and commit the refreshed JSON if the
// evaluator's category logic ever changes.
const epTables = epTablesJson as unknown as Record<number, StreetTable>;

/** P(a random player first reaches `category` on `street`), or undefined if that combination is
 *  impossible (e.g. Flush can't be "first reached" preflop — only 2 cards are visible then). */
export function firstReachProbability(category: Category, street: Street): number | undefined {
	return epTables[category]?.[street];
}

/** Surprisal in bits: -log2(p). This is the EP a player earns for first reaching `category` on
 *  `street` — rarer (lower p) means more EP, and reaching a big hand earlier is always rarer
 *  than reaching it later, so flopped beats rivered automatically. */
export function surprisal(p: number): number {
	return -Math.log2(p);
}
