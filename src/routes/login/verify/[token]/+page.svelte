<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Refreshes just the header's signed-in state (see the 'app:user' depends() in
	// +layout.server.ts) — not invalidateAll(), which would re-run this page's own load and
	// re-verify the (now single-use, already-consumed) token, turning the success we just got
	// into an "already used" error.
	$effect(() => {
		if (data.success) invalidate('app:user');
	});
</script>

<svelte:head>
	<title>Freeroll — sign in</title>
</svelte:head>

<section>
	<div class="auth-card">
		{#if data.success}
			<div class="eyebrow">Signed in</div>
			<h1>You're in</h1>
			<p class="success">Welcome to Freeroll.</p>
			<a class="btn-primary" href="/">Continue</a>
		{:else}
			<div class="eyebrow">Sign in</div>
			<h1>That link didn't work</h1>
			<p class="error">{data.error}</p>
			<a class="btn-primary" href="/login">Request a new link</a>
		{/if}
	</div>
</section>
