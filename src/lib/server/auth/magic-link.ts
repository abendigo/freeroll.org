import { randomBytes } from 'node:crypto';
import type { Kysely } from 'kysely';
import type { AppDatabase } from '../db';
import { env } from '$env/dynamic/private';
import { sendEmail } from '../email/send';
import { renderTemplate } from '../email/render';
import MagicLink from '../email/templates/MagicLink.svelte';
import { checkRateLimit, recordAttempt } from './rate-limit';
import { createSession, type Session, type User } from './sessions';

const TOKEN_EXPIRY_MINUTES = 15;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function generateToken(): string {
	return randomBytes(32).toString('hex');
}

function expiresAt(): string {
	return new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString();
}

export type RequestMagicLinkResult =
	| { success: true }
	| { success: false; error: string; retryAfter?: Date };

/**
 * Sends a sign-in link to `email`. Always looks the same to the caller whether or not an
 * account exists yet for that address — accounts are created lazily on first successful
 * verification, so there's no separate "sign up" step and nothing to enumerate.
 */
export async function requestMagicLink(
	db: Kysely<AppDatabase>,
	rawEmail: string,
	ip: string
): Promise<RequestMagicLinkResult> {
	const email = normalizeEmail(rawEmail);
	if (!EMAIL_RE.test(email)) {
		return { success: false, error: 'Enter a valid email address.' };
	}

	const emailLimit = await checkRateLimit(db, 'email', email);
	if (!emailLimit.allowed) return { success: false, error: 'Too many requests for this email.', retryAfter: emailLimit.retryAfter };

	const ipLimit = await checkRateLimit(db, 'ip', ip);
	if (!ipLimit.allowed) return { success: false, error: 'Too many requests from this address.', retryAfter: ipLimit.retryAfter };

	await recordAttempt(db, 'email', email);
	await recordAttempt(db, 'ip', ip);

	const token = generateToken();
	await db.insertInto('magic_link_tokens').values({ token, email, expires_at: expiresAt() }).execute();

	const baseUrl = env.APP_BASE_URL || 'https://freeroll.org';
	const magicLinkUrl = `${baseUrl}/login/verify/${token}`;

	const html = renderTemplate(MagicLink, { magicLinkUrl, expiryMinutes: TOKEN_EXPIRY_MINUTES });
	await sendEmail({ to: email, subject: 'Your Freeroll sign-in link', html });

	return { success: true };
}

export type VerifyMagicLinkResult =
	| { success: true; session: Session; user: User }
	| { success: false; error: string };

export async function verifyMagicLink(db: Kysely<AppDatabase>, token: string): Promise<VerifyMagicLinkResult> {
	const record = await db.selectFrom('magic_link_tokens').selectAll().where('token', '=', token).executeTakeFirst();

	if (!record) return { success: false, error: 'Invalid or expired sign-in link.' };
	if (record.used_at) return { success: false, error: 'This sign-in link has already been used.' };
	if (new Date(record.expires_at) < new Date()) {
		return { success: false, error: 'This sign-in link has expired. Request a new one.' };
	}

	await db.updateTable('magic_link_tokens').set({ used_at: new Date().toISOString() }).where('token', '=', token).execute();

	let user = await db.selectFrom('users').selectAll().where('email', '=', record.email).executeTakeFirst();
	if (!user) {
		user = await db
			.insertInto('users')
			.values({ email: record.email })
			.returningAll()
			.executeTakeFirstOrThrow();
	}

	const session = await createSession(db, user.id);

	return { success: true, session, user };
}
