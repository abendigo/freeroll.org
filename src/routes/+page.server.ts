import { db } from '$lib/server/db';
import { findTodaysDeal, type DealIdentity } from '$lib/server/game/deal';
import { dealsCountForDate, featuredDealToday } from '$lib/server/game/leaderboard';
import { ANON_COOKIE_NAME, todayUtc } from '$lib/server/game/identity';
import type { PageServerLoad } from './$types';

// The deal itself still commits client-side via POST /deal (see handleDeal in +page.svelte) —
// that's the one true "is today's deal decided yet" write, and stays there. This load only reads:
// if the visitor already has an identity (signed in, or an anon cookie from a previous deal) and
// that identity already dealt today, hand the result down so the page renders straight into the
// finished state instead of showing a live "Deal" button that (per the bug report) looked
// clickable but would just re-fetch the same already-committed result on click.
export const load: PageServerLoad = async ({ locals, cookies }) => {
	const today = todayUtc();

	// Never mint an anon cookie here — that only happens on an actual deal (POST /deal). A
	// brand-new visitor has no cookie yet, which correctly means "no, they haven't dealt."
	const anonId = cookies.get(ANON_COOKIE_NAME);
	const identity: DealIdentity | null = locals.user ? { userId: locals.user.id } : anonId ? { anonId } : null;

	const [featured, dealsToday, todaysDeal] = await Promise.all([
		featuredDealToday(db, today),
		dealsCountForDate(db, today),
		identity ? findTodaysDeal(db, identity, today) : null
	]);

	return { featured, dealsToday, todaysDeal };
};
