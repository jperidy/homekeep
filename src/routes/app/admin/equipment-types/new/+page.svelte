<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft } from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);

	const CATEGORIES = [
		'Chauffage', 'Plomberie', 'Électricité', 'Ventilation',
		'Toiture', 'Extérieur', 'Sécurité', 'Cuisine', 'Autre'
	];
</script>

<div class="max-w-lg">
	<a
		href="/app/admin/equipment-types"
		class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
	>
		<ArrowLeft class="w-4 h-4" />
		Retour au catalogue
	</a>

	<div class="bg-white rounded-2xl border border-slate-100 p-6">
		<h1 class="text-xl font-semibold text-slate-900 mb-1">Nouveau type d'équipement</h1>
		<p class="text-sm text-slate-500 mb-6">Définissez un type d'équipement disponible pour tous les utilisateurs.</p>

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => { await update(); loading = false; };
			}}
			class="space-y-4"
		>
			<div>
				<label for="name" class="block text-sm font-medium text-slate-700 mb-1.5">
					Nom <span class="text-red-500">*</span>
				</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={form?.name ?? ''}
					placeholder="Ex : Chaudière à gaz, Pompe à chaleur…"
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-400"
				/>
			</div>
			<div>
				<label for="category" class="block text-sm font-medium text-slate-700 mb-1.5">
					Catégorie <span class="text-red-500">*</span>
				</label>
				<input
					id="category"
					name="category"
					type="text"
					required
					list="category-suggestions"
					value={form?.category ?? ''}
					placeholder="Ex : Chauffage, Plomberie…"
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-400"
				/>
				<datalist id="category-suggestions">
					{#each CATEGORIES as cat}
						<option value={cat}></option>
					{/each}
				</datalist>
			</div>
			<div>
				<label for="description" class="block text-sm font-medium text-slate-700 mb-1.5">
					Description <span class="text-slate-400 font-normal">(optionnelle)</span>
				</label>
				<textarea
					id="description"
					name="description"
					rows={3}
					value={form?.description ?? ''}
					placeholder="Description courte de cet équipement…"
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-400 resize-none"
				></textarea>
			</div>
			{#if form?.error}
				<p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{form.error}</p>
			{/if}
			<button
				type="submit"
				disabled={loading}
				class="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Enregistrement…' : 'Créer le type'}
			</button>
		</form>
	</div>
</div>
