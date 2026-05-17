<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

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
			<p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-3">
				Lien invalide. Veuillez recommencer la procédure depuis
				<a href="/forgot-password" class="underline">mot de passe oublié</a>.
			</p>
		</div>
	{:else if success}
		<div class="text-center py-4">
			<div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
				<Check class="w-6 h-6 text-green-600" />
			</div>
			<p class="font-medium text-slate-800">Mot de passe mis à jour !</p>
			<p class="text-sm text-slate-500 mt-1">Redirection vers la connexion…</p>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">
					Nouveau mot de passe
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength={8}
					placeholder="8 caractères minimum"
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
				/>
			</div>
			<div>
				<label for="password-confirm" class="block text-sm font-medium text-slate-700 mb-1.5">
					Confirmer le mot de passe
				</label>
				<input
					id="password-confirm"
					type="password"
					bind:value={passwordConfirm}
					required
					minlength={8}
					placeholder="Répétez votre mot de passe"
					class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
				/>
			</div>
			{#if error}
				<p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
			{/if}
			<button
				type="submit"
				disabled={loading}
				class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
			</button>
		</form>
	{/if}
</div>
