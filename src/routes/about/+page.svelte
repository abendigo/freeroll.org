<svelte:head>
	<title>Freeroll — about</title>
</svelte:head>

<section class="rule">
	<div class="wrap">
		<div class="eyebrow">The catch</div>
		<p>No mulligans. No run-it-twice. The <span class="accent">deck is locked</span> the moment you tap — whatever hits the felt is yours for the day.</p>
	</div>
</section>

<section class="section" id="how">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">How it works</div>
			<h2>Four streets, one verdict</h2>
			<p>Every deal is dealt server-side and locked before the reveal starts — the animation just shows you what already happened.</p>
		</div>
		<div class="steps">
			<div class="step"><div class="num">01</div><h3>Hole cards</h3><p>Tap once. Get dealt your two cards for the day.</p></div>
			<div class="step"><div class="num">02</div><h3>Flop</h3><p>Three community cards hit the felt. Your hand is scored immediately.</p></div>
			<div class="step"><div class="num">03</div><h3>Turn &amp; river</h3><p>One card each. Every improvement adds entropy points.</p></div>
			<div class="step"><div class="num">04</div><h3>The verdict</h3><p>Total EP sets your rarity tier and unlocks any badges you hit.</p></div>
		</div>
		<div class="ep-note"><strong>EP measures surprise, not size.</strong> A flopped royal flush earns far more than a rivered one — not because it's a bigger hand, but because it's astronomically rarer to get there early. No hand-tuning: the math does it for you.</div>
	</div>
</section>

<section class="section" id="tiers">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Rarity</div>
			<h2>Where your deal lands</h2>
			<p>Total EP places you on a ladder from everyday to legendary.</p>
		</div>
		<div class="ladder">
			<div class="rung" style="--tier-color:#a1a1aa"><div class="dot"></div><div class="name">The Fish</div><div class="flavor">Most days. Nothing wrong with that.</div></div>
			<div class="rung" style="--tier-color:#60a5fa"><div class="dot"></div><div class="name">Calling Station</div><div class="flavor">A pair here, a pair there.</div></div>
			<div class="rung" style="--tier-color:#34d399"><div class="dot"></div><div class="name">Grinder</div><div class="flavor">Two pair, trips — steady value.</div></div>
			<div class="rung" style="--tier-color:#22c55e"><div class="dot"></div><div class="name">Shark</div><div class="flavor">A straight or flush found you.</div></div>
			<div class="rung" style="--tier-color:#eab308"><div class="dot"></div><div class="name">High Roller</div><div class="flavor">Full house or better. Screenshot it.</div></div>
			<div class="rung mythic" style="--tier-color:#e11d48"><div class="dot"></div><div class="name">The Nuts</div><div class="flavor">Quads, straight flush, or the royal itself.</div></div>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Badges</div>
			<h2>A collection that remembers every deal</h2>
			<p>Hole cards, hand rank, and board texture all get their own badges — a running record of the weird stuff that's happened to you.</p>
		</div>
		<div class="badge-grid">
			<div class="badge-tile pill meme" style="display:block;"><div class="glyph">A♠A♥</div><div class="name">Pocket Rockets</div><div class="desc">Best starting hand there is.</div></div>
			<div class="badge-tile pill meme" style="display:block;"><div class="glyph">A♠K♥</div><div class="name">Big Slick</div><div class="desc">Ace-king, unsuited or not.</div></div>
			<div class="badge-tile pill meme" style="display:block;"><div class="glyph">7♠2♥</div><div class="name">The Hammer</div><div class="desc">Worst hand in hold'em, dealt on purpose by no one.</div></div>
			<div class="badge-tile pill hand" style="display:block;"><div class="glyph">88 8KK</div><div class="name">Full House</div><div class="desc">Trips plus a pair.</div></div>
			<div class="badge-tile pill hand" style="display:block;"><div class="glyph">AKQJT</div><div class="name">Broadway</div><div class="desc">Ace-high straight, top of the run.</div></div>
			<div class="badge-tile pill" style="display:block; border-color: color-mix(in srgb, var(--glow-c) 40%, var(--border)); background: color-mix(in srgb, var(--glow-c) 10%, var(--surface));"><div class="glyph" style="color: color-mix(in srgb, var(--glow-c) 65%, var(--ink));">A♠K♥Q♦J♣T♠</div><div class="name">Royal Flush</div><div class="desc">Mythic. Good luck.</div></div>
			<div class="badge-tile pill board" style="display:block;"><div class="glyph">♠♠♠♠♠</div><div class="name">Monotone Board</div><div class="desc">All five community cards, one suit.</div></div>
			<div class="badge-tile pill board" style="display:block;"><div class="glyph">K♠K♥7♦</div><div class="name">Paired Board</div><div class="desc">The board pairs up on you.</div></div>
			<div class="badge-tile pill meme" style="display:block;"><div class="glyph">A2345</div><div class="name">The Wheel</div><div class="desc">The lowest straight there is.</div></div>
		</div>
	</div>
</section>

<section class="section" style="border-bottom:none;">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Sharing</div>
			<h2>One line, no spoilers</h2>
			<p>Copy your result the way you'd copy a Wordle grid — the number, not the story.</p>
		</div>
		<div class="share-card">
			<div class="text mono">Freeroll #123 — 8♠8♥ | flopped Full House | 🦈 Shark | 8,420 EP</div>
			<button class="copy-btn" type="button">Copy</button>
		</div>
	</div>
</section>

<section class="final-cta">
	<div class="wrap">
		<h2>Today's deal is waiting.</h2>
		<p>Takes about thirty seconds. Comes around again at 00:00 UTC.</p>
		<a class="btn-primary" href="/">Deal</a>
	</div>
</section>
