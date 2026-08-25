import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { verifyMagicLink } from '$lib/server/auth/magic-link';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/sessions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const result = await verifyMagicLink(db, params.token);

	if (!result.success) {
		return { success: false, error: result.error };
	}

	cookies.set(SESSION_COOKIE_NAME, result.session.id, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		expires: new Date(result.session.expires_at)
	});

	return { success: true, error: null };
};
