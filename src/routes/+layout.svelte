<script lang="ts">
	import { onMount } from 'svelte';

	let { children } = $props();

	let themeButtons: HTMLButtonElement[] = [];

	onMount(() => {
		const root = document.documentElement;
		let stored: string | null = null;
		try {
			stored = localStorage.getItem('freeroll-theme');
		} catch {
			// ignore (private browsing, storage disabled, etc.)
		}

		function apply(mode: string) {
			if (mode === 'auto') root.removeAttribute('data-theme');
			else root.setAttribute('data-theme', mode);
			themeButtons.forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
		}
		apply(stored || 'auto');

		themeButtons.forEach((b) => {
			b.addEventListener('click', () => {
				const mode = b.dataset.mode!;
				apply(mode);
				try {
					localStorage.setItem('freeroll-theme', mode);
				} catch {
					// ignore
				}
			});
		});
	});
</script>

<header>
	<div class="header-inner">
		<div class="header-left">
			<a class="wordmark" href="/">freeroll</a>
			<a class="header-link" href="/about">About</a>
			<a class="header-link" href="/leaderboard">🏆 Leaderboard</a>
		</div>
		<div class="header-right">
			<div class="theme-toggle">
				<button type="button" data-mode="light" aria-label="Light theme" bind:this={themeButtons[0]}>☀</button>
				<button type="button" data-mode="auto" aria-label="Auto theme" class="active" bind:this={themeButtons[1]}>◐</button>
				<button type="button" data-mode="dark" aria-label="Dark theme" bind:this={themeButtons[2]}>☾</button>
			</div>
			<!-- svelte-ignore a11y_invalid_attribute -- placeholder until sign-in exists (later PR) -->
			<a class="btn-outline" href="#">Sign in</a>
		</div>
	</div>
</header>

<main id="top">
	{@render children()}
</main>

<footer>
	<div class="wrap">
		freeroll.org — a poker-themed daily luck game.<br />
		"Freeroll" is a poker term too: a tournament that costs nothing to enter.<br />
		Format heavily inspired by <a href="https://rngdle.com" target="_blank" rel="noopener">rngdle.com</a> — go roll the original too.<br
		/>
		<a href="/privacy">Privacy</a>
	</div>
</footer>

