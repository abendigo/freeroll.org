export type Suit = 's' | 'h' | 'd' | 'c';

// rank is 2-14, 14 = Ace (kept numeric so straights/comparisons are plain arithmetic).
export interface Card {
	rank: number;
	suit: Suit;
}

const SUITS: Suit[] = ['s', 'h', 'd', 'c'];
const RANK_CHARS: Record<number, string> = {
	2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
	10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

/** e.g. { rank: 14, suit: 's' } -> "As" — the compact form stored in the DB and sent to the client. */
export function cardCode(card: Card): string {
	return `${RANK_CHARS[card.rank]}${card.suit}`;
}

export function buildDeck(): Card[] {
	const deck: Card[] = [];
	for (const suit of SUITS) {
		for (let rank = 2; rank <= 14; rank++) deck.push({ rank, suit });
	}
	return deck;
}

/**
 * Fisher-Yates using Web Crypto (available both on Cloudflare Workers and Node), not
 * Math.random — this is what makes the deal server-authoritative and un-gameable: nobody can
 * predict or replay the shuffle from the PRNG state.
 */
export function shuffle<T>(items: T[]): T[] {
	const arr = items.slice();
	for (let i = arr.length - 1; i > 0; i--) {
		const j = randomInt(i + 1);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

// Rejection sampling against a 32-bit word so the result is uniform over [0, exclusiveMax)
// with no modulo bias.
function randomInt(exclusiveMax: number): number {
	const maxUint32 = 0xffffffff;
	const limit = maxUint32 - (maxUint32 % exclusiveMax);
	let x: number;
	do {
		x = crypto.getRandomValues(new Uint32Array(1))[0];
	} while (x >= limit);
	return x % exclusiveMax;
}
