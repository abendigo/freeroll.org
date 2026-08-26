import { json } from '@sveltejs/kit';
import { assertDevToolsEnabled } from '$lib/server/dev-tools';
import { generateScoredDeal } from '$lib/server/game/deal';
import type { RequestHandler } from './$types';

// Dev-only twin of /deal: same shuffle + scoring, but no DB commit and no identity/uniqueness
// check, so the /dev/reveal harness can mint as many throwaway hands as it wants to replay the
// reveal animation against. See assertDevToolsEnabled for exactly where this is reachable.
export const POST: RequestHandler = async () => {
	assertDevToolsEnabled();

	return json({ ...generateScoredDeal(), alreadyDealt: false });
};
