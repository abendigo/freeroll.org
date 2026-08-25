<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
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
