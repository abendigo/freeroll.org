import { runMigrations } from '$lib/server/migrate';
import { db } from '$lib/server/db';
import { SESSION_COOKIE_NAME, validateSession } from '$lib/server/auth/sessions';
import type { Handle } from '@sveltejs/kit';

await runMigrations();

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const result = await validateSession(db, sessionId);

	if (result) {
		event.locals.user = result.user;
		event.locals.session = result.session;
	} else {
		event.locals.user = null;
		event.locals.session = null;
		event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}

	return resolve(event);
};
