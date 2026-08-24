<svelte:head>
	<title>Freeroll — privacy</title>
</svelte:head>

<section class="section" style="border-top:none;">
	<div class="wrap">
		<div class="section-head">
			<div class="eyebrow">Privacy</div>
			<h2>What we collect, and why</h2>
			<p>The game itself (deals, scoring, badges) isn't live yet — but sign-in is. Here's exactly what happens today.</p>
		</div>

		<div class="status-note"><strong>Where this page stands:</strong> everything below describes freeroll.org as it actually runs right now. It'll be rewritten to match reality before anything below stops being true — not after.</div>

		<div class="policy-block">
			<h3>If you never sign in</h3>
			<p>Your theme choice (light, dark, or auto) is saved in your browser's <code>localStorage</code> under the key <code>freeroll-theme</code>. It never leaves your device. Nothing else is stored, and there's no cookie, form, or tracking script on any page.</p>
		</div>

		<div class="policy-block">
			<h3>If you sign in</h3>
			<p>Sign-in is passwordless: you enter your email, we send a one-time link that expires in 15 minutes and works once. We store that email address, and — once you follow the link — a random session token in a cookie on your device so you stay signed in. There's no password to store, and no nickname or gameplay data yet, since the actual game isn't built.</p>
			<p>Sign-in emails are sent via <a href="https://resend.com" target="_blank" rel="noopener">Resend</a>, a transactional email provider. They receive the email address and message content needed to deliver that one email — see <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">Resend's privacy policy</a>.</p>
		</div>

		<div class="policy-block">
			<h3>Hosting</h3>
			<p>Freeroll runs on Cloudflare. Like any website, Cloudflare processes standard connection metadata (such as your IP address) as part of serving the page and protecting it from abuse — that's Cloudflare acting as our infrastructure provider, not data we separately collect or can see ourselves. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare's privacy policy</a> for how they handle it.</p>
		</div>

		<div class="policy-block">
			<h3>When the actual game ships</h3>
			<p>The plan is a chosen nickname and a record of your daily deals and leaderboard results — modeled closely on how <a href="https://rngdle.com" target="_blank" rel="noopener">rngdle.com</a> handles it. None of that exists yet. When it does, this page changes first.</p>
		</div>

		<div class="policy-block">
			<h3>Questions</h3>
			<p>Reach out at <a href="mailto:mark@oosterveld.org">mark@oosterveld.org</a>.</p>
		</div>
	</div>
</section>
