<svelte:head>
	<title>Freeroll — privacy</title>
</svelte:head>

<section class="section" style="border-top:none;">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Privacy</div>
			<h2>What we collect: basically nothing, so far</h2>
			<p>Freeroll doesn't have accounts, a database, or a server yet — right now this is a static, informational site. Here's exactly what happens today.</p>
		</div>

		<div class="status-note"><strong>Where this page stands:</strong> everything below describes freeroll.org as it actually runs right now, not the eventual game. It'll be rewritten to match reality before anything below stops being true — not after.</div>

		<div class="policy-block">
			<h3>What we store</h3>
			<p>Your theme choice (light, dark, or auto) is saved in your browser's <code>localStorage</code> under the key <code>freeroll-theme</code>. It never leaves your device — we don't receive it, see it, or store a copy of it ourselves. Clearing your browser data clears it.</p>
			<p>That's the only thing this site writes anywhere. There are no accounts, no sign-up forms, no email collection, no cookies set by us, and no analytics or tracking scripts embedded on any page.</p>
		</div>

		<div class="policy-block">
			<h3>Hosting</h3>
			<p>Freeroll is hosted on Cloudflare. Like any website, Cloudflare processes standard connection metadata (such as your IP address) as part of serving the page and protecting it from abuse — that's Cloudflare acting as our infrastructure provider, not data we separately collect or can see ourselves. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare's privacy policy</a> for how they handle it.</p>
		</div>

		<div class="policy-block">
			<h3>When the actual game ships</h3>
			<p>The plan is passwordless sign-in, a chosen nickname, and a record of your daily deals and leaderboard results — modeled closely on how <a href="https://rngdle.com" target="_blank" rel="noopener">rngdle.com</a> handles it. We won't store your email address itself — only a salted cryptographic hash of it, computed fresh from what you type in each time you sign in. We can't read it back, and we won't use it for anything beyond that one sign-in link. That protects your email if our database alone ever leaked; it isn't a guarantee against every possible compromise, and we'd rather say that plainly than oversell it. None of that exists yet. When it does, this page changes first.</p>
		</div>

		<div class="policy-block">
			<h3>Questions</h3>
			<p>Reach out at <a href="mailto:mark@oosterveld.org">mark@oosterveld.org</a>.</p>
		</div>
	</div>
</section>
