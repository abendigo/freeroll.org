import { client, db } from './db';

const BOOTSTRAP_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS migrations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

/**
 * Applies whichever of `migrationFiles` (name -> raw SQL) haven't been recorded in the
 * `migrations` table yet, in name order. Deliberately takes already-loaded content rather than
 * reading files itself: Cloudflare Workers has no real filesystem, so this same function needs
 * to work whether it's called from the deployed app (content bundled at build time via
 * `import.meta.glob`, see hooks.server.ts) or from the standalone CLI (content read from disk
 * via plain `fs`, see migrate-cli.ts) — those are two genuinely different loading mechanisms,
 * not something this function should know about.
 */
export async function runMigrations(migrationFiles: Record<string, string>): Promise<void> {
	await client.executeMultiple(BOOTSTRAP_MIGRATIONS_TABLE);

	const applied = new Set(
		(await db.selectFrom('migrations').select('name').execute()).map((row) => row.name)
	);

	const names = Object.keys(migrationFiles).sort();

	for (const name of names) {
		if (applied.has(name)) continue;

		try {
			await client.executeMultiple(migrationFiles[name]);
			await db.insertInto('migrations').values({ name, applied_at: new Date().toISOString() }).execute();
			console.log(`Applied migration: ${name}`);
		} catch (err) {
			// Lost a race against a concurrent isolate also cold-starting against the same DB —
			// migrationsReady only dedupes concurrent requests *within* one isolate (see its own
			// comment); Cloudflare Workers can spin up several isolates at once on a fresh deploy,
			// each with its own copy of that cache, all reaching this loop independently. Every
			// migration here is written to tolerate being attempted twice (CREATE ... IF NOT
			// EXISTS, or an ALTER that's already landed) — so if this name is now recorded, some
			// other isolate's attempt is the one that actually won, and this failure is just that
			// race, not a real problem. Only a migration that's still unrecorded after losing is a
			// genuine failure worth surfacing.
			const nowApplied = await db.selectFrom('migrations').select('name').where('name', '=', name).executeTakeFirst();
			if (!nowApplied) throw err;
			console.log(`Skipped migration ${name}: already applied by a concurrent isolate.`);
		}
	}
}
