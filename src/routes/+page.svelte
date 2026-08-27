<script lang="ts">
	import { untrack } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import MiniCards from '$lib/components/MiniCards.svelte';
	import { preloadSounds, playSound, soundState } from '$lib/client/sounds.svelte';
	import { createRevealEngine, type ScoredDeal } from '$lib/client/reveal.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const engine = createRevealEngine();

	// Already dealt today (server-checked in +page.server.ts, read-only) — land straight on the
	// finished state instead of showing a live-looking Deal button that would just re-fetch this
	// same result on click. Deliberately a one-shot read of the value `data` had at mount
	// (`untrack` — same reasoning as reduceMotion in handleDeal below): this engine state is what
	// drives the reveal from here on, not something that should reset if `data` is later
	// invalidated for an unrelated reason.
	const todaysDeal = untrack(() => data.todaysDeal);
	if (todaysDeal) {
		engine.deal = todaysDeal;
		engine.showFinalInstantly(todaysDeal);
	}

	// How poker players actually talk about the street a hand came together on — mirrors the
	// `achievedOn` street featuredDealToday derives server-side from the deal's own per-street EP.
	const STREET_VERB: Record<string, string> = { preflop: 'dealt preflop', flop: 'flopped', turn: 'turned', river: 'rivered' };

	async function handleDeal() {
		engine.startDealing();
		try {
			const [res] = await Promise.all([
				fetch('/deal', { method: 'POST' }),
				preloadSounds().catch(() => {}),
				engine.shuffleDeck()
			]);
			if (!res.ok) throw new Error(`Server said ${res.status}`);
			const result: ScoredDeal = await res.json();
			engine.deal = result;

			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (result.alreadyDealt || reduceMotion) {
				engine.showFinalInstantly(result);
				return;
			}

			await engine.playReveal(result);
		} catch {
			engine.fail("Couldn't reach the table — try again in a moment.");
		}
	}
</script>

<svelte:head>
	<title>Freeroll — one deal a day</title>
</svelte:head>

