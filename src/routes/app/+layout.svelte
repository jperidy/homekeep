<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	import { LogOut, ShieldCheck } from '@lucide/svelte';
	import { signOut } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { children, data } = $props();

	async function handleSignOut() {
		await signOut();
		goto('/login');
	}
</script>

<div class="min-h-screen bg-slate-50">
	<header class="bg-white border-b border-slate-100 sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
			<a
				href="/app"
				class="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
			>
				<Logo class="w-6 h-6" />
				<span class="text-lg font-bold tracking-tight text-slate-900">HomeKeep</span>
			</a>
			<div class="flex items-center gap-4">
				<span class="text-sm text-slate-500 hidden sm:block">{data.user?.name}</span>
				{#if data.isAdmin}
					<a
						href="/app/admin/equipment-types"
						class="text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1.5"
					>
						<ShieldCheck class="w-4 h-4" />
						Admin
					</a>
				{/if}
				<button
					onclick={handleSignOut}
					class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
				>
					<LogOut class="w-4 h-4" />
					Déconnexion
				</button>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
		{@render children()}
	</main>
</div>
