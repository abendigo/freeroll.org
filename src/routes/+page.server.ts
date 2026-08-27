import { db } from '$lib/server/db';
import { dealsCountForDate, featuredDealToday } from '$lib/server/game/leaderboard';
import { todayUtc } from '$lib/server/game/identity';
import type { PageServerLoad } from './$types';

// Only the "today's best deal" panel needs server data — the deal itself is dealt client-side
// via POST /deal (see handleDeal in +page.svelte), not here.
export const load: PageServerLoad = async () => {
	const today = todayUtc();
	const [featured, dealsToday] = await Promise.all([featuredDealToday(db, today), dealsCountForDate(db, today)]);

	return { featured, dealsToday };
};
