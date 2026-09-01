import { ensureBotAccountsExist } from './accounts';
import { db } from '../db';
import { ROSTER_SIZE } from './constants';

// Standalone entry point (npm run bots:seed) — run manually, once, against whichever database
// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN point at (see db.ts, migrate-cli.ts for the same
// pattern). Not part of the deployed app's request path: the tick endpoint only ever deals for
// bots that already exist, it never creates one — that's this script's job alone.
ensureBotAccountsExist(db)
	.then(({ created }) => {
		console.log(`Bot accounts ready: ${created} created, ${ROSTER_SIZE - created} already existed.`);
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
