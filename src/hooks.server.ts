import { runMigrations } from '$lib/server/migrate';
import { db } from '$lib/server/db';
import { SESSION_COOKIE_NAME, validateSession } from '$lib/server/auth/sessions';
import { comingSoonPage } from '$lib/server/coming-soon';
import { env } from '$env/dynamic/private';
import { redirect, type Handle } from '@sveltejs/kit';

// A signed-in user with no nickname yet is mid-signup, not fully onboarded — every other route
// bounces them to /account until they set one. /account itself is only ever the pre-nickname
// step now (it redirects away to /u/[username] once a nickname exists — see its +page.server.ts)
// and /logout is exempt too, so a stuck signup can always back out.
const NICKNAME_SETUP_EXEMPT_PATHS = new Set(['/account', '/logout']);

// Preview bypass: visiting /?preview=<PREVIEW_SECRET> once sets a long-lived cookie that skips
// the gate on every later request from that browser, so we (and only we) can still see and test
// the real site while it's hidden from everyone else.
const PREVIEW_COOKIE_NAME = 'freeroll_preview';

// Bundled at build time (raw SQL embedded directly into the JS), not read from disk — Cloudflare
// Workers has no real filesystem at runtime, so the fs-based approach migrate-cli.ts uses for
// `npm run migrate` can't work here. Keys come back as full paths ('./lib/server/migrations/
// 0001_initial.sql'); runMigrations() just needs a name, so normalize to the basename.
const migrationModules = import.meta.glob('./lib/server/migrations/*.sql', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;
const migrationFiles = Object.fromEntries(
	Object.entries(migrationModules).map(([path, sql]) => [path.split('/').pop()!, sql])
);

// Workers forbids async I/O at module top level ("global scope") — it has to happen inside a
// request handler. Cache the in-flight promise (not just a boolean) so concurrent requests
// during a cold start all await the same run instead of racing to start their own; once
// resolved, later requests on this isolate just await an already-settled promise.
let migrationsReady: Promise<void> | null = null;
function ensureMigrated(): Promise<void> {
	if (!migrationsReady) migrationsReady = runMigrations(migrationFiles);
	return migrationsReady;
}

export const handle: Handle = async ({ event, resolve }) => {
	if (env.COMING_SOON === 'true') {
		const secret = env.PREVIEW_SECRET;
		const queryPreview = event.url.searchParams.get('preview');
		const bypassed = !!secret && (queryPreview === secret || event.cookies.get(PREVIEW_COOKIE_NAME) === secret);

		if (!bypassed) {
			return new Response(comingSoonPage(), {
				status: 503,
				headers: { 'content-type': 'text/html; charset=utf-8', 'retry-after': '3600' }
			});
		}

		if (queryPreview === secret) {
			event.cookies.set(PREVIEW_COOKIE_NAME, secret, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: true,
				secure: true,
				sameSite: 'lax'
			});
		}
	}

	await ensureMigrated();

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

	if (event.locals.user && !event.locals.user.nickname && !NICKNAME_SETUP_EXEMPT_PATHS.has(event.url.pathname)) {
		redirect(303, '/account');
	}

	return resolve(event);
};
