<script lang="ts">
	import { Mail } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let loading = $state(false);
	let error = $state('');
	let sent = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		const res = await authClient.forgetPassword({ email, redirectTo: '/reset-password' });
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
			<div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
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
			<div>
				<label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					placeholder="vous@exemple.fr"
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
				{loading ? 'Envoi en cours…' : 'Envoyer le lien'}
			</button>
			<p class="text-center">
				<a href="/login" class="text-sm text-slate-500 hover:text-slate-700"
					>Retour à la connexion</a
				>
			</p>
		</form>
	{/if}
</div>
