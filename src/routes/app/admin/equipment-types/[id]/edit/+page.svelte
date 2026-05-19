<script lang="ts">
	import { enhance } from '$app/forms';
	import { Trash2, Plus, Clock } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';
	import {
		Button,
		Input,
		Textarea,
		FormField,
		Card,
		CardHeader,
		ErrorMessage,
		Badge,
		IconBox,
		BackLink
	} from '$lib/components/ui';

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
	<BackLink href="/app/admin/equipment-types" label="Retour au catalogue" />

	<!-- Edit form -->
	<Card class="p-6 mb-4">
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
			<FormField label="Nom" id="name" required>
				<Input
					id="name"
					name="name"
					type="text"
					required
					value={form?.name ?? data.type.name}
					accent="violet"
				/>
			</FormField>
			<FormField label="Catégorie" id="category" required>
				<Input
					id="category"
					name="category"
					type="text"
					required
					list="category-suggestions"
					value={form?.category ?? data.type.category}
					accent="violet"
				/>
				<datalist id="category-suggestions">
					{#each CATEGORIES as cat}
						<option value={cat}></option>
					{/each}
				</datalist>
			</FormField>
			<FormField label="Description" id="description" optional="optionnelle">
				<Textarea
					id="description"
					name="description"
					value={form?.description ?? data.type.description ?? ''}
					accent="violet"
				/>
			</FormField>
			{#if form?.error}
				<ErrorMessage message={form.error} />
			{/if}
			<Button type="submit" variant="admin" disabled={loading} fullWidth>
				{loading ? 'Enregistrement…' : 'Enregistrer'}
			</Button>
		</form>
	</Card>

	<!-- Maintenance rules -->
	<Card class="p-6 mb-4">
		<div class="flex items-center justify-between mb-4">
			<div>
				<h2 class="font-semibold text-slate-900">Règles de maintenance</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					Fréquences d'entretien recommandées pour ce type.
				</p>
			</div>
			<Badge color="violet">
				{data.type.maintenanceRules.length} règle{data.type.maintenanceRules.length !== 1
					? 's'
					: ''}
			</Badge>
		</div>

		{#if data.type.maintenanceRules.length > 0}
			<ul class="divide-y divide-slate-50 mb-4">
				{#each data.type.maintenanceRules as rule}
					<li class="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
						<div class="flex items-start gap-2.5 flex-1 min-w-0">
							<IconBox icon={Clock} color="violet" size="xs" class="mt-0.5" />
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
							<Button type="submit" variant="iconDanger" title="Supprimer cette règle">
								<Trash2 class="w-3.5 h-3.5" />
							</Button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}

		{#if form?.ruleError}
			<ErrorMessage message={form.ruleError} class="mb-3" />
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
					<Input
						name="label"
						type="text"
						placeholder="Ex : Révision annuelle"
						required
						size="sm"
						accent="violet"
					/>
				</div>
				<div class="w-28 relative">
					<Input
						name="intervalWeeks"
						type="number"
						min="1"
						placeholder="52"
						required
						size="sm"
						accent="violet"
						class="pr-14"
					/>
					<span
						class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none"
					>
						sem.
					</span>
				</div>
			</div>
			<Input
				name="description"
				type="text"
				placeholder="Description optionnelle"
				size="sm"
				accent="violet"
			/>
			<Button type="submit" variant="admin" size="sm" disabled={addingRule}>
				<Plus class="w-3.5 h-3.5" />
				{addingRule ? 'Ajout…' : 'Ajouter'}
			</Button>
		</form>
	</Card>

	<!-- Danger zone -->
	<div class="bg-white rounded-2xl border border-red-100 p-6">
		<h2 class="text-sm font-semibold text-red-700 mb-1">Zone de danger</h2>
		<p class="text-xs text-slate-500 mb-4">
			La suppression est impossible si des équipements utilisent ce type.
		</p>
		{#if form?.deleteError}
			<ErrorMessage message={form.deleteError} class="mb-3" />
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
			<Button type="submit" variant="danger" size="sm" disabled={deleting}>
				<Trash2 class="w-4 h-4" />
				{deleting ? 'Suppression…' : 'Supprimer ce type'}
			</Button>
		</form>
	</div>
</div>
