// Standalone HTML for the coming-soon gate (see hooks.server.ts). Deliberately not a SvelteKit
// route: it needs to intercept *every* path — including ones with no matching route — before
// any DB/session work happens, so it's rendered as a plain Response straight out of `handle`.
// Self-contained (no external requests, no dependency on +layout.svelte's CSS) so it renders
// correctly on its own.
export function comingSoonPage(): string {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>freeroll — coming soon</title>
<style>
	:root {
		--bg: #f5f5f6;
		--ink: #18181b;
		--ink-muted: #6b7079;
		--border: #e4e4e7;
		--glow-a: #eab308;
		--glow-b: #22c55e;
	}
	@media (prefers-color-scheme: dark) {
		:root {
			--bg: #0a0a0b;
			--ink: #f4f4f5;
			--ink-muted: #9a9ea6;
			--border: #2a2a2e;
		}
	}
	* { box-sizing: border-box; }
	html { color-scheme: light dark; }
	body {
		margin: 0;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		color: var(--ink);
		font-family: ui-sans-serif, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		text-align: center;
		padding: 24px;
	}
	.wordmark {
		font-family: ui-rounded, 'SF Pro Rounded', 'Segoe UI', system-ui, sans-serif;
		font-weight: 800;
		font-size: 22px;
		letter-spacing: -0.02em;
		margin-bottom: 28px;
	}
	.placeholder-row {
		display: flex;
		justify-content: center;
		gap: 12px;
		margin-bottom: 32px;
	}
	.ph-card {
		width: 64px;
		height: 90px;
		border-radius: 10px;
		border: 2px dashed var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30px;
		color: var(--ink-muted);
		font-weight: 800;
	}
	.eyebrow {
		font-family: 'Roboto Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-muted);
		margin-bottom: 14px;
	}
	h1 {
		font-family: ui-rounded, 'SF Pro Rounded', 'Segoe UI', system-ui, sans-serif;
		font-weight: 800;
		font-size: clamp(26px, 5vw, 38px);
		margin: 0 0 14px;
		text-wrap: balance;
	}
	p {
		color: var(--ink-muted);
		font-size: 15px;
		max-width: 46ch;
		margin: 0 auto;
		text-wrap: balance;
	}
</style>
</head>
<body>
	<div>
		<div class="wordmark">freeroll</div>
		<div class="placeholder-row">
			<div class="ph-card">?</div>
			<div class="ph-card">?</div>
		</div>
		<div class="eyebrow">Coming soon</div>
		<h1>One deal a day. Two hole cards, five on the board.</h1>
		<p>We're still shuffling. freeroll.org will deal you in soon — check back shortly.</p>
	</div>
</body>
</html>
`;
}
