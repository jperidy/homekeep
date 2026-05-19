<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant =
		| 'primary'
		| 'admin'
		| 'danger'
		| 'secondary'
		| 'ghost'
		| 'success'
		| 'icon'
		| 'iconDanger';
	type Size = 'xs' | 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		size?: Size;
		fullWidth?: boolean;
		href?: string;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		href,
		disabled = false,
		type = 'button',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const isIconVariant = $derived(variant === 'icon' || variant === 'iconDanger');

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white',
		admin: 'bg-violet-600 hover:bg-violet-700 text-white',
		danger: 'bg-red-600 hover:bg-red-700 text-white',
		secondary:
			'border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900',
		ghost: 'text-slate-600 hover:text-slate-900',
		success:
			'bg-white hover:bg-green-50 border border-slate-200 hover:border-green-300 text-slate-600 hover:text-green-700',
		icon: 'p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100',
		iconDanger: 'p-1 rounded text-slate-300 hover:text-red-500',
	};

	const sizeClasses: Record<Size, string> = {
		xs: 'px-3 py-1.5 rounded-lg text-xs',
		sm: 'px-3 py-2 rounded-lg text-sm',
		md: 'px-4 py-2.5 rounded-xl text-sm',
		lg: 'px-6 py-3.5 rounded-xl text-base font-semibold',
	};

	const classes = $derived(
		[
			isIconVariant
				? 'inline-flex items-center justify-center transition-colors'
				: 'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
			variantClasses[variant],
			!isIconVariant ? sizeClasses[size] : '',
			fullWidth ? 'w-full' : '',
			className,
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href}
	<a {href} class={classes} {...rest}>
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} class={classes} {...rest}>
		{@render children()}
	</button>
{/if}
