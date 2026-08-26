// The broadcast-style reveal choreography (deal → pile → flip → spread), factored out of
// +page.svelte so the production Deal button and the /dev/reveal replay harness drive the exact
// same code — tweaking a timing or easing value only has to happen in one place, and both
// surfaces see it identically.
import { playSound } from './sounds.svelte';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river'];

export interface StreetResult {
	category: string;
	ep: number;
}
export interface ScoredDeal {
	holeCards: string[];
	board: string[];
	perStreetEp: Record<Street, StreetResult>;
	totalEp: number;
	handRank: string;
	alreadyDealt: boolean;
}

// Card width + row gap for each row — kept in sync with Card.svelte's .hole/.board sizes. Used to
// compute how far a card has to slide to land on top of slot 0 (the "pile" spot), and — combined
// with DECK_Y below — how far it has to fan out from the deck to reach its own slot on deal-in.
export const HOLE_SPACING = 66; // 56px card + 10px gap
export const BOARD_SPACING = 58; // 48px card + 10px gap

// The deck (see .deck in +page.svelte/dev/reveal's markup) sits center-top, above the board row.
// Every dealt card's on-mount position is expressed as an offset from *its own slot*, so a card
// "coming from the deck" needs that offset computed back from the deck's position: horizontally,
// pulled toward row-center (slot 0 of a centered N-card row sits (N-1)/2 slots off-center);
// vertically, however far the deck sits above that row. Hole cards travel further than board
// cards because the hole row sits below the board row, past it.
const DECK_Y_BOARD = -90;
const DECK_Y_HOLE = -190;

function dealStartX(role: 'hole' | 'board', slot: number): number {
	const spacing = role === 'hole' ? HOLE_SPACING : BOARD_SPACING;
	const rowSize = role === 'hole' ? 2 : 5;
	return -(slot - (rowSize - 1) / 2) * spacing;
}

function dealStartY(role: 'hole' | 'board'): number {
	return role === 'hole' ? DECK_Y_HOLE : DECK_Y_BOARD;
}

export interface CardVM {
	id: string;
	role: 'hole' | 'board' | 'burn';
	slot: number;
	code: string;
	faceUp: boolean;
	x: number;
	y: number;
	rot: number;
}

export type Phase = 'idle' | 'dealing' | 'revealing' | 'done' | 'error';

/** Global speed multiplier for every wait in the choreography below — 1 is normal speed, 2 is
 *  double speed, etc. Only the /dev/reveal harness exposes a control for this; production never
 *  touches it, so it's always 1 there. Module-level (not per-engine) so a slider on the harness
 *  can affect timing without threading a prop through every choreography function below. */
export const revealSpeed = $state({ value: 1 });

// How long the deck plays its riffle-riffle-cut shuffle before the first card deals — real time,
// not scaled by revealSpeed the way sleep()'s delays are (the CSS keyframes in +page.svelte/
// dev/reveal driving the actual motion have their own fixed duration too, same limitation as the
// 420ms card-flip transition elsewhere). Kept roughly matched to that CSS duration at 1x.
const SHUFFLE_DURATION = 2200;

