import { sql, type Kysely } from 'kysely';
import type { AppDatabase } from '../db';
import { dealForIdentity } from '../game/deal';
import { todayUtc } from '../game/identity';
import { IDLE_THRESHOLD_MINUTES } from './constants';

export type TickResult =
	| { ran: false; reason: 'not idle yet' | 'every bot has already dealt today' }
	| { ran: true; nickname: string };

/** The watchdog: if no deal — real or bot — has landed in the last IDLE_THRESHOLD_MINUTES,
 *  deals for one random bot that hasn't already dealt today. No-ops otherwise, so a busy day
 *  of real traffic just keeps resetting the idle clock exactly like a bot deal would. Called
 *  from POST /internal/bots/tick, on a fixed interval, by bot-traffic-tick.yml. */
export async function runBotTick(db: Kysely<AppDatabase>): Promise<TickResult> {
	const today = todayUtc();

	const latest = await db.selectFrom('deals').select('created_at').orderBy('created_at', 'desc').limit(1).executeTakeFirst();

	if (latest) {
		const idleMs = Date.now() - new Date(latest.created_at).getTime();
		if (idleMs < IDLE_THRESHOLD_MINUTES * 60 * 1000) {
			return { ran: false, reason: 'not idle yet' };
		}
	}

	// Bots with no deals row for today at all — left join + IS NULL, not NOT IN (subquery),
	// so a bot with zero deals ever still matches cleanly.
	const candidate = await db
		.selectFrom('users')
		.leftJoin('deals', (join) => join.onRef('deals.user_id', '=', 'users.id').on('deals.date', '=', today))
		.select(['users.id as id', 'users.nickname as nickname'])
		.where('users.is_bot', '=', 1)
		.where('deals.id', 'is', null)
		.orderBy(sql`random()`)
		.limit(1)
		.executeTakeFirst();

	if (!candidate) {
		return { ran: false, reason: 'every bot has already dealt today' };
	}

	await dealForIdentity(db, { userId: candidate.id }, today);

	return { ran: true, nickname: candidate.nickname! };
}
