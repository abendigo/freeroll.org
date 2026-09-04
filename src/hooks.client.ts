import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/public';

// Client half of the same Bugsink setup as hooks.server.ts — see that file's comment and
// discoveries/sentry-sveltekit-cloudflare-workers.md. No Workers-specific handle needed here:
// the client bundle isn't Workers-constrained, so this is the plain Node-SDK-shaped init.
Sentry.init({
	dsn: env.PUBLIC_SENTRY_DSN,
	tracesSampleRate: 0
});

export const handleError = Sentry.handleErrorWithSentry();
