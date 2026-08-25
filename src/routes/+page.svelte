<svelte:head>
	<title>Freeroll — one deal a day</title>
</svelte:head>

<section class="hero">
	<div class="wrap">
		<div class="placeholder-row">
			<div class="ph-card">?</div>
			<div class="ph-card">?</div>
		</div>
		<h1>One deal a day. Two hole cards, five on the board. What will yours be?</h1>
		<!-- svelte-ignore a11y_invalid_attribute -- placeholder until the deal flow exists (later PR) -->
		<a class="btn-primary" href="#">Deal</a>
		<span class="cta-note"><a href="/login">Sign up</a> before you deal to save it and climb the leaderboard</span>

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
