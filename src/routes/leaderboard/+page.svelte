<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const TABS = [
		{ key: 'daily', label: 'Daily', note: 'Resets at 00:00 UTC.' },
		{ key: 'weekly', label: 'Weekly', note: "This week's best deal per player, Monday–Sunday UTC." },
		{ key: 'allTime', label: 'All-time', note: 'Best deal per player, ever.' }
	] as const;

	let activeTab = $state<(typeof TABS)[number]['key']>('daily');
	const rows = $derived(data[activeTab]);
	const activeNote = $derived(TABS.find((t) => t.key === activeTab)!.note);
</script>

<svelte:head>
	<title>Freeroll — leaderboard</title>
</svelte:head>

<section class="section" style="border-top:none;">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Leaderboard</div>
			<h2>The luckiest deals</h2>
			<p>Ranked globally by absolute EP — works whether it's you and nine friends or the whole internet.</p>
		</div>

		<div class="tabs" role="tablist">
			{#each TABS as tab (tab.key)}
				<button type="button" role="tab" aria-selected={activeTab === tab.key} class:active={activeTab === tab.key} onclick={() => (activeTab = tab.key)}>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if rows.length === 0}
			<p class="empty">
				No deals on the board yet.
				{#if activeTab === 'daily'}Nobody signed in has dealt today — be the first.{:else}Nobody's signed in and dealt yet.{/if}
			</p>
		{:else}
			<table class="board">
				<thead><tr><th>Rank</th><th>Player</th><th>Best hand</th><th style="text-align:right;">EP</th></tr></thead>
				<tbody>
					{#each rows as row (row.rank)}
						<tr class:you={data.user?.nickname === row.nickname}>
							<td class="rank">{row.rank}</td>
							<td>{row.nickname}{data.user?.nickname === row.nickname ? ' (you)' : ''}</td>
							<td>{row.handRank}</td>
							<td class="ep mono">{row.totalEp.toLocaleString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
		<div class="board-note">{activeNote} Anonymous plays don't appear — sign in and pick a nickname to get on the board.</div>
	</div>
</section>

<section class="final-cta">
	<div class="wrap">
		<h2>Today's deal is waiting.</h2>
		<p>Takes about thirty seconds. Comes around again at 00:00 UTC.</p>
		<a class="btn-primary" href="/">Deal</a>
	</div>
</section>

<style>
	.tabs {
		display: flex;
		gap: 6px;
		margin-bottom: 18px;
	}
	.tabs button {
		font-family: inherit;
		font-size: 13px;
		font-weight: 700;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--ink-muted);
		border-radius: 999px;
		padding: 7px 16px;
		cursor: pointer;
	}
	.tabs button.active {
		background: var(--surface);
		border-color: color-mix(in srgb, var(--glow-c) 45%, var(--border));
		color: var(--ink);
	}
	.empty {
		color: var(--ink-muted);
		font-size: 14px;
	}
	:global(table.board tr.you) {
		background: color-mix(in srgb, var(--glow-c) 6%, transparent);
	}
	:global(table.board tr.you td) {
		font-weight: 700;
		color: var(--ink);
	}
</style>
