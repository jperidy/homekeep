<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div class="bg-white rounded-2xl border border-slate-100 overflow-hidden {className}">
	{@render children()}
</div>
