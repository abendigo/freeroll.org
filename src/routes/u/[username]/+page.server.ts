import { error, fail, redirect } from '@sveltejs/kit';
import { HOLE_CARD_BADGES } from '$lib/badges';
import { db } from '$lib/server/db';
import { setNickname } from '$lib/server/auth/nickname';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	// nickname, not id: this is the public profile URL (/u/riverrat), and nickname is already
	// unique (see UsersTable) — a numeric id route would leak how many users have signed up.
	const user = await db
		.selectFrom('users')
		.select(['id', 'nickname', 'created_at'])
		.where('nickname', '=', params.username)
		.executeTakeFirst();

	// Accounts without a nickname yet (see /account) have nothing public to show at any URL —
	// treat them the same as "no such user" rather than leaking their existence.
	if (!user || !user.nickname) error(404, 'No player found with that name.');

	const rows = await db
		.selectFrom('deals')
		.select(['date', 'hole_cards', 'board', 'hand_rank', 'total_ep'])
		.where('user_id', '=', user.id)
		.orderBy('date', 'desc')
		.execute();

	const deals = rows.map((row) => ({
		date: row.date,
		holeCards: JSON.parse(row.hole_cards) as string[],
		board: JSON.parse(row.board) as string[],
		handRank: row.hand_rank,
		totalEp: row.total_ep
	}));

	const totalEp = deals.reduce((sum, d) => sum + d.totalEp, 0);
	const best = deals.reduce<(typeof deals)[number] | null>(
		(max, d) => (!max || d.totalEp > max.totalEp ? d : max),
		null
	);

	// { "AKs": "2026-08-30", ... } — every badge this profile has ever earned, hole-card and meta
	// alike, keyed by id so BadgeGrid can look up "earned or not" (and when) per cell in O(1).
	const badgeRows = await db
		.selectFrom('user_badges')
		.select(['badge_id', 'first_earned_date'])
		.where('user_id', '=', user.id)
		.execute();
	const earnedBadges = Object.fromEntries(badgeRows.map((row) => [row.badge_id, row.first_earned_date]));
	const holeCardBadgeIds = Object.keys(HOLE_CARD_BADGES);
	const holeCardBadgesEarned = holeCardBadgeIds.filter((id) => id in earnedBadges).length;

	return {
		nickname: user.nickname,
		memberSince: user.created_at,
		dealsPlayed: deals.length,
		totalEp,
		best,
		deals,
		earnedBadges,
		holeCardBadgesEarned,
		holeCardBadgeCount: holeCardBadgeIds.length,
		// Account controls (nickname edit, sign out) render on this page only for its own owner —
		// see +page.svelte. A signed-in visitor always has a nickname by the time they can reach
		// this route (hooks.server.ts bounces nickname-less users to /account everywhere else).
		isOwnProfile: locals.user?.id === user.id
	};
};

export const actions: Actions = {
	setNickname: async ({ request, locals, params }) => {
		if (!locals.user || locals.user.nickname !== params.username) redirect(303, '/login');

		const form = await request.formData();
		const nickname = String(form.get('nickname') ?? '');

		const result = await setNickname(db, locals.user.id, nickname);
		if (!result.success) {
			return fail(400, { error: result.error, nickname });
		}

		// The nickname just changed, so this URL (keyed on the old one) is stale — send them to
		// the new one rather than re-rendering /u/<old-name> with a mismatched isOwnProfile.
		redirect(303, `/u/${nickname}`);
	}
};
