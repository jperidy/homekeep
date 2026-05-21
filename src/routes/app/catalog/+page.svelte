<script lang="ts">
	import { LayoutGrid } from '@lucide/svelte';
	import type { PageData } from './$types';
	import { Card, CardHeader } from '$lib/components/ui';

	let { data }: { data: PageData } = $props();

	const byCategory = $derived(
		data.types.reduce<Record<string, typeof data.types>>((acc, t) => {
			(acc[t.category] ??= []).push(t);
			return acc;
		}, {})
	);
</script>

<div>
	<div class="mb-6">
		<div class="flex items-center gap-2 mb-1">
			<LayoutGrid class="w-5 h-5 text-blue-600" />
			<h1 class="text-xl font-bold text-slate-900">Catalogue des équipements</h1>
		</div>
		<p class="text-sm text-slate-500">
			{data.types.length} type{data.types.length !== 1 ? 's' : ''} d'équipement disponible{data.types.length !== 1 ? 's' : ''}
		</p>
	</div>

	{#if data.types.length === 0}
		<Card class="p-10 text-center">
			<p class="text-slate-500 text-sm">Le catalogue est vide pour l'instant.</p>
		</Card>
	{:else}
		<div class="space-y-6">
			{#each Object.entries(byCategory) as [category, types]}
				<Card>
					<CardHeader shade>
						<h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
							{category}
						</h2>
					</CardHeader>
					<ul class="divide-y divide-slate-50">
						{#each types as type}
							<li class="px-5 py-4">
								<p class="font-medium text-slate-900">{type.name}</p>
								{#if type.description}
									<p class="text-xs text-slate-500 mt-0.5">{type.description}</p>
								{/if}
							</li>
						{/each}
					</ul>
				</Card>
			{/each}
		</div>
	{/if}
</div>
