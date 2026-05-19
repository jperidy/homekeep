<script lang="ts">
	type Size = 'sm' | 'md';

	interface Props {
		value?: string;
		type?: string;
		size?: Size;
		accent?: 'blue' | 'violet';
		class?: string;
		[key: string]: unknown;
	}

	let {
		value = $bindable(''),
		type = 'text',
		size = 'md',
		accent = 'blue',
		class: className = '',
		...rest
	}: Props = $props();

	const ring = $derived(accent === 'violet' ? 'focus:ring-violet-500' : 'focus:ring-blue-500');

	const sizeClasses: Record<Size, string> = {
		sm: 'px-3 py-2 rounded-lg',
		md: 'px-3.5 py-2.5 rounded-xl',
	};
</script>

<input
	{type}
	bind:value
	class="w-full {sizeClasses[size]} border border-slate-200 text-sm focus:outline-none focus:ring-2 {ring} focus:border-transparent placeholder:text-slate-400 {className}"
	{...rest}
/>
