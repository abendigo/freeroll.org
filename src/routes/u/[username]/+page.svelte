<script lang="ts">
	import BadgeGrid from '$lib/components/BadgeGrid.svelte';
	import MiniCards from '$lib/components/MiniCards.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// SQLite's datetime('now') gives "YYYY-MM-DD HH:MM:SS" (space, no zone) — not directly
	// parseable as UTC by `new Date()` in every engine, so coerce to ISO-8601 first. `date` on a
	// deal is already a bare YYYY-MM-DD; forcing a UTC midnight anchor keeps both consistent with
	// the daily reset boundary (see identity.ts's todayUtc) instead of drifting a day on the
	// viewer's local clock near midnight.
	function formatDate(sqliteOrIsoDate: string): string {
		const iso = sqliteOrIsoDate.includes('T')
			? sqliteOrIsoDate
			: `${sqliteOrIsoDate.replace(' ', 'T')}${sqliteOrIsoDate.length <= 10 ? 'T00:00:00' : ''}Z`;
		return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
	}
</script>

<svelte:head>
	<title>Freeroll — {data.nickname}</title>
</svelte:head>

<section class="section" style="border-top:none;">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Player</div>
			<h2>{data.nickname}</h2>
			<p>Member since {formatDate(data.memberSince)}</p>
		</div>

		<div class="profile-stats">
			<div class="profile-stat">
				<div class="profile-stat-value mono">{data.totalEp.toLocaleString()}</div>
				<div class="profile-stat-label">Total EP</div>
			</div>
			<div class="profile-stat">
				<div class="profile-stat-value mono">{data.best ? data.best.totalEp.toLocaleString() : '—'}</div>
				<div class="profile-stat-label">Best deal{data.best ? ` — ${data.best.handRank}` : ''}</div>
			</div>
			<div class="profile-stat">
				<div class="profile-stat-value mono">{data.dealsPlayed.toLocaleString()}</div>
				<div class="profile-stat-label">Hands dealt</div>
			</div>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Collection</div>
			<h2>Starting hands</h2>
			<p>
				{data.holeCardBadgesEarned === data.holeCardBadgeCount
					? 'Every hand in the deck.'
					: `${data.holeCardBadgesEarned} of ${data.holeCardBadgeCount} dealt.`}
			</p>
		</div>

		<BadgeGrid earned={data.earnedBadges} />
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">History</div>
			<h2>Every deal</h2>
		</div>

		{#if data.deals.length === 0}
			<p style="color: var(--ink-muted);">No hands dealt yet.</p>
		{:else}
			<div class="table-scroll">
				<table class="board">
					<thead>
						<tr>
							<th>Date</th>
							<th>Cards</th>
							<th>Result</th>
							<th style="text-align:right;">EP</th>
						</tr>
					</thead>
					<tbody>
						{#each data.deals as deal (deal.date)}
							<tr>
								<td class="mono">{formatDate(deal.date)}</td>
								<td><MiniCards holeCards={deal.holeCards} board={deal.board} size="tiny" /></td>
								<td>{deal.handRank}</td>
								<td class="ep mono">{deal.totalEp.toLocaleString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>

<style>
	/* 7 mini-cards (hole + board) plus Date/Result/EP doesn't fit a narrow phone at font-size —
	   scroll the table itself rather than let the columns squash. */
	.table-scroll {
		overflow-x: auto;
	}
	:global(.table-scroll table.board) {
		min-width: 460px;
	}
	.profile-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	.profile-stat {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 16px 14px;
		text-align: center;
	}
	.profile-stat-value {
		font-size: 22px;
		font-weight: 800;
	}
	.profile-stat-label {
		margin-top: 4px;
		font-size: 12.5px;
		color: var(--ink-muted);
	}
	@media (max-width: 620px) {
		.profile-stats {
			grid-template-columns: 1fr;
		}
	}
</style>