export function createRevealEngine() {
	let phase = $state<Phase>('idle');
	let deal = $state<ScoredDeal | null>(null);
	let cards = $state<CardVM[]>([]);
	let revealedStreets = $state<Street[]>([]);
	let scoredStreets = $state<Street[]>([]);
	let runningTotal = $state(0);
	let error = $state<string | null>(null);
	let shuffling = $state(false);

	let currentBest = $derived(
		deal && revealedStreets.length ? deal.perStreetEp[revealedStreets[revealedStreets.length - 1]].category : null
	);

	function cardAt(role: CardVM['role'], slot: number): CardVM | undefined {
		return cards.find((c) => c.role === role && c.slot === slot);
	}

	function ms(n: number): number {
		return n / revealSpeed.value;
	}
	function sleep(n: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms(n)));
	}
	// Two rAFs, not one: the first just schedules "next paint," which can still land in the same
	// frame as the card's initial (off-slot) style. The second guarantees a frame was actually
	// painted at the start position before we move the target and trigger the CSS transition.
	function nextFrame(): Promise<void> {
		return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
	}

	/** Deals one or more cards into their slots at once: each mounts at the deck (see DECK_Y_*
	 *  above), face down, then flies out to its own slot, staggered so a multi-card deal doesn't
	 *  land as one sound. `role` is always 'hole' or 'board' here — burns have their own path. */
	async function dealBatch(entries: { role: 'hole' | 'board'; slot: number; code: string }[]) {
		const ids = entries.map(({ role, slot, code }) => {
			const id = `${role}-${slot}`;
			cards.push({
				id,
				role,
				slot,
				code,
				faceUp: false,
				x: dealStartX(role, slot),
				y: dealStartY(role),
				rot: slot % 2 ? 6 : -6
			});
			return id;
		});
		await nextFrame();
		ids.forEach((id, n) => {
			setTimeout(() => {
				playSound(n % 2 === 0 ? 'deal1' : 'deal2');
				const c = cards.find((c) => c.id === id)!;
				c.x = 0;
				c.y = 0;
				c.rot = 0;
			}, ms(n * 150));
		});
		await sleep((ids.length - 1) * 150 + 420);
	}

	/** A card slides from the deck to the discard pile, face down, and stays there. Each burn
	 *  lands with a small offset from the last so they visibly stack rather than overlap exactly.
	 *  Starts pulled toward the deck (up and left of the muck, which sits at the board row's right
	 *  edge) rather than dropping straight down, same as the hole/board deal-in. */
	async function burnCard(slot: number) {
		const id = `burn-${slot}`;
		const landX = slot * 6;
		const landY = slot * 5;
		cards.push({ id, role: 'burn', slot, code: '2s', faceUp: false, x: landX - 80, y: -160, rot: -4 });
		await nextFrame();
		playSound('slide1', { gain: 0.6 });
		const c = cards.find((c) => c.id === id)!;
		c.x = landX;
		c.y = landY;
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

	/** Slides each piled card back out to its own slot, staggered, revealing them one at a time.
	 *  Silent by design — for the flop this is two overlapping slide sounds 160ms apart on top of
	 *  everything else in the sequence, which read as a stutter rather than a second event. */
	async function divergeFromPile(role: CardVM['role'], slots: number[]) {
		const moving = slots.filter((slot) => slot !== 0);
		moving.forEach((slot, n) => {
			setTimeout(() => {
				cardAt(role, slot)!.x = 0;
			}, ms(n * 160));
		});
		await sleep(Math.max(0, (moving.length - 1) * 160 + 420));
	}

	async function tweenTotal(target: number) {
		const start = runningTotal;
		const startTime = performance.now();
		const DURATION = ms(650);
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

	/** Plays the deck's riffle-riffle-cut shuffle — call in parallel with the /deal fetch (not
	 *  awaited on its own) so it masks network latency instead of adding to it. The `shuffling`
	 *  flag just toggles a CSS class; the actual motion lives in +page.svelte/dev/reveal's
	 *  .deck.shuffling keyframes. */
	async function shuffleDeck(): Promise<void> {
		shuffling = true;
		await sleep(SHUFFLE_DURATION);
		shuffling = false;
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

	return {
		get phase() {
			return phase;
		},
		get deal() {
			return deal;
		},
		set deal(d: ScoredDeal | null) {
			deal = d;
		},
		get cards() {
			return cards;
		},
		get revealedStreets() {
			return revealedStreets;
		},
		get scoredStreets() {
			return scoredStreets;
		},
		get runningTotal() {
			return runningTotal;
		},
		get error() {
			return error;
		},
		get currentBest() {
			return currentBest;
		},
		get shuffling() {
			return shuffling;
		},
		cardAt,
		/** Call right before kicking off a fetch for a new deal. */
		startDealing() {
			error = null;
			phase = 'dealing';
		},
		fail(message: string) {
			error = message;
			phase = 'error';
		},
		shuffleDeck,
		playReveal,
		showFinalInstantly
	};
}

export type RevealEngine = ReturnType<typeof createRevealEngine>;
