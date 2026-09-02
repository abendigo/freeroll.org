import { backfillHoleCardBadges } from './badges';
import { db } from '../db';

// Standalone entry point (npm run badges:backfill) — run manually against whichever database
// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN point at (same pattern as migrate-cli.ts, bots/seed-cli.ts).
// Needs migration 0004_badges.sql (the user_badges table) already applied there — on the
// deployed app that happens automatically on first request (see hooks.server.ts), so run this
// after that deploy has gone out, not before. Safe to rerun any time after.
backfillHoleCardBadges(db)
	.then(({ usersProcessed, badgesAwarded }) => {
		console.log(`Badges backfilled: ${badgesAwarded} awarded across ${usersProcessed} users with existing deals.`);
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
