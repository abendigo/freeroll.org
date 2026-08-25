import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { setNickname } from '$lib/server/auth/nickname';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	return { user: locals.user };
};

export const actions: Actions = {
	setNickname: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');

		const form = await request.formData();
		const nickname = String(form.get('nickname') ?? '');

		const result = await setNickname(db, locals.user.id, nickname);
		if (!result.success) {
			return fail(400, { error: result.error, nickname });
		}

		return { saved: true };
	}
};
