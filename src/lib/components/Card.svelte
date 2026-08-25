<script lang="ts">
	interface Props {
		code: string;
		faceUp: boolean;
		/** Offsets from this card's natural (flex-laid-out) slot position — the deal reveal drives
		 *  these to make a card fall in, converge into a pile, and slide back out to its own slot. */
		x?: number;
		y?: number;
		rot?: number;
		size?: 'hole' | 'board' | 'burn';
	}
	let { code, faceUp, x = 0, y = 0, rot = 0, size = 'board' }: Props = $props();

	const SUIT_SYMBOL: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
	let rank = $derived(code.slice(0, -1));
	let suit = $derived(SUIT_SYMBOL[code.slice(-1)]);
	let red = $derived(code.endsWith('h') || code.endsWith('d'));
</script>

<div class="card-slot {size}" style="transform: translate({x}px, {y}px) rotate({rot}deg);">
	<div class="card-inner" class:flipped={faceUp}>
		<div class="face back"></div>
		<div class="face front" class:red>
			<span>{rank}</span><span>{suit}</span>
		</div>
	</div>
</div>

<style>
	/* Widths/heights here are paired with HOLE_SPACING/BOARD_SPACING in +page.svelte's pile-offset
	   math (card width + row gap) — change one, change the other. */
	.card-slot {
		position: relative;
		transition: transform 420ms cubic-bezier(0.22, 0.9, 0.32, 1);
		perspective: 500px;
		flex: none;
	}
	.card-slot.hole {
		width: 56px;
		height: 78px;
	}
	.card-slot.board {
		width: 48px;
		height: 66px;
	}
	.card-slot.burn {
		width: 38px;
		height: 52px;
		/* The burn pile is a small fixed-size container (see .burn-pile in +page.svelte) that its
		   cards stack inside via absolute positioning + x/y offsets, rather than flowing in a row
		   like the hole/board slots do. */
		position: absolute;
		top: 0;
		left: 0;
	}
	.card-inner {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
		transition: transform 420ms cubic-bezier(0.4, 0, 0.2, 1);
	}
	.card-inner.flipped {
		transform: rotateY(180deg);
	}
	.face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		border-radius: 7px;
		border: 1px solid var(--border);
		box-shadow: var(--shadow);
	}
	.back {
		background: repeating-linear-gradient(
			45deg,
			var(--border),
			var(--border) 3px,
			var(--surface) 3px,
			var(--surface) 7px
		);
	}
	.front {
		transform: rotateY(180deg);
		background: var(--card-face);
		color: var(--card-ink);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 5px 6px;
		font-family: Georgia, serif;
		font-weight: 700;
	}
	.card-slot.hole .front {
		font-size: 19px;
	}
	.card-slot.board .front {
		font-size: 16px;
	}
	.front.red {
		color: var(--card-red);
	}
</style>
