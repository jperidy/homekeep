<script lang="ts">
	import { Mail } from '@lucide/svelte';
	import { signIn, authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';

	const googleEnabled = env.PUBLIC_GOOGLE_ENABLED === 'true';

	let mode: 'password' | 'magic' = $state('password');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');
	let magicSent = $state(false);

	async function handlePasswordLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		const res = await signIn.email({ email, password, callbackURL: '/app' });
		if (res.error) {
			error = res.error.message ?? 'Identifiants incorrects.';
		}
		loading = false;
	}

	async function handleMagicLink(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		const res = await authClient.signIn.magicLink({ email, callbackURL: '/app' });
		if (res.error) {
			error = res.error.message ?? 'Une erreur est survenue.';
		} else {
			magicSent = true;
		}
		loading = false;
	}

	async function handleGoogle() {
		loading = true;
		await signIn.social({ provider: 'google', callbackURL: '/app' });
	}
</script>

<div>
	<h1 class="text-xl font-semibold text-slate-800 mb-1">Connexion</h1>
	<p class="text-sm text-slate-500 mb-6">
		Pas encore de compte ?
		<a href="/register" class="text-blue-600 hover:underline font-medium">Créer un compte</a>
	</p>

	<!-- Google OAuth -->
	{#if googleEnabled}
		<button
			onclick={handleGoogle}
			disabled={loading}
			class="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
		>
			<!-- SVG Google brand — ne pas remplacer par lucide -->
			<svg class="w-5 h-5" viewBox="0 0 24 24">
				<path
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					fill="#4285F4"
				/>
				<path
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					fill="#34A853"
				/>
				<path
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					fill="#FBBC05"
				/>
				<path
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					fill="#EA4335"
				/>
			</svg>
			Continuer avec Google
		</button>

		<div class="flex items-center gap-3 mb-4">
			<hr class="flex-1 border-slate-200" />
			<span class="text-xs text-slate-400">ou</span>
			<hr class="flex-1 border-slate-200" />
		</div>
	{/if}

	<!-- Mode toggle -->
	<div class="flex rounded-xl bg-slate-100 p-1 mb-5">
		<button
			onclick={() => {
				mode = 'password';
				magicSent = false;
				error = '';
			}}
			class="flex-1 text-sm py-1.5 rounded-lg font-medium transition-all {mode === 'password'
				? 'bg-white shadow-sm text-slate-800'
				: 'text-slate-500 hover:text-slate-700'}"
		>
			Mot de passe
		</button>
		<button
			onclick={() => {
				mode = 'magic';
				error = '';
			}}
			class="flex-1 text-sm py-1.5 rounded-lg font-medium transition-all {mode === 'magic'
				? 'bg-white shadow-sm text-slate-800'
				: 'text-slate-500 hover:text-slate-700'}"
		>
			Magic link
		</button>
	</div>

	{#if magicSent}
		<div class="text-center py-4">
			<div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
				<Mail class="w-6 h-6 text-blue-600" />
			</div>
			<p class="font-medium text-slate-800">Vérifiez votre boîte mail</p>
			<p class="text-sm text-slate-500 mt-1">
				Un lien de connexion a été envoyé à <strong>{email}</strong>.
			</p>
			<button
				onclick={() => {
					magicSent = false;
				}}
				class="text-sm text-blue-600 hover:underline mt-3"
			>
				Renvoyer un lien
			</button>
		</div>
	{:else if mode === 'password'}
		<form onsubmit={handlePasswordLogin} class="space-y-4">
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
			<div>
				<div class="flex items-center justify-between mb-1.5">
					<label for="password" class="block text-sm font-medium text-slate-700">Mot de passe</label
					>
					<a href="/forgot-password" class="text-xs text-blue-600 hover:underline"
						>Mot de passe oublié ?</a
					>
				</div>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					placeholder="••••••••"
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
				{loading ? 'Connexion...' : 'Se connecter'}
			</button>
		</form>
	{:else}
		<form onsubmit={handleMagicLink} class="space-y-4">
			<div>
				<label for="email-magic" class="block text-sm font-medium text-slate-700 mb-1.5"
					>Email</label
				>
				<input
					id="email-magic"
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
				{loading ? 'Envoi...' : 'Envoyer le lien de connexion'}
			</button>
		</form>
	{/if}
</div>
