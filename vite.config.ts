import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// Source-map upload only runs when SENTRY_AUTH_TOKEN is set (buildtime-only secret, see
		// .env.example) — until then this plugin just tags releases, no-op otherwise. org/project/
		// sentryUrl come from the same-named env vars the underlying @sentry/vite-plugin already
		// reads on its own, so there's nothing to hardcode here.
		sentrySvelteKit({ autoUploadSourceMaps: !!process.env.SENTRY_AUTH_TOKEN }),
		sveltekit()
	]
});
