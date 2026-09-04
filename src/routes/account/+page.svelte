<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Freeroll — account</title>
</svelte:head>

<section>
	<div class="auth-card">
		<div class="eyebrow">Account</div>
		{#if data.user.nickname}
			<h1>{data.user.nickname}</h1>
			<p>Shown on leaderboards. Pick a different one below if you'd like.</p>
		{:else}
			<h1>Choose a nickname</h1>
			<p>One more step — pick a nickname before you continue. It's shown on leaderboards.</p>
		{/if}
		<form method="POST" action="?/setNickname" use:enhance>
			<input
				type="text"
				name="nickname"
				placeholder="riverrat"
				value={form?.nickname ?? data.user.nickname ?? ''}
				minlength="3"
				maxlength="20"
				required
			/>
			<button class="btn-primary" type="submit">{data.user.nickname ? 'Update' : 'Set nickname'}</button>
		</form>
		{#if form?.error}
			<p class="error">{form.error}</p>
		{:else if form?.saved}
			<p class="success">Saved.</p>
		{/if}
		{#if data.user.nickname}
			<p style="margin-top: 24px;"><a href="/u/{data.user.nickname}">View your public profile</a></p>
			<p style="margin-top: 24px;"><a href="/">Back to Freeroll</a></p>
		{/if}
		<form method="POST" action="/logout" style="margin-top: 8px;">
			<button class="btn-outline" type="submit">Sign out</button>
		</form>
	</div>
</section>
