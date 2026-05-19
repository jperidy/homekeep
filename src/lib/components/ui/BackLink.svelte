<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';

	interface Props {
		href: string;
		label: string;
	}

	let { href, label }: Props = $props();
</script>

<a
	{href}
	class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
>
	<ArrowLeft class="w-4 h-4" />
	{label}
</a>
