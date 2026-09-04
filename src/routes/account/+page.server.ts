import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { setNickname } from '$lib/server/auth/nickname';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	// Nickname already set means signup is done and there's nothing left for this page to do —
	// account management now lives on the profile page itself (see /u/[username]).
	if (locals.user.nickname) redirect(303, `/u/${locals.user.nickname}`);
	return {};
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

		redirect(303, `/u/${nickname}`);
	}
};
