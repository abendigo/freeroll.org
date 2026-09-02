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
