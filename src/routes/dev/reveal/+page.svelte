<script lang="ts">
	// Replay harness for the deal reveal choreography — see reveal.svelte.ts. Mints throwaway
	// hands via /dev/reveal/deal (no DB commit, no once-a-day gate) so the animation can be
	// re-triggered instantly instead of waiting on a real daily deal. Dev-only: 404s in +page.server.ts
	// outside `vite dev`.
	import Card from '$lib/components/Card.svelte';
	import { preloadSounds, soundState } from '$lib/client/sounds.svelte';
	import { createRevealEngine, revealSpeed, type ScoredDeal } from '$lib/client/reveal.svelte';

	const engine = createRevealEngine();
	let lastDeal = $state<ScoredDeal | null>(null);
	let instant = $state(false);

	async function run(result: ScoredDeal) {
		engine.deal = result;
		if (instant) {
			engine.showFinalInstantly(result);
		} else {
			await engine.playReveal(result);
		}
	}

	async function dealNew() {
		engine.startDealing();
		try {
			const [res] = await Promise.all([
				fetch('/dev/reveal/deal', { method: 'POST' }),
				preloadSounds().catch(() => {})
			]);
			if (!res.ok) throw new Error(`Server said ${res.status}`);
			const result: ScoredDeal = await res.json();
			lastDeal = result;
			await run(result);
		} catch {
			engine.fail('Failed to mint a dev hand — check the console.');
		}
	}

	async function replay() {
		if (!lastDeal) return;
		engine.startDealing();
		await preloadSounds().catch(() => {});
		await run(lastDeal);
	}
</script>

<svelte:head>
	<title>Reveal harness — dev</title>
</svelte:head>

<section class="harness">
	<h1>Reveal harness</h1>
	<p class="note">
		Dev-only replay loop for the deal reveal in <code>reveal.svelte.ts</code>. Doesn't touch the
		DB or the once-a-day gate — every "Deal" mints a fresh throwaway hand.
	</p>

	<div class="controls">
		<button class="btn-primary" onclick={dealNew} disabled={engine.phase === 'dealing' || engine.phase === 'revealing'}>
			Deal new hand
		</button>
		<button onclick={replay} disabled={!lastDeal || engine.phase === 'dealing' || engine.phase === 'revealing'}>
			Replay same hand
		</button>

		<label class="field">
			<input type="checkbox" bind:checked={instant} />
			Instant (skip animation)
		</label>

		<label class="field">
			Speed {revealSpeed.value.toFixed(2)}×
			<input type="range" min="0.25" max="4" step="0.05" bind:value={revealSpeed.value} />
		</label>

		<button type="button" class="mute-toggle" onclick={() => soundState.toggle()}>
			{soundState.muted ? '🔇 muted' : '🔊 sound on'}
		</button>

		<span class="phase mono">phase: {engine.phase}</span>
	</div>

	{#if engine.error}
		<p class="err">{engine.error}</p>
	{/if}

	<div class="table">
		<div class="table-row hole-row">
			{#each [0, 1] as slot (slot)}
				{@const c = engine.cardAt('hole', slot)}
				{#if c}
					<Card code={c.code} faceUp={c.faceUp} x={c.x} y={c.y} rot={c.rot} size="hole" />
				{:else}
					<div class="placeholder hole"></div>
				{/if}
			{/each}
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
					{@const s = engine.deal!.perStreetEp[street]}
					<span class="pill hand">+{s.ep.toFixed(2)} EP · {s.category}</span>
				{/each}
			</div>
		{/if}
	</div>

	{#if lastDeal}
		<details class="raw">
			<summary>Raw deal JSON</summary>
			<pre>{JSON.stringify(lastDeal, null, 2)}</pre>
		</details>
	{/if}
</section>

<style>
	.harness {
		max-width: 640px;
		margin: 0 auto;
		padding: 32px 16px 80px;
	}
	.note {
		font-size: 13.5px;
		color: var(--muted, #888);
		margin-bottom: 20px;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 14px;
		padding: 14px;
		border: 1px solid var(--border);
		border-radius: 10px;
		margin-bottom: 24px;
	}
	.field {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13.5px;
	}
	.mute-toggle {
		border: 1px solid var(--border);
		border-radius: 999px;
		background: none;
		padding: 6px 12px;
		font-size: 13px;
		cursor: pointer;
	}
	.phase {
		font-size: 12.5px;
		color: var(--muted, #888);
		margin-left: auto;
	}
	.err {
		color: var(--card-red);
		font-size: 13.5px;
		margin-bottom: 16px;
	}
	.table {
		min-height: 220px;
		display: flex;
		flex-direction: column;
		align-items: center;
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
		position: absolute;
		left: -52px;
		bottom: 6px;
		width: 38px;
		height: 52px;
	}
	.raw {
		margin-top: 28px;
		font-size: 12.5px;
	}
	.raw pre {
		overflow-x: auto;
		padding: 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
	}
</style>
