<script lang="ts">
	import type { Component } from 'svelte';

	type Size = 'xs' | 'sm' | 'md' | 'lg';
	type Color = 'blue' | 'violet' | 'amber' | 'green' | 'slate' | 'red';
	type Shape = 'square' | 'circle';

	interface Props {
		icon: Component;
		size?: Size;
		color?: Color;
		shape?: Shape;
		class?: string;
	}

	let { icon: Icon, size = 'md', color = 'blue', shape = 'square', class: className = '' }: Props =
		$props();

	const squareSizes: Record<Size, { box: string; icon: string }> = {
		xs: { box: 'w-7 h-7 rounded-lg', icon: 'w-3.5 h-3.5' },
		sm: { box: 'w-9 h-9 rounded-xl', icon: 'w-4 h-4' },
		md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
		lg: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7' },
	};

	const circleSizes: Record<Size, { box: string; icon: string }> = {
		xs: { box: 'w-8 h-8 rounded-full', icon: 'w-4 h-4' },
		sm: { box: 'w-10 h-10 rounded-full', icon: 'w-5 h-5' },
		md: { box: 'w-12 h-12 rounded-full', icon: 'w-6 h-6' },
		lg: { box: 'w-16 h-16 rounded-full', icon: 'w-8 h-8' },
	};

	const sizeClasses = $derived(shape === 'circle' ? circleSizes[size] : squareSizes[size]);

	const colorClasses: Record<Color, { bg: string; icon: string }> = {
		blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
		violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
		amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
		green: { bg: 'bg-green-50', icon: 'text-green-600' },
		slate: { bg: 'bg-slate-100', icon: 'text-slate-500' },
		red: { bg: 'bg-red-50', icon: 'text-red-600' },
	};
</script>

<div
	class="{sizeClasses.box} {colorClasses[color].bg} flex items-center justify-center shrink-0 {className}"
>
	<Icon class="{sizeClasses.icon} {colorClasses[color].icon}" strokeWidth={1.5} />
</div>
