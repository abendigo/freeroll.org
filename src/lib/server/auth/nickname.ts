import type { Kysely } from 'kysely';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';
import type { AppDatabase } from '../db';

const NICKNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;

// Maintained word list + leetspeak/evasion detection (obscenity), not a hand-rolled list — per
// DLE.md, catching the obvious cases is enough for a low-stakes leaderboard; a "report
// nickname" backstop is the fallback for whatever slips through, built later if it's a real
// problem. Built once at module scope (pure/sync, no I/O — safe in Workers, unlike the
// top-level-await mistake we hit in hooks.server.ts), reused across requests.
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers
});

export type SetNicknameResult = { success: true } | { success: false; error: string };

export async function setNickname(db: Kysely<AppDatabase>, userId: number, rawNickname: string): Promise<SetNicknameResult> {
	const nickname = rawNickname.trim();

	if (!NICKNAME_RE.test(nickname)) {
		return { success: false, error: '3-20 characters: letters, numbers, underscores, and hyphens only.' };
	}
	if (matcher.hasMatch(nickname)) {
		return { success: false, error: "That nickname isn't allowed. Try another." };
	}

	try {
		await db.updateTable('users').set({ nickname }).where('id', '=', userId).execute();
	} catch (err) {
		// SQLite's UNIQUE constraint violation — no typed error code from the driver, so this is
		// a best-effort message match rather than a specific exception type check.
		if (err instanceof Error && /UNIQUE constraint failed/.test(err.message)) {
			return { success: false, error: 'That nickname is already taken.' };
		}
		throw err;
	}

	return { success: true };
}
