import { db } from '$lib/server/db';
import { allTimeLeaderboard, dailyLeaderboard, weeklyLeaderboard } from '$lib/server/game/leaderboard';
import { currentUtcWeekRange, todayUtc } from '$lib/server/game/identity';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { start, end } = currentUtcWeekRange();

	const [daily, weekly, allTime] = await Promise.all([
		dailyLeaderboard(db, todayUtc()),
		weeklyLeaderboard(db, start, end),
		allTimeLeaderboard(db)
	]);

	return { daily, weekly, allTime };
};
