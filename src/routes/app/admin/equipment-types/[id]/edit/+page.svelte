<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, Trash2, Plus, Clock } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
	let deleting = $state(false);
	let addingRule = $state(false);

	const CATEGORIES = [
		'Chauffage',
		'Plomberie',
		'Électricité',
		'Ventilation',
		'Toiture',
		'Extérieur',
		'Sécurité',
		'Cuisine',
		'Autre'
	];

	function intervalLabel(weeks: number): string {
		if (weeks === 1) return 'Chaque semaine';
		if (weeks < 4) return `Toutes les ${weeks} semaines`;
		const months = Math.round(weeks / 4.33);
		if (months === 1) return 'Chaque mois';
		if (months < 12) return `Tous les ${months} mois`;
		const years = Math.round(weeks / 52);
		return years === 1 ? 'Chaque année' : `Tous les ${years} ans`;
	}
</script>

<div class="max-w-lg">
	<a
		href="/app/admin/equipment-types"
		class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
	>
		<ArrowLeft class="w-4 h-4" />
		Retour au catalogue
	</a>

	<!-- Edit form -->
	<div class="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
		<h1 class="text-xl font-semibold text-slate-900 mb-1">Modifier le type</h1>
		<p class="text-sm text-slate-500 mb-6">Modification de « {data.type.name} »</p>

		<form
			method="POST"
			action="?/update"
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
				<label for="name" class="block text-sm font-medium text-slate-700 mb-1.5">
					Nom <span class="text-red-500">*</span>
				</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={form?.name ?? data.type.name}
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
					value={form?.category ?? data.type.category}
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
					value={form?.description ?? data.type.description ?? ''}
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
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
				{loading ? 'Enregistrement…' : 'Enregistrer'}
			</button>
		</form>
	</div>

	<!-- Maintenance rules -->
	<div class="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
		<div class="flex items-center justify-between mb-4">
			<div>
				<h2 class="font-semibold text-slate-900">Règles de maintenance</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					Fréquences d'entretien recommandées pour ce type.
				</p>
			</div>
			<span class="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
				{data.type.maintenanceRules.length} règle{data.type.maintenanceRules.length !== 1
					? 's'
					: ''}
			</span>
		</div>

		{#if data.type.maintenanceRules.length > 0}
			<ul class="divide-y divide-slate-50 mb-4">
				{#each data.type.maintenanceRules as rule}
					<li class="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
						<div class="flex items-start gap-2.5 flex-1 min-w-0">
							<div
								class="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5"
							>
								<Clock class="w-3.5 h-3.5 text-violet-600" strokeWidth={1.5} />
							</div>
							<div class="min-w-0">
								<p class="text-sm font-medium text-slate-800">{rule.label}</p>
								<p class="text-xs text-violet-600">{intervalLabel(rule.intervalWeeks)}</p>
								{#if rule.description}
									<p class="text-xs text-slate-400 mt-0.5 truncate">{rule.description}</p>
								{/if}
							</div>
						</div>
						<form method="POST" action="?/deleteRule" use:enhance>
							<input type="hidden" name="ruleId" value={rule.id} />
							<button
								type="submit"
								class="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
								title="Supprimer cette règle"
							>
								<Trash2 class="w-3.5 h-3.5" />
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}

		{#if form?.ruleError}
			<p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{form.ruleError}</p>
		{/if}

		<!-- Add rule form -->
		<form
			method="POST"
			action="?/addRule"
			use:enhance={() => {
				addingRule = true;
				return async ({ update }) => {
					await update();
					addingRule = false;
				};
			}}
			class="border border-dashed border-slate-200 rounded-xl p-4 space-y-3"
		>
			<p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Nouvelle règle</p>
			<div class="flex gap-2">
				<div class="flex-1">
					<input
						name="label"
						type="text"
						placeholder="Ex : Révision annuelle"
						required
						class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
					/>
				</div>
				<div class="w-28">
					<div class="relative">
						<input
							name="intervalWeeks"
							type="number"
							min="1"
							placeholder="52"
							required
							class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-14"
						/>
						<span
							class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none"
							>sem.</span
						>
					</div>
				</div>
			</div>
			<input
				name="description"
				type="text"
				placeholder="Description optionnelle"
				class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
			/>
			<button
				type="submit"
				disabled={addingRule}
				class="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
			>
				<Plus class="w-3.5 h-3.5" />
				{addingRule ? 'Ajout…' : 'Ajouter'}
			</button>
		</form>
	</div>

	<!-- Danger zone -->
	<div class="bg-white rounded-2xl border border-red-100 p-6">
		<h2 class="text-sm font-semibold text-red-700 mb-1">Zone de danger</h2>
		<p class="text-xs text-slate-500 mb-4">
			La suppression est impossible si des équipements utilisent ce type.
		</p>
		{#if form?.deleteError}
			<p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{form.deleteError}</p>
		{/if}
		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				deleting = true;
				return async ({ update }) => {
					await update();
					deleting = false;
				};
			}}
		>
			<button
				type="submit"
				disabled={deleting}
				class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<Trash2 class="w-4 h-4" />
				{deleting ? 'Suppression…' : 'Supprimer ce type'}
			</button>
		</form>
	</div>
</div>
