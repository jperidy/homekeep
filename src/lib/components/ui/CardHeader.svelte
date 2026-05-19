<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		shade?: boolean;
	}

	let { children, shade = false }: Props = $props();
</script>

{#if shade}
	<div class="px-5 py-3 bg-slate-50 border-b border-slate-100">
		{@render children()}
	</div>
{:else}
	<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
		{@render children()}
	</div>
{/if}
