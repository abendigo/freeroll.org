import type { Kysely } from 'kysely';
import type { AppDatabase } from '../db';
import { hmacHex } from '../auth/hash';
import { botRoster } from './roster';

/** Creates whichever of the roster's nicknames don't already have a user row — safe to call
 *  repeatedly (every run of the seed script, or after growing ROSTER_SIZE): existing bots are
 *  left untouched, only the gap gets filled in. Never touches a real user's row — nicknames
 *  are globally unique, so a real signup that happened to collide with a roster name would
 *  already own it and just get skipped here. */
export async function ensureBotAccountsExist(db: Kysely<AppDatabase>): Promise<{ created: number }> {
	const roster = botRoster();

	const existing = await db.selectFrom('users').select('nickname').where('nickname', 'in', roster).execute();
	const existingNicknames = new Set(existing.map((row) => row.nickname));

	const toCreate = roster.filter((nickname) => !existingNicknames.has(nickname));

	for (const nickname of toCreate) {
		// Synthetic, not a real address — bots never sign in via magic link, so nothing ever
		// needs to reverse this. Prefixed so it can never collide with a real hashed email.
		const emailHash = hmacHex(`bot:${nickname}`);
		await db.insertInto('users').values({ email_hash: emailHash, nickname, is_bot: 1 }).execute();
	}

	return { created: toCreate.length };
}
