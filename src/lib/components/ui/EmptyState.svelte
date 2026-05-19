<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	type Color = 'blue' | 'violet' | 'amber' | 'green';

	interface Props {
		icon: Component;
		title: string;
		description: string;
		action?: Snippet;
		color?: Color;
	}

	let { icon: Icon, title, description, action, color = 'blue' }: Props = $props();

	const colorClasses: Record<Color, { bg: string; icon: string }> = {
		blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
		violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
		amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
		green: { bg: 'bg-green-50', icon: 'text-green-600' },
	};
</script>

<div class="bg-white rounded-2xl border border-slate-100 p-10 text-center">
	<div
		class="w-14 h-14 {colorClasses[color].bg} rounded-2xl flex items-center justify-center mx-auto mb-4"
	>
		<Icon class="w-7 h-7 {colorClasses[color].icon}" strokeWidth={1.5} />
	</div>
	<h2 class="text-base font-semibold text-slate-900 mb-2">{title}</h2>
	<p class="text-sm text-slate-500 mb-5 max-w-xs mx-auto">{description}</p>
	{#if action}
		{@render action()}
	{/if}
</div>
