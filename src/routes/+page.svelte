<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Street = 'preflop' | 'flop' | 'turn' | 'river';
	const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river'];
	// How much of the 5-card board is visible once a given street has been revealed.
	const BOARD_COUNT: Record<Street, number> = { preflop: 0, flop: 3, turn: 4, river: 5 };
	// How long to hold on each street before moving to the next, tuned so the full reveal lands
	// around DLE.md's "~30-second theatrical reveal" (they sum to ~27s).
	const HOLD_MS: Record<Street, number> = { preflop: 3500, flop: 8000, turn: 7500, river: 8000 };

	interface StreetResult {
		category: string;
		ep: number;
	}
	interface ScoredDeal {
		holeCards: string[];
		board: string[];
		perStreetEp: Record<Street, StreetResult>;
		totalEp: number;
		handRank: string;
		alreadyDealt: boolean;
	}

	type Phase = 'idle' | 'dealing' | 'revealing' | 'done' | 'error';
	let phase = $state<Phase>('idle');
	let deal = $state<ScoredDeal | null>(null);
	let revealedStreets = $state<Street[]>([]);
	let error = $state<string | null>(null);

	let revealedBoardCount = $derived(
		revealedStreets.length ? BOARD_COUNT[revealedStreets[revealedStreets.length - 1]] : 0
	);
	// Badges accumulate as the reveal plays — every street where the best hand actually improved.
	let scoredStreets = $derived(
		revealedStreets.filter((s) => deal && deal.perStreetEp[s].ep > 0)
	);
	let currentBest = $derived(
		deal && revealedStreets.length ? deal.perStreetEp[revealedStreets[revealedStreets.length - 1]].category : null
	);

	const SUIT_SYMBOL: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
	function rankOf(code: string): string {
		return code.slice(0, -1);
	}
	function suitSymbolOf(code: string): string {
		return SUIT_SYMBOL[code.slice(-1)];
	}
	function isRed(code: string): boolean {
		return code.endsWith('h') || code.endsWith('d');
	}

	function sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function handleDeal() {
		error = null;
		phase = 'dealing';
		try {
			const res = await fetch('/deal', { method: 'POST' });
			if (!res.ok) throw new Error(`Server said ${res.status}`);
			const result: ScoredDeal = await res.json();

			if (result.alreadyDealt) {
				// Already have today's deal (e.g. a reload) — show it straight away, no replay.
				deal = result;
				revealedStreets = [...STREET_ORDER];
				phase = 'done';
				return;
			}

			deal = result;
			revealedStreets = [];
			phase = 'revealing';
			for (const street of STREET_ORDER) {
				revealedStreets = [...revealedStreets, street];
				await sleep(HOLD_MS[street]);
			}
			phase = 'done';
		} catch {
			error = "Couldn't reach the table — try again in a moment.";
			phase = 'error';
		}
	}
</script>

<svelte:head>
	<title>Freeroll — one deal a day</title>
</svelte:head>

<section class="hero">
	<div class="wrap">
		{#if phase === 'idle' || phase === 'dealing' || phase === 'error'}
			<div class="placeholder-row">
				<div class="ph-card">?</div>
				<div class="ph-card">?</div>
			</div>
			<h1>One deal a day. Two hole cards, five on the board. What will yours be?</h1>
			<button class="btn-primary" onclick={handleDeal} disabled={phase === 'dealing'}>
				{phase === 'dealing' ? 'Dealing…' : 'Deal'}
			</button>
			{#if !data.user}
				<span class="cta-note"><a href="/login">Sign up</a> before you deal to save it and climb the leaderboard</span>
			{/if}
			{#if error}
				<p class="reveal-error">{error}</p>
			{/if}
		{:else if deal}
			<div class="reveal">
				<div class="reveal-hole-row">
					{#each deal.holeCards as code (code)}
						<div class="reveal-card" class:red={isRed(code)}>
							<span>{rankOf(code)}</span><span>{suitSymbolOf(code)}</span>
						</div>
					{/each}
				</div>
				<div class="reveal-board-row">
					{#each deal.board as code, i (i)}
						{#if revealedBoardCount > i}
							<div class="reveal-card board" class:red={isRed(code)}>
								<span>{rankOf(code)}</span><span>{suitSymbolOf(code)}</span>
							</div>
						{:else}
							<div class="reveal-card back"></div>
						{/if}
					{/each}
				</div>

				{#if currentBest}
					<div class="stat-headline">{currentBest}</div>
				{/if}

				{#if scoredStreets.length}
					<div class="pill-row">
						{#each scoredStreets as street (street)}
							<span class="pill hand">+{deal.perStreetEp[street].ep.toFixed(2)} EP · {deal.perStreetEp[street].category}</span>
						{/each}
					</div>
				{/if}

				{#if phase === 'done'}
					<span class="ep-pill mono">{deal.totalEp.toFixed(2)} EP total</span>
					{#if !data.user}
						<span class="cta-note"><a href="/login">Sign up</a> to save this deal and appear on the leaderboard</span>
					{:else if deal.alreadyDealt}
						<span class="cta-note">Come back tomorrow for your next deal.</span>
					{/if}
				{/if}
			</div>
		{/if}

		<div class="featured" id="board">
			<div class="eyebrow">Today's best deal</div>
			<div class="glow-box">
				<div class="hole-row">
					<div class="mini-card"><span>8</span><span>♠</span></div>
					<div class="mini-card red"><span>8</span><span>♥</span></div>
				</div>
				<div class="stat-headline">FULL HOUSE</div>
			</div>
			<div class="dealt-by">dealt to <strong>riverrat</strong><span class="like-pill">♡ 812</span></div>
			<div class="flavor-line">boat over kings, flopped, no apologies</div>
			<div class="pill-row">
				<span class="pill hand">🏠 Full House</span>
				<span class="pill meme">⚡ Flopped It</span>
				<span class="pill board">🎯 Paired Flop</span>
			</div>
			<span class="ep-pill mono">8,420 EP</span>
			<!-- svelte-ignore a11y_invalid_attribute -- placeholder, real leaderboard link comes with the app (later PR) -->
			<a class="deals-today mono" href="#">1,204 deals today</a>
		</div>
	</div>
</section>

<style>
	.reveal {
		max-width: 480px;
		margin: 0 auto;
	}
	.reveal-hole-row,
	.reveal-board-row {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-bottom: 16px;
	}
	.reveal-card {
		width: 56px;
		height: 78px;
		border-radius: 8px;
		background: var(--card-face);
		color: var(--card-ink);
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 6px 7px;
		font-size: 20px;
		font-weight: 700;
		font-family: Georgia, serif;
		box-shadow: var(--shadow);
	}
	.reveal-card.red {
		color: var(--card-red);
	}
	.reveal-card.board {
		width: 48px;
		height: 66px;
		font-size: 17px;
	}
	.reveal-card.back {
		width: 48px;
		height: 66px;
		border-radius: 8px;
		border: 2px dashed var(--border);
		background: none;
	}
	.reveal-error {
		margin-top: 14px;
		font-size: 13.5px;
		color: var(--card-red);
	}
</style>
