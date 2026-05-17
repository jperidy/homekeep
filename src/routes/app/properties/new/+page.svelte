<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft } from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="max-w-lg">
	<a
		href="/app"
		class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
	>
		<ArrowLeft class="w-4 h-4" />
		Retour au tableau de bord
	</a>

	<div class="bg-white rounded-2xl border border-slate-100 p-6">
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
			<div>
				<label for="name" class="block text-sm font-medium text-slate-700 mb-1.5">
					Nom de la propriété <span class="text-red-500">*</span>
				</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					placeholder="Ex : Appartement Paris, Maison de campagne…"
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
				/>
			</div>
			<div>
				<label for="address" class="block text-sm font-medium text-slate-700 mb-1.5">
					Adresse <span class="text-slate-400 font-normal">(optionnelle)</span>
				</label>
				<input
					id="address"
					name="address"
					type="text"
					value={form?.address ?? ''}
					placeholder="Ex : 10 rue de la Paix, 75001 Paris"
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
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
				{loading ? 'Enregistrement…' : 'Ajouter la propriété'}
			</button>
		</form>
	</div>
</div>
