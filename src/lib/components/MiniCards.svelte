<script lang="ts">
	import { parseCardCode } from '$lib/cards';

	interface Props {
		holeCards: string[];
		/** Community cards (flop/turn/river) — omitted or empty renders hole cards alone, as on the
		 *  homepage's featured panel. */
		board?: string[];
		/** 'normal' matches the original homepage glow-box sizing (centered, larger cards).
		 *  'tiny' is for cramming a full 7-card hand into a table row (leaderboard, hand history). */
		size?: 'normal' | 'tiny';
	}
	let { holeCards, board = [], size = 'normal' }: Props = $props();
</script>

<div class="mini-cards {size}">
	{#each holeCards as code (code)}
		{@const card = parseCardCode(code)}
		<div class="mini-card" class:red={card.red}><span>{card.rank}</span><span>{card.suit}</span></div>
	{/each}
	{#if board.length}
		<span class="divider"></span>
		{#each board as code (code)}
			{@const card = parseCardCode(code)}
			<div class="mini-card" class:red={card.red}><span>{card.rank}</span><span>{card.suit}</span></div>
		{/each}
	{/if}
</div>

<style>
	.mini-cards {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.mini-cards.normal {
		justify-content: center;
		margin-bottom: 10px;
	}
	.divider {
		width: 1px;
		align-self: stretch;
		background: var(--border);
		margin: 0 1px;
	}
	.mini-card {
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
		flex: none;
	}
	.mini-card.red {
		color: var(--card-red);
	}
	.tiny .mini-card {
		width: 20px;
		height: 27px;
		padding: 2px 3px;
		font-size: 8.5px;
		border-radius: 3px;
	}
	.tiny .divider {
		height: 20px;
	}
</style>
