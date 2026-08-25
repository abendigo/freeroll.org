import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runMigrations } from './migrate';

// Standalone entry point for `npm run migrate` — runs via plain tsx, outside SvelteKit/Vite,
// where import.meta.glob (what the deployed app uses instead) doesn't exist. Real fs access
// works fine here since this always runs in actual Node (locally, or a one-off CI/manual run
// against a real database), never inside a deployed Worker.
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

const migrationFiles: Record<string, string> = {};
for (const name of readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'))) {
	migrationFiles[name] = readFileSync(join(migrationsDir, name), 'utf-8');
}

runMigrations(migrationFiles)
	.then(() => {
		console.log('Migrations complete.');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
