<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Freeroll — sign in</title>
</svelte:head>

<section>
	<div class="auth-card">
		{#if data.alreadySignedIn}
			<div class="eyebrow">Signed in</div>
			<h1>You're already in</h1>
			<p>No need to sign in again on this device.</p>
			<a class="btn-primary" href="/">Back to Freeroll</a>
		{:else if form?.sent}
			<div class="eyebrow">Check your inbox</div>
			<h1>Link sent</h1>
			<p>We sent a sign-in link to <strong>{form.email}</strong>. It works once and expires in 15 minutes.</p>
		{:else}
			<div class="eyebrow">Sign in</div>
			<h1>No password needed</h1>
			<p>Enter your email and we'll send you a one-time link.</p>
			<form method="POST" use:enhance>
				<input type="email" name="email" placeholder="you@example.com" value={form?.email ?? ''} required />
				<button class="btn-primary" type="submit">Send sign-in link</button>
			</form>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}
		{/if}
	</div>
</section>
