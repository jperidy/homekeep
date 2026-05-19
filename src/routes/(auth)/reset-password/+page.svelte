<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button, Input, FormField, ErrorMessage } from '$lib/components/ui';

	let password = $state('');
	let passwordConfirm = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	const token = $derived($page.url.searchParams.get('token') ?? '');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (password !== passwordConfirm) {
			error = 'Les mots de passe ne correspondent pas.';
			return;
		}
		loading = true;
		error = '';
		const res = await authClient.resetPassword({ newPassword: password, token });
		if (res.error) {
			error = res.error.message ?? 'Le lien est invalide ou expiré.';
		} else {
			success = true;
			setTimeout(() => goto('/login'), 2500);
		}
		loading = false;
	}
</script>

<div>
	<h1 class="text-xl font-semibold text-slate-800 mb-1">Nouveau mot de passe</h1>
	<p class="text-sm text-slate-500 mb-6">Choisissez un mot de passe d'au moins 8 caractères.</p>

	{#if !token}
		<div class="text-center py-4">
			<ErrorMessage
				message="Lien invalide. Veuillez recommencer la procédure depuis"
				class="rounded-lg px-3 py-3"
			/>
		</div>
	{:else if success}
		<div class="text-center py-4">
			<div
				class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3"
			>
				<Check class="w-6 h-6 text-green-600" />
			</div>
			<p class="font-medium text-slate-800">Mot de passe mis à jour !</p>
			<p class="text-sm text-slate-500 mt-1">Redirection vers la connexion…</p>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-4">
			<FormField label="Nouveau mot de passe" id="password">
				<Input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength={8}
					placeholder="8 caractères minimum"
				/>
			</FormField>
			<FormField label="Confirmer le mot de passe" id="password-confirm">
				<Input
					id="password-confirm"
					type="password"
					bind:value={passwordConfirm}
					required
					minlength={8}
					placeholder="Répétez votre mot de passe"
				/>
			</FormField>
			{#if error}
				<ErrorMessage message={error} />
			{/if}
			<Button type="submit" disabled={loading} fullWidth>
				{loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
			</Button>
		</form>
	{/if}
</div>
