<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import {
		Button,
		Input,
		Textarea,
		FormField,
		Card,
		ErrorMessage,
		BackLink
	} from '$lib/components/ui';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);

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
</script>

<div class="max-w-lg">
	<BackLink href="/app/admin/equipment-types" label="Retour au catalogue" />

	<Card class="p-6">
		<h1 class="text-xl font-semibold text-slate-900 mb-1">Nouveau type d'équipement</h1>
		<p class="text-sm text-slate-500 mb-6">
			Définissez un type d'équipement disponible pour tous les utilisateurs.
		</p>

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
			<FormField label="Nom" id="name" required>
				<Input
					id="name"
					name="name"
					type="text"
					required
					value={form?.name ?? ''}
					accent="violet"
					placeholder="Ex : Chaudière à gaz, Pompe à chaleur…"
				/>
			</FormField>
			<FormField label="Catégorie" id="category" required>
				<Input
					id="category"
					name="category"
					type="text"
					required
					list="category-suggestions"
					value={form?.category ?? ''}
					accent="violet"
					placeholder="Ex : Chauffage, Plomberie…"
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
					value={form?.description ?? ''}
					accent="violet"
					placeholder="Description courte de cet équipement…"
				/>
			</FormField>
			{#if form?.error}
				<ErrorMessage message={form.error} />
			{/if}
			<Button type="submit" variant="admin" disabled={loading} fullWidth>
				{loading ? 'Enregistrement…' : 'Créer le type'}
			</Button>
		</form>
	</Card>
</div>
