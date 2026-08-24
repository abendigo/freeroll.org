import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { client, db } from './db';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

const BOOTSTRAP_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS migrations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export async function runMigrations(): Promise<void> {
	await client.executeMultiple(BOOTSTRAP_MIGRATIONS_TABLE);

	const applied = new Set(
		(await db.selectFrom('migrations').select('name').execute()).map((row) => row.name)
	);

	const files = readdirSync(migrationsDir)
		.filter((name) => name.endsWith('.sql'))
		.sort();

	for (const name of files) {
		if (applied.has(name)) continue;

		const sqlText = readFileSync(join(migrationsDir, name), 'utf-8');
		await client.executeMultiple(sqlText);
		await db.insertInto('migrations').values({ name, applied_at: new Date().toISOString() }).execute();

		console.log(`Applied migration: ${name}`);
	}
}

// Allow `tsx src/lib/server/migrate.ts` (or `npm run migrate`) to apply migrations directly,
// while still being importable (e.g. from tests) without running anything on import.
if (import.meta.url === `file://${process.argv[1]}`) {
	runMigrations()
		.then(() => {
			console.log('Migrations complete.');
			process.exit(0);
		})
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});
}
