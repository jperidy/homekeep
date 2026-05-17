<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	let { children } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<a href="/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
				<Logo class="w-8 h-8" />
				<span class="text-2xl font-bold tracking-tight">HomeKeep</span>
			</a>
			<p class="mt-1 text-sm text-slate-500">Gestion de maintenance de votre habitat</p>
		</div>

		<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
			{@render children()}
		</div>
	</div>
</div>
