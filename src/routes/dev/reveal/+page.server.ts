import { assertDevToolsEnabled } from '$lib/server/dev-tools';
import type { PageServerLoad } from './$types';

// Dev-only route — see assertDevToolsEnabled for exactly where this is reachable.
export const load: PageServerLoad = async () => {
	assertDevToolsEnabled();
};
