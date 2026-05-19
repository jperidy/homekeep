<script lang="ts">
	interface Props {
		value?: string;
		rows?: number;
		accent?: 'blue' | 'violet';
		class?: string;
		[key: string]: unknown;
	}

	let {
		value = $bindable(''),
		rows = 3,
		accent = 'blue',
		class: className = '',
		...rest
	}: Props = $props();

	const ring = $derived(accent === 'violet' ? 'focus:ring-violet-500' : 'focus:ring-blue-500');
</script>

<textarea
	{rows}
	bind:value
	class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 {ring} focus:border-transparent placeholder:text-slate-400 resize-none {className}"
	{...rest}
></textarea>
