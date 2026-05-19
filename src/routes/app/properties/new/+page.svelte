<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { Button, Input, FormField, Card, ErrorMessage, BackLink } from '$lib/components/ui';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="max-w-lg">
	<BackLink href="/app" label="Retour au tableau de bord" />

	<Card class="p-6">
		<h1 class="text-xl font-semibold text-slate-900 mb-1">Ajouter une propriété</h1>
		<p class="text-sm text-slate-500 mb-6">
			Enregistrez votre logement pour commencer à planifier votre maintenance.
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
			<FormField label="Nom de la propriété" id="name" required>
				<Input
					id="name"
					name="name"
					type="text"
					required
					placeholder="Ex : Appartement Paris, Maison de campagne…"
				/>
			</FormField>
			<FormField label="Adresse" id="address" optional="optionnelle">
				<Input
					id="address"
					name="address"
					type="text"
					value={form?.address ?? ''}
					placeholder="Ex : 10 rue de la Paix, 75001 Paris"
				/>
			</FormField>
			{#if form?.error}
				<ErrorMessage message={form.error} />
			{/if}
			<Button type="submit" disabled={loading} fullWidth>
				{loading ? 'Enregistrement…' : 'Ajouter la propriété'}
			</Button>
		</form>
	</Card>
</div>
