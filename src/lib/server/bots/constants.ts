// Split out from config.ts on purpose: these are plain constants, not env reads, so
// seed-cli.ts (which runs under plain tsx, outside SvelteKit/Vite — see migrate-cli.ts's
// comment on why $env/dynamic/private doesn't resolve there) can import roster.ts without
// dragging in config.ts's `$env/dynamic/private` import along with it.

/** How long the deal feed has to sit idle before the watchdog fills it in with a bot deal. */
export const IDLE_THRESHOLD_MINUTES = 10;

/** Size of the bot roster — 6/hour x 24 hours, each dealing once/day, spaces deals roughly
 *  IDLE_THRESHOLD_MINUTES apart across a full day if nothing else is happening. */
export const ROSTER_SIZE = 144;