<section class="hero">
	<div class="wrap">
		<!-- Persistent across every phase — never mounts/unmounts, so it never pops in. Every dealt
		     card flies from here once dealing starts; see DECK_Y_BOARD/DECK_Y_HOLE in
		     reveal.svelte.ts. .shuffling plays a riffle-riffle-cut while the /deal fetch is in flight. -->
		<div class="deck" class:shuffling={engine.phase === 'dealing'}>
			<div class="deck-card"></div>
			<div class="deck-card"></div>
			<div class="deck-card"></div>
		</div>

		{#if engine.phase === 'idle' || engine.phase === 'dealing' || engine.phase === 'error'}
			<h1>One deal a day. Two hole cards, five on the board. What will yours be?</h1>
			<button class="btn-primary" onclick={handleDeal} disabled={engine.phase === 'dealing'}>
				{engine.phase === 'dealing' ? 'Dealing…' : 'Deal'}
			</button>
			<button
				type="button"
				class="mute-toggle"
				aria-label={soundState.muted ? 'Unmute sound' : 'Mute sound'}
				onclick={() => soundState.toggle()}
			>
				{soundState.muted ? '🔇' : '🔊'}
			</button>
			{#if !data.user}
				<span class="cta-note"><a href="/login">Sign up</a> before you deal to save it and climb the leaderboard</span>
			{/if}
			{#if engine.error}
				<p class="reveal-error">{engine.error}</p>
			{/if}
		{:else if engine.deal}
			<div class="reveal">
				<!-- Board above hole cards — poker-video-game layout, board is the shared/community
				     state so it reads top, the player's own cards sit below it. -->
				<div class="table-row board-row">
					{#each [0, 1, 2, 3, 4] as slot (slot)}
						{@const c = engine.cardAt('board', slot)}
						{#if c}
							<Card code={c.code} faceUp={c.faceUp} x={c.x} y={c.y} rot={c.rot} size="board" />
						{:else}
							<div class="placeholder board"></div>
						{/if}
					{/each}
					<div class="burn-pile">
						{#each engine.cards.filter((c) => c.role === 'burn') as c (c.id)}
							<Card code={c.code} faceUp={false} x={c.x} y={c.y} rot={c.rot} size="burn" />
						{/each}
					</div>
				</div>

				<div class="table-row hole-row">
					{#each [0, 1] as slot (slot)}
						{@const c = engine.cardAt('hole', slot)}
						{#if c}
							<Card code={c.code} faceUp={c.faceUp} x={c.x} y={c.y} rot={c.rot} size="hole" />
						{:else}
							<div class="placeholder hole"></div>
						{/if}
					{/each}
					<button
						type="button"
						class="mute-toggle inline"
						aria-label={soundState.muted ? 'Unmute sound' : 'Mute sound'}
						onclick={() => soundState.toggle()}
					>
						{soundState.muted ? '🔇' : '🔊'}
					</button>
				</div>

				{#if engine.currentBest}
					<div class="stat-headline">{engine.currentBest}</div>
				{/if}

				<span class="ep-pill mono">{engine.runningTotal.toFixed(2)} EP</span>

				{#if engine.scoredStreets.length}
					<div class="pill-row">
						{#each engine.scoredStreets as street (street)}
							<span class="pill hand">+{engine.deal.perStreetEp[street].ep.toFixed(2)} EP · {engine.deal.perStreetEp[street].category}</span>
						{/each}
					</div>
				{/if}

				{#if engine.phase === 'done'}
					{#if !data.user}
						<span class="cta-note"><a href="/login">Sign up</a> to save this deal and appear on the leaderboard</span>
					{:else if engine.deal.alreadyDealt}
						<span class="cta-note">Come back tomorrow for your next deal.</span>
					{/if}
				{/if}
			</div>
		{/if}

		<div class="featured" id="board">
			<div class="eyebrow">Today's best deal</div>
			{#if data.featured}
				<div class="glow-box">
					<MiniCards holeCards={data.featured.holeCards} board={data.featured.board} />
					<div class="stat-headline">{data.featured.handRank.toUpperCase()}</div>
				</div>
				<div class="dealt-by">dealt to <strong>{data.featured.nickname}</strong></div>
				{#if data.featured.achievedOn}
					<div class="flavor-line">{STREET_VERB[data.featured.achievedOn]}</div>
				{/if}
				<span class="ep-pill mono">{data.featured.totalEp.toLocaleString()} EP</span>
			{:else}
				<div class="glow-box">
					<div class="stat-headline">?</div>
				</div>
				<div class="dealt-by">nobody signed in has dealt today — could be you</div>
			{/if}
			<a class="deals-today mono" href="/leaderboard">{data.dealsToday.toLocaleString()} deals today</a>
		</div>
	</div>
</section>

<style>
	.reveal {
		max-width: 520px;
		margin: 0 auto;
	}
	.table-row {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		gap: 10px;
		margin-bottom: 16px;
		position: relative;
	}
	.placeholder {
		border-radius: 8px;
		border: 2px dashed var(--border);
		flex: none;
	}
	.placeholder.hole {
		width: 56px;
		height: 78px;
	}
	.placeholder.board {
		width: 48px;
		height: 66px;
	}
	.burn-pile {
		/* Its own placement in .board-row (absolute, off to the side) doubles as the positioning
		   context its burn Card children stack inside via their own x/y offsets. */
		position: absolute;
		right: -52px;
		bottom: 6px;
		width: 38px;
		height: 52px;
	}
	.deck {
		position: relative;
		width: 38px;
		height: 52px;
		margin: 0 auto 22px;
	}
	.deck-card {
		position: absolute;
		inset: 0;
		border-radius: 7px;
		border: 1px solid var(--border);
		box-shadow: var(--shadow);
		background: repeating-linear-gradient(
			45deg,
			var(--border),
			var(--border) 3px,
			var(--surface) 3px,
			var(--surface) 7px
		);
	}
	.deck-card:nth-child(1) {
		transform: translate(-2px, 2px);
	}
	.deck-card:nth-child(2) {
		transform: translate(-1px, 1px);
	}
	/* Riffle, riffle, cut — the casino-standard shuffle procedure, minus the wash (that only
	   happens once for a fresh deck, not before every hand). Each card gets its own keyframes so
	   the three layers riffle against each other instead of moving as one block; the .deck-card
	   with no nth-child override (the top card) gets the "cut": a lift-and-shift near the end. */
	.deck.shuffling .deck-card:nth-child(1) {
		animation: riffle-back 2200ms ease-in-out;
	}
	.deck.shuffling .deck-card:nth-child(2) {
		animation: riffle-mid 2200ms ease-in-out;
	}
	.deck.shuffling .deck-card:nth-child(3) {
		animation: riffle-top 2200ms ease-in-out;
	}
	@keyframes riffle-back {
		0%, 100% { transform: translate(-2px, 2px) rotate(0deg); }
		15% { transform: translate(-8px, 0px) rotate(-9deg); }
		30% { transform: translate(-2px, 2px) rotate(0deg); }
		50% { transform: translate(-8px, 0px) rotate(-9deg); }
		65% { transform: translate(-2px, 2px) rotate(0deg); }
	}
	@keyframes riffle-mid {
		0%, 100% { transform: translate(-1px, 1px) rotate(0deg); }
		15% { transform: translate(6px, -1px) rotate(8deg); }
		30% { transform: translate(-1px, 1px) rotate(0deg); }
		50% { transform: translate(6px, -1px) rotate(8deg); }
		65% { transform: translate(-1px, 1px) rotate(0deg); }
	}
	@keyframes riffle-top {
		0%, 100% { transform: translate(0, 0) rotate(0deg); }
		15% { transform: translate(1px, -3px) rotate(2deg); }
		30% { transform: translate(0, 0) rotate(0deg); }
		50% { transform: translate(1px, -3px) rotate(2deg); }
		65% { transform: translate(0, 0) rotate(0deg); }
		80% { transform: translate(-5px, -9px) rotate(-8deg); }
		92% { transform: translate(4px, 3px) rotate(5deg); }
	}
	.mute-toggle {
		position: absolute;
		right: -4px;
		bottom: 0;
		background: none;
		border: 1px solid var(--border);
		border-radius: 999px;
		width: 30px;
		height: 30px;
		font-size: 14px;
		cursor: pointer;
		line-height: 1;
	}
	.mute-toggle:not(.inline) {
		position: static;
		display: block;
		margin: 14px auto 0;
	}
	.reveal-error {
		margin-top: 14px;
		font-size: 13.5px;
		color: var(--card-red);
	}
</style>
