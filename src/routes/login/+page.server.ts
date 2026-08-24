import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requestMagicLink } from '$lib/server/auth/magic-link';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { alreadySignedIn: locals.user !== null };
};

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');

		const result = await requestMagicLink(db, email, getClientAddress());

		if (!result.success) {
			return fail(400, { error: result.error, email });
		}

		return { sent: true, email };
	}
};
