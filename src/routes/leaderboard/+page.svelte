<svelte:head>
	<title>Freeroll — leaderboard</title>
</svelte:head>

<section class="section" style="border-top:none;">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Leaderboard</div>
			<h2>Today's luckiest deals</h2>
			<p>Ranked globally by absolute EP — works whether it's you and nine friends or the whole internet.</p>
		</div>
		<table class="board">
			<thead><tr><th>Rank</th><th>Player</th><th>Tier</th><th style="text-align:right;">EP</th></tr></thead>
			<tbody>
				<tr><td class="rank">1</td><td>riverrat</td><td>The Nuts</td><td class="ep mono">41,880</td></tr>
				<tr><td class="rank">2</td><td>quietgrind</td><td>High Roller</td><td class="ep mono">19,204</td></tr>
				<tr><td class="rank">3</td><td>b_folds</td><td>High Roller</td><td class="ep mono">14,770</td></tr>
				<tr><td class="rank">4</td><td>you?</td><td>—</td><td class="ep mono">—</td></tr>
			</tbody>
		</table>
		<div class="board-note">Daily, weekly, and all-time boards. Your nickname, your call.</div>
	</div>
</section>

<section class="final-cta">
	<div class="wrap">
		<h2>Today's deal is waiting.</h2>
		<p>Takes about thirty seconds. Comes around again at 00:00 UTC.</p>
		<a class="btn-primary" href="/">Deal</a>
	</div>
</section>
