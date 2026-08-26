import { dev } from '$app/environment';
import { error, json } from '@sveltejs/kit';
import { generateScoredDeal } from '$lib/server/game/deal';
import type { RequestHandler } from './$types';

// Dev-only twin of /deal: same shuffle + scoring, but no DB commit and no identity/uniqueness
// check, so the /dev/reveal harness can mint as many throwaway hands as it wants to replay the
// reveal animation against. 404s outside dev so it never ships as a real route in production,
// on top of the site-wide coming-soon gate already covering it there.
export const POST: RequestHandler = async () => {
	if (!dev) error(404);

	return json({ ...generateScoredDeal(), alreadyDealt: false });
};
