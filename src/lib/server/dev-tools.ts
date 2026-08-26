import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** Guards dev-only routes (currently just /dev/reveal): allowed in local `vite dev`, and on PR
 *  preview deploys where `pr-preview-app.yml` sets the DEV_TOOLS_ENABLED worker secret to
 *  "true" — so the harness has a real URL to click during review. Production's deploy workflow
 *  never sets that secret, so this always 404s there, on top of the site-wide coming-soon gate
 *  already covering everything in production. */
export function assertDevToolsEnabled(): void {
	if (!dev && env.DEV_TOOLS_ENABLED !== 'true') error(404);
}
