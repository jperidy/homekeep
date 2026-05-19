<script lang="ts">
	import { Mail } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import { Button, Input, FormField, ErrorMessage } from '$lib/components/ui';

	let email = $state('');
	let loading = $state(false);
	let error = $state('');
	let sent = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		const res = await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' });
		if (res.error) {
			error = res.error.message ?? 'Une erreur est survenue.';
		} else {
			sent = true;
		}
		loading = false;
	}
</script>

<div>
	<h1 class="text-xl font-semibold text-slate-800 mb-1">Mot de passe oublié</h1>
	<p class="text-sm text-slate-500 mb-6">
		Renseignez votre email et nous vous enverrons un lien de réinitialisation.
	</p>

	{#if sent}
		<div class="text-center py-4">
			<div
				class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3"
			>
				<Mail class="w-6 h-6 text-green-600" />
			</div>
			<p class="font-medium text-slate-800">Vérifiez votre boîte mail</p>
			<p class="text-sm text-slate-500 mt-1">
				Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.<br />
				Ce lien expire dans 1 heure.
			</p>
			<a href="/login" class="inline-block text-sm text-blue-600 hover:underline mt-4">
				Retour à la connexion
			</a>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-4">
			<FormField label="Email" id="email">
				<Input id="email" type="email" bind:value={email} required placeholder="vous@exemple.fr" />
			</FormField>
			{#if error}
				<ErrorMessage message={error} />
			{/if}
			<Button type="submit" disabled={loading} fullWidth>
				{loading ? 'Envoi en cours…' : 'Envoyer le lien'}
			</Button>
			<p class="text-center">
				<a href="/login" class="text-sm text-slate-500 hover:text-slate-700">
					Retour à la connexion
				</a>
			</p>
		</form>
	{/if}
</div>
