import { runMigrations } from '$lib/server/migrate';
import { db } from '$lib/server/db';
import { SESSION_COOKIE_NAME, validateSession } from '$lib/server/auth/sessions';
import type { Handle } from '@sveltejs/kit';

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

	return resolve(event);
};
