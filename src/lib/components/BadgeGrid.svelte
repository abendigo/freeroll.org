<script lang="ts">
	import { HOLE_CARD_BADGES, META_BADGES, holeCardBadgesByCategory, preflopGridRows } from '$lib/badges';

	interface Props {
		/** badge_id -> first_earned_date (YYYY-MM-DD), from user_badges. Hole-card and meta ids
		 *  live in the same map — see $lib/badges for why they don't need separating. */
		earned: Record<string, string>;
	}
	let { earned }: Props = $props();

	const rows = preflopGridRows();
	const metas = Object.values(META_BADGES);

	function metaProgress(meta: (typeof metas)[number]) {
		const all = holeCardBadgesByCategory(meta.category);
		return { have: all.filter((b) => b.id in earned).length, total: all.length };
	}
</script>

<div class="meta-row">
	{#each metas as meta (meta.id)}
		{@const progress = metaProgress(meta)}
		<div class="meta-badge" class:earned={meta.id in earned}>
			<div class="meta-name">{meta.name}</div>
			<div class="meta-desc">{meta.description}</div>
			<div class="meta-progress mono">{progress.have}/{progress.total}</div>
		</div>
	{/each}
</div>

<div class="grid-scroll">
	<!-- Standard preflop starting-hand chart layout: diagonal = pairs, upper-right triangle =
	     suited, lower-left = offsuit — see preflopGridRows(). Doubles as a progress tracker: an
	     earned cell is filled in, an unlocked one is just its notation, greyed out. -->
	<div class="grid" role="img" aria-label="Starting-hand badge collection, {Object.keys(earned).length} earned">
		{#each rows as row, i (i)}
			{#each row as id (id)}
				{@const badge = HOLE_CARD_BADGES[id]}
				{@const earnedOn = earned[id]}
				<div
					class="cell {badge.category}"
					class:earned={!!earnedOn}
					title="{badge.name}{earnedOn ? ` — earned ${earnedOn}` : ' — not yet dealt'}"
				>
					{badge.notation}
				</div>
			{/each}
		{/each}
	</div>
</div>

<style>
	.meta-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 16px;
	}
	.meta-badge {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 12px 14px;
		opacity: 0.55;
	}
	.meta-badge.earned {
		opacity: 1;
		border-color: color-mix(in srgb, var(--glow-b) 45%, var(--border));
		background: color-mix(in srgb, var(--glow-b) 8%, var(--surface));
	}
	.meta-name {
		font-weight: 700;
		font-size: 14px;
	}
	.meta-desc {
		color: var(--ink-muted);
		font-size: 12px;
		margin-top: 2px;
	}
	.meta-progress {
		margin-top: 6px;
		font-size: 12px;
		color: var(--ink-muted);
	}
	.meta-badge.earned .meta-progress {
		color: var(--ink);
		font-weight: 700;
	}

	.grid-scroll {
		overflow-x: auto;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(13, 1fr);
		gap: 3px;
		min-width: 560px;
	}
	.cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 5px;
		font-size: 11px;
		font-weight: 700;
		font-family: Georgia, serif;
		color: var(--ink-faint);
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.cell.earned {
		color: var(--card-ink);
	}
	.cell.pair.earned {
		background: color-mix(in srgb, var(--glow-c) 22%, var(--surface));
		border-color: color-mix(in srgb, var(--glow-c) 45%, var(--border));
	}
	.cell.suited.earned {
		background: color-mix(in srgb, var(--glow-b) 22%, var(--surface));
		border-color: color-mix(in srgb, var(--glow-b) 45%, var(--border));
	}
	.cell.offsuit.earned {
		background: color-mix(in srgb, var(--glow-a) 22%, var(--surface));
		border-color: color-mix(in srgb, var(--glow-a) 45%, var(--border));
	}

	@media (max-width: 620px) {
		.meta-row {
			grid-template-columns: 1fr;
		}
	}
</style>
