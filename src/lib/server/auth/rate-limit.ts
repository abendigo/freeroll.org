import type { Kysely } from 'kysely';
import type { AppDatabase } from '../db';

export type RateLimitKeyType = 'email' | 'ip';

export const WINDOW_HOURS = 24;

export const TIERS = [
	{ minAttempts: 21, lockoutMinutes: 60 * 24 },
	{ minAttempts: 11, lockoutMinutes: 60 },
	{ minAttempts: 6, lockoutMinutes: 15 }
];

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: Date };

export async function checkRateLimit(
	db: Kysely<AppDatabase>,
	keyType: RateLimitKeyType,
	keyValue: string
): Promise<RateLimitResult> {
	const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();

	const rows = await db
		.selectFrom('login_attempts')
		.select('attempted_at')
		.where('key_type', '=', keyType)
		.where('key_value', '=', keyValue)
		.where('attempted_at', '>', windowStart)
		.orderBy('attempted_at', 'desc')
		.execute();

	const count = rows.length;
	const tier = TIERS.find((t) => count >= t.minAttempts);
	if (!tier) return { allowed: true };

	const lastAttempt = new Date(rows[0].attempted_at);
	const retryAfter = new Date(lastAttempt.getTime() + tier.lockoutMinutes * 60 * 1000);

	if (retryAfter > new Date()) {
		return { allowed: false, retryAfter };
	}

	return { allowed: true };
}

export async function recordAttempt(db: Kysely<AppDatabase>, keyType: RateLimitKeyType, keyValue: string): Promise<void> {
	await db.insertInto('login_attempts').values({ key_type: keyType, key_value: keyValue }).execute();
}
