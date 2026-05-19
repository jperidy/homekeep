<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import {
		Button,
		Input,
		FormField,
		Card,
		Select,
		ErrorMessage,
		BackLink
	} from '$lib/components/ui';

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
	<BackLink href="/app/properties/{data.property.id}" label={data.property.name} />

	<Card class="p-6">
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
				<FormField label="Type d'équipement" id="equipmentTypeId" required>
					<Select
						id="equipmentTypeId"
						name="equipmentTypeId"
						required
						value={form?.equipmentTypeId ?? ''}
					>
						<option value="">— Choisir un type —</option>
						{#each Object.entries(byCategory) as [category, types]}
							<optgroup label={category}>
								{#each types as type}
									<option value={type.id}>{type.name}</option>
								{/each}
							</optgroup>
						{/each}
					</Select>
				</FormField>
				<FormField label="Nom personnalisé" id="name" required>
					<Input
						id="name"
						name="name"
						type="text"
						required
						value={form?.name ?? ''}
						placeholder="Ex : Chaudière principale, Pompe piscine…"
					/>
				</FormField>
				<div class="grid grid-cols-2 gap-3">
					<FormField label="Marque" id="brand" optional="optionnel">
						<Input
							id="brand"
							name="brand"
							type="text"
							value={form?.brand ?? ''}
							placeholder="Ex : Viessmann"
						/>
					</FormField>
					<FormField label="Modèle" id="model" optional="optionnel">
						<Input
							id="model"
							name="model"
							type="text"
							value={form?.model ?? ''}
							placeholder="Ex : Vitodens 100-W"
						/>
					</FormField>
				</div>
				<FormField label="Date d'installation" id="installedAt" optional="optionnelle">
					<Input id="installedAt" name="installedAt" type="date" />
				</FormField>
				{#if form?.error}
					<ErrorMessage message={form.error} />
				{/if}
				<Button type="submit" disabled={loading} fullWidth>
					{loading ? 'Enregistrement…' : "Ajouter l'équipement"}
				</Button>
			</form>
		{/if}
	</Card>
</div>
