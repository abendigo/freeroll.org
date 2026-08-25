import type { Kysely } from 'kysely';
import type { AppDatabase } from '../db';
import { buildDeck, cardCode, shuffle, type Card } from './cards';
import { bestCategory, CATEGORY, CATEGORY_NAMES, type Category } from './evaluator';
import { firstReachProbability, surprisal } from './ep-tables';
import { cardsAtStreet, STREETS, type Street } from './streets';

export interface StreetResult {
	category: string;
	/** EP earned on this street — 0 unless the best category actually improved here. */
	ep: number;
}

export interface ScoredDeal {
	holeCards: string[];
	board: string[];
	perStreetEp: Record<Street, StreetResult>;
	totalEp: number;
	handRank: string;
	/** True when this identity already had a deal committed today — the client uses this to
	 *  skip straight to the final result instead of replaying the ~30s reveal on every reload. */
	alreadyDealt: boolean;
}

/** Shuffles a fresh deck and deals 2 hole cards + a 5-card board. Pure/random — the actual
 *  commit-once-per-day guarantee lives in dealForIdentity below, not here. */
function dealCards(): { hole: Card[]; board: Card[] } {
	const deck = shuffle(buildDeck());
	return { hole: deck.slice(0, 2), board: deck.slice(2, 7) };
}

/**
 * Scores a committed deal street by street, per DLE.md: EP = surprisal (-log2 probability) of
 * *first* reaching a hand category, added only when the category actually improves. Category is
 * monotonic non-decreasing as more cards are revealed, so "improves" is unambiguous.
 */
function scoreDeal(hole: Card[], board: Card[]): { perStreetEp: Record<Street, StreetResult>; totalEp: number; handRank: string } {
	const perStreetEp = {} as Record<Street, StreetResult>;
	let totalEp = 0;
	let bestSoFar: Category = CATEGORY.HighCard;

	for (const street of STREETS) {
		const cat = bestCategory(cardsAtStreet(hole, board, street));
		let ep = 0;
		if (cat > bestSoFar) {
			const p = firstReachProbability(cat, street);
			// Every reachable (category, street) pair is present in the generated table; a
			// missing entry means the evaluator and the table have drifted apart.
			if (p === undefined) throw new Error(`No EP table entry for category ${cat} at ${street}`);
			ep = surprisal(p);
			totalEp += ep;
			bestSoFar = cat;
		}
		perStreetEp[street] = { category: CATEGORY_NAMES[bestSoFar], ep };
	}

	return { perStreetEp, totalEp, handRank: CATEGORY_NAMES[bestSoFar] };
}

export type DealIdentity = { userId: number } | { anonId: string };

function ownerColumns(identity: DealIdentity): { user_id: number | null; anon_id: string | null } {
	return 'userId' in identity
		? { user_id: identity.userId, anon_id: null }
		: { user_id: null, anon_id: identity.anonId };
}

function findExisting(db: Kysely<AppDatabase>, identity: DealIdentity, today: string) {
	const owner = ownerColumns(identity);
	let query = db.selectFrom('deals').selectAll().where('date', '=', today);
	query =
		owner.user_id !== null
			? query.where('user_id', '=', owner.user_id)
			: query.where('anon_id', '=', owner.anon_id!);
	return query.executeTakeFirst();
}

function toScoredDeal(
	row: { hole_cards: string; board: string; per_street_ep: string; total_ep: number; hand_rank: string },
	alreadyDealt: boolean
): ScoredDeal {
	return {
		holeCards: JSON.parse(row.hole_cards),
		board: JSON.parse(row.board),
		perStreetEp: JSON.parse(row.per_street_ep),
		totalEp: row.total_ep,
		handRank: row.hand_rank,
		alreadyDealt
	};
}

/**
 * Returns today's deal for this identity, dealing a fresh one if none exists yet. Idempotent by
 * design: a second call for the same identity on the same day returns the already-committed
 * deal rather than erroring, so a page reload or a double-click on "Deal" can't reroll — the
 * unique index on (user_id|anon_id, date) is the actual enforcement, this is just the friendly
 * path to it. `today` is injected (not `new Date()` internally) so callers control the daily
 * reset boundary consistently (UTC, per DLE.md) and tests can pin it.
 */
export async function dealForIdentity(db: Kysely<AppDatabase>, identity: DealIdentity, today: string): Promise<ScoredDeal> {
	const owner = ownerColumns(identity);

	const existing = await findExisting(db, identity, today);
	if (existing) return toScoredDeal(existing, true);

	const { hole, board } = dealCards();
	const { perStreetEp, totalEp, handRank } = scoreDeal(hole, board);
	const holeCards = hole.map(cardCode);
	const boardCodes = board.map(cardCode);

	try {
		await db
			.insertInto('deals')
			.values({
				...owner,
				date: today,
				hole_cards: JSON.stringify(holeCards),
				board: JSON.stringify(boardCodes),
				per_street_ep: JSON.stringify(perStreetEp),
				total_ep: totalEp,
				hand_rank: handRank
			})
			.execute();
	} catch (err) {
		// Lost a race against a concurrent request for the same identity+day (unique index
		// violation) — someone else's insert won, so fetch and return theirs instead of failing.
		const winner = await findExisting(db, identity, today);
		if (!winner) throw err;
		return toScoredDeal(winner, true);
	}

	return { holeCards, board: boardCodes, perStreetEp, totalEp, handRank, alreadyDealt: false };
}
