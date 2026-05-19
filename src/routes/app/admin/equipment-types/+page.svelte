<script lang="ts">
	import { Plus, Pencil, ShieldCheck } from '@lucide/svelte';
	import type { PageData } from './$types';

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
			<p class="text-sm text-slate-500">{data.types.length} type{data.types.length !== 1 ? 's' : ''} au catalogue</p>
		</div>
		<a
			href="/app/admin/equipment-types/new"
			class="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
		>
			<Plus class="w-4 h-4" />
			Nouveau type
		</a>
	</div>

	{#if data.types.length === 0}
		<div class="bg-white rounded-2xl border border-slate-100 p-10 text-center">
			<p class="text-slate-500 text-sm">Aucun type d'équipement. Commencez par en créer un.</p>
		</div>
	{:else}
		<div class="space-y-6">
			{#each Object.entries(byCategory) as [category, types]}
				<div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
					<div class="px-5 py-3 bg-slate-50 border-b border-slate-100">
						<h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wide">{category}</h2>
					</div>
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
								<a
									href="/app/admin/equipment-types/{type.id}/edit"
									class="shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
									aria-label="Modifier {type.name}"
								>
									<Pencil class="w-4 h-4" />
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{/if}
</div>
