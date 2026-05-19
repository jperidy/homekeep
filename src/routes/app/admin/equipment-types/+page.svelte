<script lang="ts">
	import { Plus, Pencil, ShieldCheck } from '@lucide/svelte';
	import type { PageData } from './$types';
	import { Button, Card, CardHeader, Badge } from '$lib/components/ui';

	let { data }: { data: PageData } = $props();

	const byCategory = $derived(
		data.types.reduce<Record<string, typeof data.types>>((acc, t) => {
			(acc[t.category] ??= []).push(t);
			return acc;
		}, {})
	);
</script>

<div>
	<div class="flex items-center justify-between mb-6">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<ShieldCheck class="w-5 h-5 text-violet-600" />
				<h1 class="text-xl font-bold text-slate-900">Types d'équipement</h1>
			</div>
			<p class="text-sm text-slate-500">
				{data.types.length} type{data.types.length !== 1 ? 's' : ''} au catalogue
			</p>
		</div>
		<Button href="/app/admin/equipment-types/new" variant="admin">
			<Plus class="w-4 h-4" />
			Nouveau type
		</Button>
	</div>

	{#if data.types.length === 0}
		<Card class="p-10 text-center">
			<p class="text-slate-500 text-sm">Aucun type d'équipement. Commencez par en créer un.</p>
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
							<li class="px-5 py-4 flex items-center gap-4">
								<div class="flex-1 min-w-0">
									<p class="font-medium text-slate-900">{type.name}</p>
									{#if type.description}
										<p class="text-xs text-slate-500 mt-0.5 truncate">{type.description}</p>
									{/if}
								</div>
								<span class="text-xs text-slate-400 shrink-0">
									{type._count.equipments} équipement{type._count.equipments !== 1 ? 's' : ''}
								</span>
								<Button
									href="/app/admin/equipment-types/{type.id}/edit"
									variant="icon"
									aria-label="Modifier {type.name}"
								>
									<Pencil class="w-4 h-4" />
								</Button>
							</li>
						{/each}
					</ul>
				</Card>
			{/each}
		</div>
	{/if}
</div>
