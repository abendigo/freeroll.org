import type { Card } from './cards';

// Ordinal values double as a comparable rank: higher number = stronger category. Royal Flush
// is kept distinct from Straight Flush (rather than just "Ace-high straight flush") because
// DLE.md treats it as its own Mythic-tier badge with its own (much larger) EP value.
export const CATEGORY = {
	HighCard: 0,
	Pair: 1,
	TwoPair: 2,
	Trips: 3,
	Straight: 4,
	Flush: 5,
	FullHouse: 6,
	Quads: 7,
	StraightFlush: 8,
	RoyalFlush: 9
} as const;

export type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

export const CATEGORY_NAMES: Record<Category, string> = {
	0: 'High Card',
	1: 'Pair',
	2: 'Two Pair',
	3: 'Trips',
	4: 'Straight',
	5: 'Flush',
	6: 'Full House',
	7: 'Quads',
	8: 'Straight Flush',
	9: 'Royal Flush'
};

/**
 * Evaluates exactly 5 cards down to a category. No kicker/tiebreak beyond that — this slice
 * only needs the category (for EP surprisal and the headline "Full House" display); comparing
 * two hands of the *same* category is a later slice's problem (badges like "flopped it").
 */
export function evaluate5(cards: Card[]): Category {
	if (cards.length !== 5) throw new Error(`evaluate5 needs exactly 5 cards, got ${cards.length}`);

	const counts = new Map<number, number>();
	for (const c of cards) counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
	const groupSizes = [...counts.values()].sort((a, b) => b - a);

	const isFlush = cards.every((c) => c.suit === cards[0].suit);

	const uniqueRanks = [...new Set(cards.map((c) => c.rank))].sort((a, b) => a - b);
	let isStraight = false;
	let straightHigh = 0;
	if (uniqueRanks.length === 5) {
		if (uniqueRanks[4] - uniqueRanks[0] === 4) {
			isStraight = true;
			straightHigh = uniqueRanks[4];
		} else if (uniqueRanks.join(',') === '2,3,4,5,14') {
			// The wheel: A-2-3-4-5, Ace plays low.
			isStraight = true;
			straightHigh = 5;
		}
	}

	if (isStraight && isFlush) return straightHigh === 14 ? CATEGORY.RoyalFlush : CATEGORY.StraightFlush;
	if (groupSizes[0] === 4) return CATEGORY.Quads;
	if (groupSizes[0] === 3 && groupSizes[1] === 2) return CATEGORY.FullHouse;
	if (isFlush) return CATEGORY.Flush;
	if (isStraight) return CATEGORY.Straight;
	if (groupSizes[0] === 3) return CATEGORY.Trips;
	if (groupSizes[0] === 2 && groupSizes[1] === 2) return CATEGORY.TwoPair;
	if (groupSizes[0] === 2) return CATEGORY.Pair;
	return CATEGORY.HighCard;
}

function combinations5<T>(items: T[]): T[][] {
	const result: T[][] = [];
	const n = items.length;
	for (let a = 0; a < n - 4; a++)
		for (let b = a + 1; b < n - 3; b++)
			for (let c = b + 1; c < n - 2; c++)
				for (let d = c + 1; d < n - 1; d++)
					for (let e = d + 1; e < n; e++) result.push([items[a], items[b], items[c], items[d], items[e]]);
	return result;
}

/**
 * Best achievable category out of 2, 5, 6, or 7 cards — i.e. what a player's hand looks like at
 * any given street. 2 cards (preflop) is a special case: nothing but Pair/High Card is possible
 * with only two cards, so there's no 5-card evaluation to run yet.
 */
export function bestCategory(cards: Card[]): Category {
	if (cards.length === 2) {
		return cards[0].rank === cards[1].rank ? CATEGORY.Pair : CATEGORY.HighCard;
	}
	if (cards.length < 5) throw new Error(`bestCategory needs 2 or >=5 cards, got ${cards.length}`);

	let best: Category = CATEGORY.HighCard;
	for (const hand of combinations5(cards)) {
		const cat = evaluate5(hand);
		if (cat > best) best = cat;
	}
	return best;
}
