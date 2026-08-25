<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { preloadSounds, playSound, soundState } from '$lib/client/sounds.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Street = 'preflop' | 'flop' | 'turn' | 'river';
	const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river'];

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

	// Card width + row gap for each row — kept in sync with Card.svelte's .hole/.board sizes.
	// Used to compute how far a card has to slide to land on top of slot 0 (the "pile" spot).
	const HOLE_SPACING = 66; // 56px card + 10px gap
	const BOARD_SPACING = 58; // 48px card + 10px gap

	interface CardVM {
		id: string;
		role: 'hole' | 'board' | 'burn';
		slot: number;
		code: string;
		faceUp: boolean;
		x: number;
		y: number;
		rot: number;
	}

	type Phase = 'idle' | 'dealing' | 'revealing' | 'done' | 'error';
	let phase = $state<Phase>('idle');
	let deal = $state<ScoredDeal | null>(null);
	let cards = $state<CardVM[]>([]);
	let revealedStreets = $state<Street[]>([]);
	let scoredStreets = $state<Street[]>([]);
	let runningTotal = $state(0);
	let error = $state<string | null>(null);

	function cardAt(role: CardVM['role'], slot: number): CardVM | undefined {
		return cards.find((c) => c.role === role && c.slot === slot);
	}

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
	// Two rAFs, not one: the first just schedules "next paint," which can still land in the same
	// frame as the card's initial (off-slot) style. The second guarantees a frame was actually
	// painted at the start position before we move the target and trigger the CSS transition.
	function nextFrame(): Promise<void> {
		return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
	}

	/** Deals one or more cards into their slots at once: each mounts off the top of its slot,
	 *  face down, then falls into place, staggered so a multi-card deal doesn't land as one sound. */
	async function dealBatch(entries: { role: CardVM['role']; slot: number; code: string }[]) {
		const ids = entries.map(({ role, slot, code }) => {
			const id = `${role}-${slot}`;
			cards.push({ id, role, slot, code, faceUp: false, x: 0, y: -70, rot: slot % 2 ? 6 : -6 });
			return id;
		});
		await nextFrame();
		ids.forEach((id, n) => {
			setTimeout(() => {
				playSound(n % 2 === 0 ? 'deal1' : 'deal2');
				const c = cards.find((c) => c.id === id)!;
				c.y = 0;
				c.rot = 0;
			}, n * 150);
		});
		await sleep((ids.length - 1) * 150 + 420);
	}

	/** A card slides from the deck to the discard pile, face down, and stays there. Each burn
	 *  lands with a small offset from the last so they visibly stack rather than overlap exactly. */
	async function burnCard(slot: number) {
		const id = `burn-${slot}`;
		cards.push({ id, role: 'burn', slot, code: '2s', faceUp: false, x: slot * 6, y: -70, rot: -4 });
		await nextFrame();
		playSound('slide1', { gain: 0.6 });
		cards.find((c) => c.id === id)!.y = slot * 5;
		await sleep(420);
	}

	/** Slides every card in `slots` (except slot 0, which stays put) onto slot 0's position — the
	 *  broadcast-style "gather into a pile before the flip" beat. */
	async function convergeToPile(role: CardVM['role'], slots: number[], spacing: number) {
		playSound('slide1');
		for (const slot of slots) {
			if (slot === 0) continue;
			cardAt(role, slot)!.x = -slot * spacing;
		}
		await sleep(420);
	}

	/** Flips every card in the pile face up in one motion — visually only the top card is visible
	 *  changing, since the rest are stacked underneath it. */
	async function flipPile(role: CardVM['role'], slots: number[]) {
		playSound('flip');
		for (const slot of slots) cardAt(role, slot)!.faceUp = true;
		await sleep(420);
	}

	/** Slides each piled card back out to its own slot, staggered, revealing them one at a time. */
	async function divergeFromPile(role: CardVM['role'], slots: number[]) {
		const moving = slots.filter((slot) => slot !== 0);
		moving.forEach((slot, n) => {
			setTimeout(() => {
				playSound(n % 2 === 0 ? 'slide1' : 'slide2');
				cardAt(role, slot)!.x = 0;
			}, n * 160);
		});
		await sleep(Math.max(0, (moving.length - 1) * 160 + 420));
	}

	async function tweenTotal(target: number) {
		const start = runningTotal;
		const startTime = performance.now();
		const DURATION = 650;
		await new Promise<void>((resolve) => {
			function step(now: number) {
				const t = Math.min(1, (now - startTime) / DURATION);
				const eased = 1 - Math.pow(1 - t, 3);
				runningTotal = start + (target - start) * eased;
				if (t < 1) requestAnimationFrame(step);
				else {
					runningTotal = target;
					resolve();
				}
			}
			requestAnimationFrame(step);
		});
	}

	async function scoreStreet(result: ScoredDeal, street: Street) {
		revealedStreets = [...revealedStreets, street];
		const { ep } = result.perStreetEp[street];
		if (ep > 0) {
			playSound('score');
			scoredStreets = [...scoredStreets, street];
		}
		await tweenTotal(runningTotal + ep);
	}

	async function playReveal(result: ScoredDeal) {
		phase = 'revealing';
		cards = [];
		revealedStreets = [];
		scoredStreets = [];
		runningTotal = 0;

		// Preflop: deal both hole cards, gather into a pile, flip together, spread back out.
		await dealBatch([
			{ role: 'hole', slot: 0, code: result.holeCards[0] },
			{ role: 'hole', slot: 1, code: result.holeCards[1] }
		]);
		await sleep(350);
		await convergeToPile('hole', [0, 1], HOLE_SPACING);
		await sleep(300);
		await flipPile('hole', [0, 1]);
		await sleep(350);
		await divergeFromPile('hole', [0, 1]);
		await sleep(250);
		await scoreStreet(result, 'preflop');
		await sleep(1100);

		// Flop: burn, deal 3, gather, flip, spread.
		await burnCard(0);
		await sleep(300);
		await dealBatch([
			{ role: 'board', slot: 0, code: result.board[0] },
			{ role: 'board', slot: 1, code: result.board[1] },
			{ role: 'board', slot: 2, code: result.board[2] }
		]);
		await sleep(350);
		await convergeToPile('board', [0, 1, 2], BOARD_SPACING);
		await sleep(300);
		await flipPile('board', [0, 1, 2]);
		await sleep(350);
		await divergeFromPile('board', [0, 1, 2]);
		await sleep(250);
		await scoreStreet(result, 'flop');
		await sleep(1100);

		// Turn: single card, no pile needed.
		await dealBatch([{ role: 'board', slot: 3, code: result.board[3] }]);
		await sleep(300);
		await flipPile('board', [3]);
		await sleep(250);
		await scoreStreet(result, 'turn');
		await sleep(1100);

		// River: burn, then a single card.
		await burnCard(1);
		await sleep(300);
		await dealBatch([{ role: 'board', slot: 4, code: result.board[4] }]);
		await sleep(300);
		await flipPile('board', [4]);
		await sleep(250);
		await scoreStreet(result, 'river');
		await sleep(1200);

		phase = 'done';
	}

	/** Skips straight to the finished state — used for a reload (deal already committed today) and
	 *  for prefers-reduced-motion, neither of which should sit through the ~25s reveal. */
	function showFinalInstantly(result: ScoredDeal) {
		cards = [
			...result.holeCards.map((code, slot) => ({ id: `hole-${slot}`, role: 'hole' as const, slot, code, faceUp: true, x: 0, y: 0, rot: 0 })),
			...result.board.map((code, slot) => ({ id: `board-${slot}`, role: 'board' as const, slot, code, faceUp: true, x: 0, y: 0, rot: 0 }))
		];
		revealedStreets = [...STREET_ORDER];
		scoredStreets = STREET_ORDER.filter((s) => result.perStreetEp[s].ep > 0);
		runningTotal = result.totalEp;
		phase = 'done';
	}

	async function handleDeal() {
		error = null;
		phase = 'dealing';
		try {
			const [res] = await Promise.all([fetch('/deal', { method: 'POST' }), preloadSounds().catch(() => {})]);
			if (!res.ok) throw new Error(`Server said ${res.status}`);
			const result: ScoredDeal = await res.json();
			deal = result;

			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (result.alreadyDealt || reduceMotion) {
				showFinalInstantly(result);
				return;
			}

			await playReveal(result);
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
			{#if error}
				<p class="reveal-error">{error}</p>
			{/if}
		{:else if deal}
			<div class="reveal">
				<div class="table-row hole-row">
					{#each [0, 1] as slot (slot)}
						{@const c = cardAt('hole', slot)}
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
						{#each cards.filter((c) => c.role === 'burn') as c (c.id)}
							<Card code={c.code} faceUp={false} x={c.x} y={c.y} rot={c.rot} size="burn" />
						{/each}
					</div>
					{#each [0, 1, 2, 3, 4] as slot (slot)}
						{@const c = cardAt('board', slot)}
						{#if c}
							<Card code={c.code} faceUp={c.faceUp} x={c.x} y={c.y} rot={c.rot} size="board" />
						{:else}
							<div class="placeholder board"></div>
						{/if}
					{/each}
				</div>

				{#if currentBest}
					<div class="stat-headline">{currentBest}</div>
				{/if}

				<span class="ep-pill mono">{runningTotal.toFixed(2)} EP</span>

				{#if scoredStreets.length}
					<div class="pill-row">
						{#each scoredStreets as street (street)}
							<span class="pill hand">+{deal.perStreetEp[street].ep.toFixed(2)} EP · {deal.perStreetEp[street].category}</span>
						{/each}
					</div>
				{/if}

				{#if phase === 'done'}
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
