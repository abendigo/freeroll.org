import { randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

// Anonymous play is the default (DLE.md): a visitor can deal and watch the reveal with no
// account. This cookie is what lets "one deal per day" be enforced for them anyway — it's not
// an identity claim, just an opaque id the deals table can key a unique index on.
export const ANON_COOKIE_NAME = 'freeroll_anon';
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Reads the existing anon cookie, or mints and sets a new one. Never issued to a signed-in
 *  visitor — they're identified by their session's user_id instead. */
export function getOrCreateAnonId(cookies: Cookies): string {
	const existing = cookies.get(ANON_COOKIE_NAME);
	if (existing) return existing;

	const anonId = randomBytes(16).toString('hex');
	cookies.set(ANON_COOKIE_NAME, anonId, {
		path: '/',
		maxAge: ANON_COOKIE_MAX_AGE,
		httpOnly: true,
		secure: true,
		sameSite: 'lax'
	});
	return anonId;
}

/** UTC calendar date, e.g. "2026-08-25" — the daily reset boundary DLE.md specifies. */
export function todayUtc(): string {
	return new Date().toISOString().slice(0, 10);
}

/** The current UTC week as a [Monday, Sunday] inclusive range of `deals.date` strings — the
 *  boundary for the weekly leaderboard, kept consistent with the UTC daily reset above rather
 *  than drifting with the viewer's local timezone. */
export function currentUtcWeekRange(): { start: string; end: string } {
	const now = new Date();
	const day = now.getUTCDay(); // 0 (Sun) .. 6 (Sat)
	const mondayOffset = day === 0 ? -6 : 1 - day;
	const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset));
	const sunday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6));
	return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) };
}
