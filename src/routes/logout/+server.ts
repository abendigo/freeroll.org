import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { SESSION_COOKIE_NAME, invalidateSession } from '$lib/server/auth/sessions';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get(SESSION_COOKIE_NAME);
	if (sessionId) {
		await invalidateSession(db, sessionId);
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}
	redirect(303, '/');
};
