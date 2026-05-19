<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		id?: string;
		required?: boolean;
		optional?: string;
		children: Snippet;
	}

	let { label, id, required = false, optional, children }: Props = $props();
</script>

<div>
	<label for={id} class="block text-sm font-medium text-slate-700 mb-1.5">
		{label}
		{#if required}<span class="text-red-500">*</span>{/if}
		{#if optional}<span class="text-slate-400 font-normal">({optional})</span>{/if}
	</label>
	{@render children()}
</div>
