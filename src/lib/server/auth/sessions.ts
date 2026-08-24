import { randomBytes } from 'node:crypto';
import type { Kysely, Selectable } from 'kysely';
import type { AppDatabase, SessionsTable, UsersTable } from '../db';

export type Session = Selectable<SessionsTable>;
export type User = Selectable<UsersTable>;

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RENEWAL_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000; // renew if less than 15 days remaining

export const SESSION_COOKIE_NAME = 'freeroll_session';

export function generateSessionId(): string {
	return randomBytes(32).toString('hex');
}

export async function createSession(db: Kysely<AppDatabase>, userId: number): Promise<Session> {
	const id = generateSessionId();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

	return db
		.insertInto('sessions')
		.values({ id, user_id: userId, expires_at: expiresAt })
		.returningAll()
		.executeTakeFirstOrThrow();
}

export async function validateSession(
	db: Kysely<AppDatabase>,
	sessionId: string
): Promise<{ session: Session; user: User } | null> {
	const session = await db
		.selectFrom('sessions')
		.selectAll()
		.where('id', '=', sessionId)
		.executeTakeFirst();

	if (!session) return null;

	if (new Date(session.expires_at) < new Date()) {
		await invalidateSession(db, sessionId);
		return null;
	}

	// Sliding window renewal, so an active player never gets logged out mid-streak.
	if (new Date(session.expires_at).getTime() - Date.now() < RENEWAL_THRESHOLD_MS) {
		const newExpiry = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
		await db.updateTable('sessions').set({ expires_at: newExpiry }).where('id', '=', sessionId).execute();
		session.expires_at = newExpiry;
	}

	const user = await db.selectFrom('users').selectAll().where('id', '=', session.user_id).executeTakeFirstOrThrow();

	return { session, user };
}

export async function invalidateSession(db: Kysely<AppDatabase>, sessionId: string): Promise<void> {
	await db.deleteFrom('sessions').where('id', '=', sessionId).execute();
}
