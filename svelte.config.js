import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		// Required for @sentry/sveltekit's Cloudflare Workers handle (initCloudflareSentryHandle,
		// see hooks.server.ts) — see discoveries/sentry-sveltekit-cloudflare-workers.md for why
		// the plain Node-style Sentry.init() doesn't work here.
		experimental: {
			instrumentation: { server: true },
			tracing: { server: true }
		}
	},
	compilerOptions: {
		runes: true
	}
};

export default config;
