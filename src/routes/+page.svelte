<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { preloadSounds, playSound, soundState } from '$lib/client/sounds.svelte';
	import { createRevealEngine, type ScoredDeal } from '$lib/client/reveal.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const engine = createRevealEngine();

	async function handleDeal() {
		engine.startDealing();
		try {
			const [res] = await Promise.all([fetch('/deal', { method: 'POST' }), preloadSounds().catch(() => {})]);
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
		{#if engine.phase === 'idle' || engine.phase === 'dealing' || engine.phase === 'error'}
			<div class="placeholder-row">
				<div class="ph-card">?</div>
				<div class="ph-card">?</div>
			</div>
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

				<div class="table-row board-row">
					<div class="burn-pile">
						{#each engine.cards.filter((c) => c.role === 'burn') as c (c.id)}
							<Card code={c.code} faceUp={false} x={c.x} y={c.y} rot={c.rot} size="burn" />
						{/each}
					</div>
					{#each [0, 1, 2, 3, 4] as slot (slot)}
						{@const c = engine.cardAt('board', slot)}
						{#if c}
							<Card code={c.code} faceUp={c.faceUp} x={c.x} y={c.y} rot={c.rot} size="board" />
						{:else}
							<div class="placeholder board"></div>
						{/if}
					{/each}
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
		left: -52px;
		bottom: 6px;
		width: 38px;
		height: 52px;
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
