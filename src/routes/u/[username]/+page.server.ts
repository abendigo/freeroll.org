import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
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

	return {
		nickname: user.nickname,
		memberSince: user.created_at,
		dealsPlayed: deals.length,
		totalEp,
		best,
		deals
	};
};
