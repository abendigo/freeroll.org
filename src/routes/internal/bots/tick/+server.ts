import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { botsEnabled, botTickSecret } from '$lib/server/bots/config';
import { runBotTick } from '$lib/server/bots/tick';
import type { RequestHandler } from './$types';

// POST-only, secret-gated internal endpoint — the sole entry point workers/bot-tick/ (a
// dedicated Cloudflare Cron Trigger Worker) calls on a schedule. Used to be called by a GitHub
// Actions `schedule:` cron instead; that was moved off because GH's scheduled-workflow trigger
// turned out to be unreliable at 5-minute granularity (see workers/bot-tick/index.js). 404s
// (not 401/403) whenever bots aren't switched on or the caller doesn't present the right
// secret — same "don't even confirm this exists" shape as /dev/reveal's
// assertDevToolsEnabled(). Two independent kill switches cover this end-to-end: leave
// BOT_TRAFFIC_ENABLED unset, or disable the bot-tick Worker's Cron Trigger — either one alone
// fully stops bot traffic, no code change or redeploy required for either.
export const POST: RequestHandler = async ({ request }) => {
	if (!botsEnabled()) error(404);

	const secret = botTickSecret();
	const presented = request.headers.get('authorization');
	if (!secret || presented !== `Bearer ${secret}`) error(404);

	const result = await runBotTick(db);
	return json(result);
};