<style>
	:global(:root) {
		--bg: #f5f5f6;
		--surface: #ffffff;
		--border: #e4e4e7;
		--ink: #18181b;
		--ink-muted: #6b7079;
		--ink-faint: #a1a1aa;
		--card-face: #ffffff;
		--card-ink: #18181b;
		--card-red: #dc2626;

		--glow-a: #eab308;
		--glow-b: #22c55e;
		--glow-c: #e11d48;
		--glow-d: #eab308;

		--cat-hand: #4f46e5;
		--cat-meme: #e11d48;
		--cat-board: #16a34a;

		--shadow: 0 1px 2px rgba(24, 24, 27, 0.04), 0 12px 28px -14px rgba(24, 24, 27, 0.16);
	}

	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme='light'])) {
			--bg: #0a0a0b;
			--surface: #17171a;
			--border: #2a2a2e;
			--ink: #f4f4f5;
			--ink-muted: #9a9ea6;
			--ink-faint: #626268;
			--card-face: #17171a;
			--card-ink: #f4f4f5;
			--card-red: #f0554a;
			--shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 16px 34px -14px rgba(0, 0, 0, 0.7);
		}
	}
	:global(:root[data-theme='dark']) {
		--bg: #0a0a0b;
		--surface: #17171a;
		--border: #2a2a2e;
		--ink: #f4f4f5;
		--ink-muted: #9a9ea6;
		--ink-faint: #626268;
		--card-face: #17171a;
		--card-ink: #f4f4f5;
		--card-red: #f0554a;
		--shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 16px 34px -14px rgba(0, 0, 0, 0.7);
	}

	:global(*) {
		box-sizing: border-box;
	}
	:global(::selection) {
		background: var(--glow-a);
		color: #18181b;
	}
	:global(html) {
		color-scheme: light dark;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--ink);
		font-family:
			ui-sans-serif, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		line-height: 1.5;
	}

	:global(h1, h2, h3, .wordmark, .btn-primary, .stat-headline) {
		font-family: ui-rounded, 'SF Pro Rounded', 'Segoe UI', system-ui, sans-serif;
		font-weight: 800;
	}
	:global(h1, h2, h3) {
		text-wrap: balance;
		margin: 0;
		color: var(--ink);
	}

	:global(.mono) {
		font-family: 'Roboto Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
		font-variant-numeric: tabular-nums;
	}

	:global(a) {
		color: inherit;
	}
	:global(a:focus-visible, button:focus-visible) {
		outline: 2px solid var(--glow-b);
		outline-offset: 2px;
	}

	:global(.wrap) {
		max-width: 760px;
		margin: 0 auto;
		padding: 0 24px;
	}
	:global(.eyebrow) {
		font-family: 'Roboto Mono', monospace;
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	/* ---------- header ---------- */
	header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: color-mix(in srgb, var(--bg) 85%, transparent);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--border);
	}
	.header-inner {
		padding: 16px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 18px;
	}
	:global(.wordmark) {
		font-size: 19px;
		letter-spacing: -0.02em;
		text-decoration: none;
		color: var(--ink);
	}
	:global(.header-link) {
		font-size: 13.5px;
		font-weight: 600;
		color: var(--ink-muted);
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 6px;
	}
	:global(.header-link:hover) {
		color: var(--ink);
	}
	.header-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.theme-toggle {
		display: flex;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 2px;
		gap: 2px;
	}
	.theme-toggle button {
		font-family: inherit;
		font-size: 13px;
		line-height: 1;
		width: 28px;
		height: 28px;
		border-radius: 999px;
		border: none;
		background: transparent;
		color: var(--ink-faint);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.theme-toggle button.active {
		background: var(--ink);
		color: var(--bg);
	}

	:global(.btn-outline) {
		font-family: inherit;
		font-size: 13.5px;
		font-weight: 700;
		background: transparent;
		color: var(--ink);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 7px 16px;
		cursor: pointer;
		text-decoration: none;
	}
	:global(.btn-outline:hover) {
		border-color: var(--ink);
	}

	/* ---------- hero ---------- */
	:global(.hero) {
		padding: 88px 0 64px;
		text-align: center;
	}
	:global(.placeholder-row) {
		display: flex;
		justify-content: center;
		gap: 12px;
		margin-bottom: 36px;
	}
	:global(.ph-card) {
		width: 64px;
		height: 90px;
		border-radius: 10px;
		border: 2px dashed var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30px;
		color: var(--ink-faint);
		font-weight: 800;
	}
	:global(.hero h1) {
		font-size: clamp(24px, 3.6vw, 30px);
		font-weight: 600;
		color: var(--ink-muted);
		max-width: 480px;
		margin: 0 auto 32px;
		font-family: ui-sans-serif, -apple-system, sans-serif;
	}

	@keyframes -global-spin-glow {
		to {
			background-position: 300% 50%;
		}
	}

	:global(.btn-primary) {
		position: relative;
		display: inline-block;
		font-size: 17px;
		letter-spacing: 0.03em;
		color: #fff;
		background: #0c0c0d;
		padding: 18px 56px;
		border-radius: 12px;
		text-decoration: none;
		text-transform: uppercase;
		z-index: 0;
		border: none;
		cursor: pointer;
	}
	:global(.btn-primary::before) {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: 14px;
		z-index: -1;
		background: linear-gradient(90deg, var(--glow-a), var(--glow-b), var(--glow-a));
		background-size: 300% 100%;
		animation: -global-spin-glow 5s linear infinite;
	}
	:global(.btn-primary:hover::before) {
		filter: brightness(1.15);
	}

	:global(.cta-note) {
		display: block;
		margin-top: 18px;
		font-size: 13.5px;
		color: var(--ink-muted);
	}
	:global(.cta-note a) {
		text-decoration: underline;
		font-weight: 600;
		color: var(--ink);
	}

	/* ---------- featured card ---------- */
	:global(.featured) {
		max-width: 480px;
		margin: 48px auto 0;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 20px;
		box-shadow: var(--shadow);
		padding: 26px 28px 24px;
	}
	:global(.featured .eyebrow) {
		margin-bottom: 18px;
	}

	:global(.glow-box) {
		position: relative;
		border-radius: 14px;
		padding: 22px 16px;
		margin-bottom: 16px;
		background:
			linear-gradient(var(--surface), var(--surface)) padding-box,
			linear-gradient(120deg, var(--glow-c), var(--glow-d), var(--glow-c)) border-box;
		background-size: 100% 100%, 260% 100%;
		border: 2px solid transparent;
		animation: -global-spin-glow 7s linear infinite;
	}
	:global(.hole-row) {
		display: flex;
		justify-content: center;
		gap: 6px;
		margin-bottom: 10px;
	}
	:global(.mini-card) {
		width: 34px;
		height: 46px;
		border-radius: 5px;
		background: var(--card-face);
		color: var(--card-ink);
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 3px 4px;
		font-size: 12px;
		font-weight: 700;
		font-family: Georgia, serif;
	}
	:global(.mini-card.red) {
		color: var(--card-red);
	}
	:global(.stat-headline) {
		font-size: 34px;
		text-align: center;
		letter-spacing: -0.01em;
	}
	:global(.featured .dealt-by) {
		text-align: center;
		font-size: 13.5px;
		color: var(--ink-muted);
		margin-bottom: 4px;
	}
	:global(.featured .dealt-by strong) {
		color: var(--ink);
	}
	:global(.like-pill) {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 2px 9px;
		margin-left: 6px;
		color: var(--ink-muted);
	}
	:global(.flavor-line) {
		text-align: center;
		font-size: 13px;
		color: var(--ink-faint);
		margin: 12px 0 16px;
		font-family: 'Roboto Mono', monospace;
	}
	:global(.pill-row) {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 7px;
		margin-bottom: 18px;
	}
	:global(.pill) {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 12.5px;
		font-weight: 600;
		border-radius: 999px;
		padding: 5px 11px;
		border: 1px solid;
	}
	:global(.pill.hand) {
		background: color-mix(in srgb, var(--cat-hand) 10%, var(--surface));
		color: color-mix(in srgb, var(--cat-hand) 70%, var(--ink));
		border-color: color-mix(in srgb, var(--cat-hand) 35%, var(--border));
	}
	:global(.pill.meme) {
		background: color-mix(in srgb, var(--cat-meme) 10%, var(--surface));
		color: color-mix(in srgb, var(--cat-meme) 70%, var(--ink));
		border-color: color-mix(in srgb, var(--cat-meme) 35%, var(--border));
	}
	:global(.pill.board) {
		background: color-mix(in srgb, var(--cat-board) 10%, var(--surface));
		color: color-mix(in srgb, var(--cat-board) 70%, var(--ink));
		border-color: color-mix(in srgb, var(--cat-board) 35%, var(--border));
	}

	:global(.ep-pill) {
		display: block;
		text-align: center;
		margin: 0 auto 16px;
		width: fit-content;
		font-size: 17px;
		font-weight: 800;
		padding: 8px 20px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--glow-c) 10%, var(--surface));
		color: color-mix(in srgb, var(--glow-c) 65%, var(--ink));
		border: 1px solid color-mix(in srgb, var(--glow-c) 35%, var(--border));
	}
	:global(.deals-today) {
		text-align: center;
		font-size: 12.5px;
		color: var(--ink-faint);
		text-decoration: underline;
	}

	/* ---------- rule callout ---------- */
	:global(.rule) {
		padding: 44px 0;
		border-top: 1px solid var(--border);
		text-align: center;
	}
	:global(.rule p) {
		font-size: clamp(19px, 2.8vw, 24px);
		font-weight: 700;
		line-height: 1.35;
		max-width: 540px;
		margin: 10px auto 0;
		text-wrap: balance;
	}
	:global(.rule .accent) {
		color: color-mix(in srgb, var(--glow-c) 75%, var(--ink));
	}

	/* ---------- generic sections ---------- */
	:global(.section) {
		padding: 52px 0;
		border-top: 1px solid var(--border);
	}
	:global(.section-head) {
		margin-bottom: 26px;
	}
	:global(.section-head h2) {
		font-size: 23px;
		margin-top: 8px;
	}
	:global(.section-head p) {
		color: var(--ink-muted);
		margin-top: 8px;
		font-size: 15px;
		max-width: 52ch;
	}

	:global(.steps) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
	}
	:global(.step) {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 16px 14px;
	}
	:global(.step .num) {
		font-family: 'Roboto Mono', monospace;
		font-size: 12px;
		color: var(--ink-faint);
		margin-bottom: 8px;
	}
	:global(.step h3) {
		font-size: 15px;
		margin-bottom: 6px;
	}
	:global(.step p) {
		font-size: 13.5px;
		color: var(--ink-muted);
		margin: 0;
	}

	:global(.ep-note) {
		margin-top: 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 18px;
		font-size: 14px;
		color: var(--ink-muted);
	}
	:global(.ep-note strong) {
		color: var(--ink);
	}

	:global(.ladder) {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	:global(.rung) {
		display: flex;
		align-items: center;
		gap: 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 11px 16px;
	}
	:global(.rung .dot) {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--tier-color, var(--ink-faint));
		flex-shrink: 0;
	}
	:global(.rung .name) {
		font-weight: 700;
		font-size: 14.5px;
		min-width: 128px;
	}
	:global(.rung .flavor) {
		font-size: 13px;
		color: var(--ink-muted);
	}
	:global(.rung.mythic) {
		border-color: color-mix(in srgb, var(--glow-c) 40%, var(--border));
	}
	:global(.rung.mythic .name) {
		color: color-mix(in srgb, var(--glow-c) 65%, var(--ink));
	}

	:global(.badge-grid) {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	:global(.badge-tile) {
		border-radius: 12px;
		padding: 14px 10px;
		text-align: center;
		border: 1px solid;
	}
	:global(.badge-tile .glyph) {
		font-family: Georgia, serif;
		font-weight: 700;
		font-size: 14px;
		margin-bottom: 6px;
	}
	:global(.badge-tile .name) {
		font-size: 12.5px;
		font-weight: 700;
	}
	:global(.badge-tile .desc) {
		font-size: 11px;
		color: var(--ink-muted);
		margin-top: 2px;
	}

	:global(.share-card) {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	:global(.share-card .text) {
		font-size: 13.5px;
	}
	:global(.copy-btn) {
		font-family: inherit;
		font-size: 12.5px;
		font-weight: 700;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--ink-muted);
		border-radius: 8px;
		padding: 7px 12px;
		cursor: pointer;
		white-space: nowrap;
	}
	:global(.copy-btn:hover) {
		border-color: var(--ink);
		color: var(--ink);
	}

	:global(table.board) {
		width: 100%;
		border-collapse: collapse;
		font-size: 13.5px;
	}
	:global(table.board th) {
		text-align: left;
		font-family: 'Roboto Mono', monospace;
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
		font-weight: 500;
		padding: 0 10px 8px;
		border-bottom: 1px solid var(--border);
	}
	:global(table.board td) {
		padding: 10px;
		border-bottom: 1px solid var(--border);
	}
	:global(table.board tr:last-child td) {
		border-bottom: none;
	}
	:global(table.board td.rank) {
		color: var(--ink-faint);
		width: 2ch;
	}
	:global(table.board td.ep) {
		text-align: right;
		font-weight: 700;
		color: color-mix(in srgb, var(--glow-c) 60%, var(--ink));
	}
	:global(.board-note) {
		font-size: 12.5px;
		color: var(--ink-faint);
		margin-top: 10px;
	}

	:global(.policy-block) {
		margin-bottom: 30px;
	}
	:global(.policy-block:last-child) {
		margin-bottom: 0;
	}
	:global(.policy-block h3) {
		font-size: 16px;
		margin-bottom: 8px;
	}
	:global(.policy-block p) {
		font-size: 14.5px;
		color: var(--ink-muted);
		margin: 0 0 8px;
		max-width: 62ch;
	}
	:global(.policy-block p:last-child) {
		margin-bottom: 0;
	}
	:global(.policy-block code) {
		font-family: 'Roboto Mono', monospace;
		font-size: 13px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 5px;
		padding: 1px 6px;
	}
	:global(.policy-block a) {
		text-decoration: underline;
		font-weight: 600;
		color: var(--ink);
	}

	:global(.status-note) {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 18px;
		font-size: 14px;
		color: var(--ink-muted);
		margin-bottom: 30px;
	}
	:global(.status-note strong) {
		color: var(--ink);
	}

	:global(.final-cta) {
		padding: 60px 0;
		text-align: center;
	}
	:global(.final-cta h2) {
		font-size: 25px;
		margin-bottom: 8px;
	}
	:global(.final-cta p) {
		color: var(--ink-muted);
		font-size: 15px;
		margin-bottom: 28px;
	}

	footer {
		border-top: 1px solid var(--border);
		padding: 28px 0 40px;
		text-align: center;
		font-size: 12.5px;
		color: var(--ink-faint);
	}
	footer :global(a) {
		text-decoration: underline;
	}

	@media (max-width: 620px) {
		:global(.steps) {
			grid-template-columns: 1fr 1fr;
		}
		:global(.badge-grid) {
			grid-template-columns: repeat(2, 1fr);
		}
		:global(.share-card) {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}
		.header-left :global(.header-link) {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.btn-primary::before),
		:global(.glow-box) {
			animation: none;
			background-position: 0 0;
		}
	}
</style>
