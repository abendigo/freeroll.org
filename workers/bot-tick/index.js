// Dedicated Cron Trigger Worker for simulated bot traffic — see src/lib/server/bots/.
//
// Used to be a GitHub Actions `schedule:` cron (bot-traffic-tick.yml) hitting the same
// endpoint below. GitHub's scheduled-workflow trigger is best-effort and, in practice, was
// landing hours late instead of every 5 minutes — GitHub's own docs warn schedule events can
// be delayed under load, and there's no SLA at 5-minute granularity. Cloudflare Cron Triggers
// run on Cloudflare's own scheduler and are reliable at this interval, so this Worker exists
// to do nothing but fire on schedule and call the real endpoint — all the actual logic
// (idle check, picking a bot, dealing) stays server-side in runBotTick(), untouched.
//
// Kept as a separate Worker rather than added to freeroll-app itself because
// @sveltejs/adapter-cloudflare generates a fetch-only `_worker.js` on every build, which would
// clobber a hand-added `scheduled` export — see the PR that introduced this file for the
// investigation. A second tiny Worker sidesteps that entirely.
export default {
	async scheduled(event, env, ctx) {
		ctx.waitUntil(
			fetch(`https://freeroll.org/internal/bots/tick?preview=${env.PREVIEW_SECRET}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${env.BOT_TICK_SECRET}` }
			})
		);
	}
};
