import type { LayoutServerLoad } from './$types';

// Named dependency, not just "whatever changed": SvelteKit doesn't re-run an ancestor layout's
// server load on every client-side navigation, only when something it depends on is explicitly
// invalidated. The magic-link verify page sets the session cookie in its own `load` (not a form
// action, so `use:enhance`'s automatic invalidateAll() doesn't apply here) and calls
// `invalidate('app:user')` on success — see +page.svelte there — which is what makes the header
// pick up the signed-in state without a full page reload.
export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('app:user');
	return { user: locals.user };
};
