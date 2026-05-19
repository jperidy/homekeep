<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		accent?: 'blue' | 'violet';
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		value = $bindable(''),
		accent = 'blue',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const ring = $derived(accent === 'violet' ? 'focus:ring-violet-500' : 'focus:ring-blue-500');
</script>

<select
	bind:value
	class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 {ring} focus:border-transparent bg-white {className}"
	{...rest}
>
	{@render children()}
</select>
