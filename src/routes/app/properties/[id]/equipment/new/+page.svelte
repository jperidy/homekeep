<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	const byCategory = $derived(
		data.equipmentTypes.reduce<Record<string, typeof data.equipmentTypes>>((acc, t) => {
			(acc[t.category] ??= []).push(t);
			return acc;
		}, {})
	);
</script>

<div class="max-w-lg">
	<a
		href="/app/properties/{data.property.id}"
		class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
	>
		<ArrowLeft class="w-4 h-4" />
		{data.property.name}
	</a>

	<div class="bg-white rounded-2xl border border-slate-100 p-6">
		<h1 class="text-xl font-semibold text-slate-900 mb-1">Ajouter un équipement</h1>
		<p class="text-sm text-slate-500 mb-6">
			Ajoutez un équipement à <strong>{data.property.name}</strong>.
		</p>

		{#if data.equipmentTypes.length === 0}
			<div class="text-center py-6">
				<p class="text-sm text-slate-500">
					Aucun type d'équipement disponible. Un administrateur doit d'abord alimenter le catalogue.
				</p>
			</div>
		{:else}
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="equipmentTypeId" class="block text-sm font-medium text-slate-700 mb-1.5">
						Type d'équipement <span class="text-red-500">*</span>
					</label>
					<select
						id="equipmentTypeId"
						name="equipmentTypeId"
						required
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
					>
						<option value="">— Choisir un type —</option>
						{#each Object.entries(byCategory) as [category, types]}
							<optgroup label={category}>
								{#each types as type}
									<option value={type.id} selected={form?.equipmentTypeId === type.id}
										>{type.name}</option
									>
								{/each}
							</optgroup>
						{/each}
					</select>
				</div>
				<div>
					<label for="name" class="block text-sm font-medium text-slate-700 mb-1.5">
						Nom personnalisé <span class="text-red-500">*</span>
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						value={form?.name ?? ''}
						placeholder="Ex : Chaudière principale, Pompe piscine…"
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
					/>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="brand" class="block text-sm font-medium text-slate-700 mb-1.5">
							Marque <span class="text-slate-400 font-normal">(optionnel)</span>
						</label>
						<input
							id="brand"
							name="brand"
							type="text"
							value={form?.brand ?? ''}
							placeholder="Ex : Viessmann"
							class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
						/>
					</div>
					<div>
						<label for="model" class="block text-sm font-medium text-slate-700 mb-1.5">
							Modèle <span class="text-slate-400 font-normal">(optionnel)</span>
						</label>
						<input
							id="model"
							name="model"
							type="text"
							value={form?.model ?? ''}
							placeholder="Ex : Vitodens 100-W"
							class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
						/>
					</div>
				</div>
				<div>
					<label for="installedAt" class="block text-sm font-medium text-slate-700 mb-1.5">
						Date d'installation <span class="text-slate-400 font-normal">(optionnelle)</span>
					</label>
					<input
						id="installedAt"
						name="installedAt"
						type="date"
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				{#if form?.error}
					<p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{form.error}</p>
				{/if}
				<button
					type="submit"
					disabled={loading}
					class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Enregistrement…' : "Ajouter l'équipement"}
				</button>
			</form>
		{/if}
	</div>
</div>
