import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Dev-only route — 404s outside `npm run dev`/`vite dev` so it never ships as a real page in
// production, on top of the site-wide coming-soon gate already covering it there.
export const load: PageServerLoad = async () => {
	if (!dev) error(404);
};
