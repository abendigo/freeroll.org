<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	// No `user` in `data`: by the time this page renders, load() has already sent anyone with a
	// nickname on to their profile, so there's only ever the pre-nickname case left to handle.
	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Freeroll — account</title>
</svelte:head>

<section>
	<div class="auth-card">
		<div class="eyebrow">Account</div>
		<h1>Choose a nickname</h1>
		<p>One more step — pick a nickname before you continue. It's shown on leaderboards.</p>
		<form method="POST" action="?/setNickname" use:enhance>
			<input
				type="text"
				name="nickname"
				placeholder="riverrat"
				value={form?.nickname ?? ''}
				minlength="3"
				maxlength="20"
				required
			/>
			<button class="btn-primary" type="submit">Set nickname</button>
		</form>
		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}
		<form method="POST" action="/logout" style="margin-top: 8px;">
			<button class="btn-outline" type="submit">Sign out</button>
		</form>
	</div>
</section>
