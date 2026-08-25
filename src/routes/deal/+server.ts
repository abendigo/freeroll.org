import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { dealForIdentity, type DealIdentity } from '$lib/server/game/deal';
import { getOrCreateAnonId, todayUtc } from '$lib/server/game/identity';
import type { RequestHandler } from './$types';

// POST, not GET: dealing has a side effect (it may commit a new row) and DLE.md is explicit
// that the deal is server-authoritative — a GET that a prefetch or crawler could trigger for
// free is the wrong shape for that. Idempotent per identity+day regardless (see dealForIdentity),
// so calling it again just returns the same result rather than erroring.
export const POST: RequestHandler = async ({ locals, cookies }) => {
	const identity: DealIdentity = locals.user ? { userId: locals.user.id } : { anonId: getOrCreateAnonId(cookies) };

	const deal = await dealForIdentity(db, identity, todayUtc());

	return json(deal);
};
