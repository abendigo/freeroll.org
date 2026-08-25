import { render } from 'svelte/server';
import type { Component } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderTemplate(component: Component<any>, props: Record<string, unknown>): string {
	const { body } = render(component, { props });
	return body;
}
