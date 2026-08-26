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
// compute how far a card has to slide to land on top of slot 0 (the "pile" spot).
export const HOLE_SPACING = 66; // 56px card + 10px gap
export const BOARD_SPACING = 58; // 48px card + 10px gap

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

export function createRevealEngine() {
	let phase = $state<Phase>('idle');
	let deal = $state<ScoredDeal | null>(null);
	let cards = $state<CardVM[]>([]);
	let revealedStreets = $state<Street[]>([]);
	let scoredStreets = $state<Street[]>([]);
	let runningTotal = $state(0);
	let error = $state<string | null>(null);

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
			}, ms(n * 150));
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
		playReveal,
		showFinalInstantly
	};
}

export type RevealEngine = ReturnType<typeof createRevealEngine>;
