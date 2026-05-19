<script lang="ts">
	import type { Snippet } from 'svelte';

	type Color = 'blue' | 'violet' | 'amber' | 'green' | 'red' | 'slate';

	interface Props {
		children: Snippet;
		color?: Color;
	}

	let { children, color = 'slate' }: Props = $props();

	const colorClasses: Record<Color, string> = {
		blue: 'text-blue-600 bg-blue-50',
		violet: 'text-violet-600 bg-violet-50',
		amber: 'text-amber-600 bg-amber-50',
		green: 'text-green-600 bg-green-50',
		red: 'text-red-600 bg-red-50',
		slate: 'text-slate-600 bg-slate-100',
	};
</script>

<span class="text-xs font-medium {colorClasses[color]} px-2 py-1 rounded-lg">
	{@render children()}
</span>
