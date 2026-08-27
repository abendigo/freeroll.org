import { sql, type Kysely } from 'kysely';
import type { AppDatabase } from '../db';
import { STREETS, type Street } from './streets';

export interface LeaderboardEntry {
	rank: number;
	nickname: string;
	holeCards: string[];
	board: string[];
	handRank: string;
	totalEp: number;
}

const DEFAULT_LIMIT = 20;

// Anonymous deals never appear on any board: DLE.md ties leaderboard visibility to signing up
// and picking a nickname ("Login is only prompted afterward, if the player wants to ... appear
// on the leaderboard") — every query here inner-joins users and requires a nickname.

/** Today's board: one row per player already (one deal per identity per day), ranked by EP. */
export async function dailyLeaderboard(db: Kysely<AppDatabase>, date: string, limit = DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
	const rows = await db
		.selectFrom('deals')
		.innerJoin('users', 'users.id', 'deals.user_id')
		.select([
			'users.nickname as nickname',
			'deals.hole_cards as holeCards',
			'deals.board as board',
			'deals.hand_rank as handRank',
			'deals.total_ep as totalEp'
		])
		.where('deals.date', '=', date)
		.where('users.nickname', 'is not', null)
		.orderBy('deals.total_ep', 'desc')
		.limit(limit)
		.execute();

	return withRank(rows);
}

/** Weekly/all-time boards: each player's *best* single deal within the window, per DLE.md's
 *  "who got the luckiest deal" framing — a `row_number()` window picks the one top deal per
 *  user_id (so the right hand_rank travels with the EP) rather than a plain MAX() aggregate,
 *  which would only give back the number. */
async function bestPerPlayer(
	db: Kysely<AppDatabase>,
	dateRange: { from?: string; to?: string },
	limit: number
): Promise<LeaderboardEntry[]> {
	const rows = await db
		.selectFrom((eb) =>
			eb
				.selectFrom('deals')
				.innerJoin('users', 'users.id', 'deals.user_id')
				.where('users.nickname', 'is not', null)
				.$if(dateRange.from !== undefined, (qb) => qb.where('deals.date', '>=', dateRange.from!))
				.$if(dateRange.to !== undefined, (qb) => qb.where('deals.date', '<=', dateRange.to!))
				.select([
					'users.nickname as nickname',
					'deals.hole_cards as holeCards',
					'deals.board as board',
					'deals.hand_rank as handRank',
					'deals.total_ep as totalEp',
					// Tie-break by earliest date: the rare exact-EP tie reads better as "who got there
					// first" than as arbitrary row order.
					sql<number>`row_number() over (partition by deals.user_id order by deals.total_ep desc, deals.date asc)`.as(
						'playerRank'
					)
				])
				.as('best_per_player')
		)
		.selectAll()
		.where('playerRank', '=', 1)
		.orderBy('totalEp', 'desc')
		.limit(limit)
		.execute();

	return withRank(rows);
}

export function weeklyLeaderboard(db: Kysely<AppDatabase>, weekStart: string, weekEnd: string, limit = DEFAULT_LIMIT) {
	return bestPerPlayer(db, { from: weekStart, to: weekEnd }, limit);
}

export function allTimeLeaderboard(db: Kysely<AppDatabase>, limit = DEFAULT_LIMIT) {
	return bestPerPlayer(db, {}, limit);
}

function withRank(
	rows: { nickname: string | null; holeCards: string; board: string; handRank: string; totalEp: number }[]
): LeaderboardEntry[] {
	return rows.map((row, i) => ({
		rank: i + 1,
		nickname: row.nickname!,
		holeCards: JSON.parse(row.holeCards) as string[],
		board: JSON.parse(row.board) as string[],
		handRank: row.handRank,
		totalEp: row.totalEp
	}));
}

export interface FeaturedDeal {
	nickname: string;
	holeCards: string[];
	board: string[];
	handRank: string;
	totalEp: number;
	/** Which street the final hand category was first reached on — derived from the deal's own
	 *  per_street_ep record, not a fabricated flavor line. Null only if the data is somehow
	 *  inconsistent (shouldn't happen: every deal reaches its final category on some street). */
	achievedOn: Street | null;
}

/** The single highest-EP nicknamed deal today, for the homepage's featured panel — same
 *  visibility rule as dailyLeaderboard (rank 1), just with the extra fields the panel needs. */
export async function featuredDealToday(db: Kysely<AppDatabase>, date: string): Promise<FeaturedDeal | null> {
	const row = await db
		.selectFrom('deals')
		.innerJoin('users', 'users.id', 'deals.user_id')
		.select([
			'users.nickname as nickname',
			'deals.hole_cards as holeCards',
			'deals.board as board',
			'deals.hand_rank as handRank',
			'deals.total_ep as totalEp',
			'deals.per_street_ep as perStreetEp'
		])
		.where('deals.date', '=', date)
		.where('users.nickname', 'is not', null)
		.orderBy('deals.total_ep', 'desc')
		.limit(1)
		.executeTakeFirst();

	if (!row) return null;

	const perStreetEp = JSON.parse(row.perStreetEp) as Record<Street, { category: string; ep: number }>;
	const achievedOn = STREETS.find((street) => perStreetEp[street].category === row.handRank && perStreetEp[street].ep > 0) ?? null;

	return {
		nickname: row.nickname!,
		holeCards: JSON.parse(row.holeCards) as string[],
		board: JSON.parse(row.board) as string[],
		handRank: row.handRank,
		totalEp: row.totalEp,
		achievedOn
	};
}

/** Total deals committed today, across every identity (anon included) — a plain activity count,
 *  not an identity claim, so it doesn't need the nickname-visibility rule the boards above do. */
export async function dealsCountForDate(db: Kysely<AppDatabase>, date: string): Promise<number> {
	const row = await db
		.selectFrom('deals')
		.select(({ fn }) => fn.countAll<number>().as('count'))
		.where('date', '=', date)
		.executeTakeFirstOrThrow();
	return Number(row.count);
}
