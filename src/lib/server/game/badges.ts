import type { Kysely } from 'kysely';
import { holeCardBadgeId, holeCardBadgesByCategory, META_BADGES } from '../../badges';
import type { AppDatabase } from '../db';

/**
 * Records the hole-card badge for a freshly dealt hand, then promotes any of the 3 collector
 * meta-badges the player has just completed. Only ever called for logged-in identities, right
 * after a brand-new (not-already-dealt-today) deal is committed — see dealForIdentity. Anonymous
 * play never earns badges, and there's no retroactive credit if an anonymous player signs up
 * later (see identity.ts's ANON_COOKIE_NAME comment: the anon cookie was never an identity
 * claim, for deals or anything else).
 *
 * Check-then-insert, not INSERT ... ON CONFLICT — matches ensureBotAccountsExist's style, and
 * there's no real race to guard against: this only ever runs once per identity per day, gated
 * behind the deals table's own unique (user_id, date) index picking a single winner first.
 */
export async function awardHoleCardBadges(
	db: Kysely<AppDatabase>,
	userId: number,
	holeCards: [string, string],
	today: string
): Promise<void> {
	const earned = new Set(
		(await db.selectFrom('user_badges').select('badge_id').where('user_id', '=', userId).execute()).map(
			(row) => row.badge_id
		)
	);

	const badgeId = holeCardBadgeId(holeCards);
	if (!earned.has(badgeId)) {
		await db.insertInto('user_badges').values({ user_id: userId, badge_id: badgeId, first_earned_date: today }).execute();
		earned.add(badgeId);
	}

	for (const meta of Object.values(META_BADGES)) {
		if (earned.has(meta.id)) continue;
		const complete = holeCardBadgesByCategory(meta.category).every((b) => earned.has(b.id));
		if (complete) {
			await db.insertInto('user_badges').values({ user_id: userId, badge_id: meta.id, first_earned_date: today }).execute();
			earned.add(meta.id);
		}
	}
}

/**
 * One-time (but safe to rerun) backfill: replays awardHoleCardBadges over every deal that
 * already exists, so accounts that played before this feature shipped don't show an empty
 * collection. Reuses awardHoleCardBadges unmodified, called once per historical deal in
 * ascending date order per user — the exact sequence live play would have produced had badges
 * existed from day one, so first_earned_date lands on the real date each hand was first dealt,
 * not the backfill's run date. anon_id deals are excluded, same as live play (see
 * awardHoleCardBadges' own comment on why anonymous play never earns badges).
 *
 * Idempotent: awardHoleCardBadges only ever inserts a badge that isn't already earned, so
 * rerunning this — including after real play has started awarding badges live — just fills in
 * whatever's still missing and touches nothing that's already there.
 */
export async function backfillHoleCardBadges(
	db: Kysely<AppDatabase>
): Promise<{ usersProcessed: number; badgesAwarded: number }> {
	const rows = await db
		.selectFrom('deals')
		.select(['user_id', 'date', 'hole_cards'])
		.where('user_id', 'is not', null)
		.orderBy('user_id', 'asc')
		.orderBy('date', 'asc')
		.execute();

	const byUser = new Map<number, { date: string; holeCards: [string, string] }[]>();
	for (const row of rows) {
		const userId = row.user_id!;
		const deals = byUser.get(userId) ?? [];
		deals.push({ date: row.date, holeCards: JSON.parse(row.hole_cards) as [string, string] });
		byUser.set(userId, deals);
	}

	const countBefore = await db.selectFrom('user_badges').select(({ fn }) => fn.countAll<number>().as('n')).executeTakeFirst();

	for (const [userId, deals] of byUser) {
		for (const deal of deals) {
			await awardHoleCardBadges(db, userId, deal.holeCards, deal.date);
		}
	}

	const countAfter = await db.selectFrom('user_badges').select(({ fn }) => fn.countAll<number>().as('n')).executeTakeFirst();

	return { usersProcessed: byUser.size, badgesAwarded: (countAfter?.n ?? 0) - (countBefore?.n ?? 0) };
}
