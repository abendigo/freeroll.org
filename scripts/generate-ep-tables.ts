/**
 * Offline precompute: for each hand category and each street, what's the probability that a
 * random player *first* reaches that category on that street? (Category is monotonic
 * non-decreasing as more cards are revealed, so "first reach" is well-defined.) DLE.md's EP
 * formula is `EP += -log2(P(reach category C for the first time at street S))`; this script
 * estimates that P via Monte Carlo simulation over real hole+board deals (not just marginal
 * 5-card-hand odds — it has to respect that a pocket pair already counts as "Pair" before the
 * flop even lands), then bakes the result into ep-tables.json for the app to load at runtime.
 * DLE.md explicitly allows combinatorics *or* Monte Carlo for this — Monte Carlo was simpler to
 * get right here since it naturally captures that conditional structure.
 *
 * Run with: npx tsx scripts/generate-ep-tables.ts
 */
import { writeFileSync } from 'node:fs';
import { buildDeck, type Card } from '../src/lib/server/game/cards';
import { bestCategory, CATEGORY } from '../src/lib/server/game/evaluator';
import { cardsAtStreet, STREETS, type Street } from '../src/lib/server/game/streets';

const TRIALS = 4_000_000;
const CATEGORY_COUNT = 10; // HighCard..RoyalFlush

// Reusable 52-card deck; each trial does a truncated Fisher-Yates over it (only the first 7
// positions need to end up random — this is the standard "repeated partial shuffle" trick for
// fast Monte Carlo dealing, far cheaper than allocating a fresh deck per trial).
const deck: Card[] = buildDeck();

function randomInt(exclusiveMax: number): number {
	return Math.floor(Math.random() * exclusiveMax);
}

function dealTrial(): Card[] {
	for (let i = 0; i < 7; i++) {
		const j = i + randomInt(deck.length - i);
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck.slice(0, 7);
}

// counts[category][street] = number of trials where `category` was first reached on `street`.
const counts: number[][] = Array.from({ length: CATEGORY_COUNT }, () => STREETS.map(() => 0));

console.log(`Simulating ${TRIALS.toLocaleString()} deals...`);
const start = Date.now();

for (let t = 0; t < TRIALS; t++) {
	const cards = dealTrial();
	const hole = cards.slice(0, 2);
	const board = cards.slice(2, 7);

	let bestSoFar = CATEGORY.HighCard as number;
	for (const street of STREETS) {
		const cat = bestCategory(cardsAtStreet(hole, board, street));
		if (cat > bestSoFar) {
			counts[cat][STREETS.indexOf(street)]++;
			bestSoFar = cat;
		}
	}

	if (t > 0 && t % 500_000 === 0) console.log(`  ${t.toLocaleString()}...`);
}

console.log(`Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);

// Laplace smoothing (+1) so a category/street combo with zero samples (the rarest cells, e.g.
// "flopped a royal", get very few hits even at 4M trials) still yields a finite probability
// instead of -log2(0) = Infinity EP. Negligible effect on well-sampled cells.
type StreetTable = Partial<Record<Street, number>>;
const table: Record<number, StreetTable> = {};

for (let cat = CATEGORY.Pair; cat <= CATEGORY.RoyalFlush; cat++) {
	const streetTable: StreetTable = {};
	for (let s = 0; s < STREETS.length; s++) {
		const street = STREETS[s];
		// Pair/High Card can legitimately be "first reached" at preflop; nothing above Pair can
		// (only 2 cards are visible), so skip emitting those impossible cells entirely.
		if (cat > CATEGORY.Pair && street === 'preflop') continue;
		const p = (counts[cat][s] + 1) / (TRIALS + CATEGORY_COUNT);
		streetTable[street] = p;
	}
	table[cat] = streetTable;
}

const outPath = new URL('../src/lib/server/game/ep-tables.json', import.meta.url);
writeFileSync(outPath, JSON.stringify(table, null, '\t') + '\n');
console.log(`Wrote ${outPath.pathname}`);

// Sanity printout: total EP if you happened to reach each category for the first time on each
// street, so a human can eyeball that flopping a big hand scores far more than rivering it.
console.log('\nEP by (category, first-reached street):');
for (let cat = CATEGORY.Pair; cat <= CATEGORY.RoyalFlush; cat++) {
	const row = STREETS.map((s) => {
		const p = table[cat][s];
		return p === undefined ? '   -   ' : (-Math.log2(p)).toFixed(2).padStart(7);
	});
	console.log(`  ${cat}: ${row.join('  ')}`);
}
