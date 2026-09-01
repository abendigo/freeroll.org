import { env } from '$env/dynamic/private';

/** Single on/off switch for all simulated bot traffic — unset (or anything but "true") means
 *  off everywhere, including production. Same pattern as dev-tools.ts's DEV_TOOLS_ENABLED:
 *  a worker secret that the deploy workflow only ever sets from a GitHub Actions secret, which
 *  is itself unset by default. Flip BOT_TRAFFIC_ENABLED off (or never set it) and every bot
 *  code path — the tick endpoint, ultimately dealForIdentity for a bot — goes cold. */
export function botsEnabled(): boolean {
	return env.BOT_TRAFFIC_ENABLED === 'true';
}

/** Bearer credential .github/workflows/bot-traffic-tick.yml presents to POST /internal/bots/
 *  tick. A second, independent gate on top of botsEnabled(): flipping the feature on doesn't
 *  by itself make the endpoint callable by anyone who finds the URL. */
export function botTickSecret(): string | undefined {
	return env.BOT_TICK_SECRET;
}
