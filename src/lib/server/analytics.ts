import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

const hostname = 'freeroll.org';

// Same shape as myfriendsboat's analytics.ts: fire-and-forget custom events against Umami's
// HTTP API, not the client-side script (that only covers pageviews — see +layout.svelte for
// that half). Deliberately minimal, no PII: an event name and a few non-identifying data
// points at most, never an email/hash/IP.
export function trackEvent(name: string, data?: Record<string, string | number | boolean>): void {
	if (dev) return;
	if (!env.PUBLIC_UMAMI_URL || !env.PUBLIC_UMAMI_WEBSITE_ID) return;

	const payload: Record<string, unknown> = {
		website: env.PUBLIC_UMAMI_WEBSITE_ID,
		hostname,
		url: `/events/${name}`,
		language: 'en-US',
		screen: '1920x1080',
		name
	};
	if (data) payload.data = data;

	fetch(`${env.PUBLIC_UMAMI_URL}/api/send`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'Mozilla/5.0 (compatible; freeroll-server/1.0)'
		},
		body: JSON.stringify({ type: 'event', payload })
	}).catch(() => {
		// analytics failures are silent
	});
}
