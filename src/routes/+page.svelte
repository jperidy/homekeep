<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	import { ArrowRight, Zap, Home, Calendar, Bell, ShoppingBag } from '@lucide/svelte';
	import type { Component } from 'svelte';

	const features: { title: string; description: string; icon: Component }[] = [
		{
			title: 'Gérez vos biens',
			description: 'Enregistrez vos propriétés et tous vos équipements en quelques clics. Un inventaire clair, toujours à jour.',
			icon: Home
		},
		{
			title: 'Planning automatisé',
			description: "Générez automatiquement un calendrier de maintenance basé sur les recommandations fabricant pour chaque équipement.",
			icon: Calendar
		},
		{
			title: 'Rappels intelligents',
			description: "Recevez des alertes avant chaque échéance. Ne laissez plus une révision ou un entretien vous passer sous le nez.",
			icon: Bell
		},
		{
			title: 'Produits recommandés',
			description: "Pour chaque tâche de maintenance, accédez aux produits adaptés sélectionnés par nos experts. Commandez en un clic.",
			icon: ShoppingBag
		}
	];

	const steps = [
		{
			number: '01',
			title: 'Ajoutez votre bien',
			description: "Renseignez votre logement et listez vos équipements : chaudière, VMC, toiture, piscine…"
		},
		{
			number: '02',
			title: 'Recevez votre planning',
			description: "HomeKeep génère automatiquement votre calendrier de maintenance personnalisé."
		},
		{
			number: '03',
			title: 'Agissez sereinement',
			description: "Suivez vos tâches, commandez les bons produits et gardez un historique complet."
		}
	];
</script>

<div class="min-h-screen bg-white">
	<!-- Navigation -->
	<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
				<Logo class="w-7 h-7" />
				<span class="text-xl font-bold tracking-tight text-slate-900">HomeKeep</span>
			</a>
			<nav class="flex items-center gap-3">
				<a href="/login" class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5">
					Se connecter
				</a>
				<a href="/register" class="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
					Commencer gratuitement
				</a>
			</nav>
		</div>
	</header>

	<!-- Hero -->
	<section class="pt-20 pb-24 px-4 sm:px-6">
		<div class="max-w-6xl mx-auto">
			<div class="max-w-3xl mx-auto text-center">
				<div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
					<Zap class="w-3.5 h-3.5" fill="currentColor" />
					Maintenance proactive, logement protégé
				</div>
				<h1 class="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
					Gardez votre logement
					<span class="text-blue-600"> en parfait état</span>
				</h1>
				<p class="text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
					Planifiez et suivez la maintenance de votre habitat, équipement par équipement.
					Ne laissez plus aucune révision vous échapper.
				</p>
				<div class="flex flex-col sm:flex-row gap-3 justify-center">
					<a href="/register" class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-base shadow-sm shadow-blue-200">
						Commencer gratuitement
						<ArrowRight class="w-4 h-4" />
					</a>
					<a href="#how-it-works" class="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-semibold px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors text-base">
						Voir comment ça marche
					</a>
				</div>
			</div>

			<!-- Dashboard preview -->
			<div class="mt-16 relative max-w-4xl mx-auto">
				<div class="absolute inset-0 bg-linear-to-b from-transparent to-white z-10 pointer-events-none" style="top: 70%;"></div>
				<div class="bg-slate-50 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
					<!-- Fake browser bar -->
					<div class="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-2">
						<div class="flex gap-1.5">
							<div class="w-3 h-3 rounded-full bg-slate-200"></div>
							<div class="w-3 h-3 rounded-full bg-slate-200"></div>
							<div class="w-3 h-3 rounded-full bg-slate-200"></div>
						</div>
						<div class="flex-1 mx-4 bg-slate-100 rounded-lg h-6 flex items-center px-3">
							<span class="text-xs text-slate-400">homekeep.app/app</span>
						</div>
					</div>
					<!-- Fake dashboard content -->
					<div class="p-6">
						<div class="flex items-center justify-between mb-6">
							<div>
								<div class="h-5 w-40 bg-slate-200 rounded-lg mb-2"></div>
								<div class="h-3.5 w-56 bg-slate-100 rounded-lg"></div>
							</div>
							<div class="h-9 w-32 bg-blue-100 rounded-xl"></div>
						</div>
						<div class="grid grid-cols-3 gap-4 mb-6">
							{#each [{ color: 'bg-blue-50 border-blue-100', bar: 'bg-blue-200' }, { color: 'bg-amber-50 border-amber-100', bar: 'bg-amber-200' }, { color: 'bg-green-50 border-green-100', bar: 'bg-green-200' }] as card}
								<div class="rounded-xl border {card.color} p-4">
									<div class="h-3 w-16 {card.bar} rounded mb-3"></div>
									<div class="h-7 w-10 bg-white rounded-lg mb-1 opacity-60"></div>
									<div class="h-2.5 w-20 {card.bar} rounded opacity-60"></div>
								</div>
							{/each}
						</div>
						<div class="space-y-3">
							{#each [1, 2, 3] as _}
								<div class="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4">
									<div class="w-9 h-9 rounded-lg bg-slate-100 shrink-0"></div>
									<div class="flex-1">
										<div class="h-3.5 w-48 bg-slate-200 rounded mb-2"></div>
										<div class="h-2.5 w-32 bg-slate-100 rounded"></div>
									</div>
									<div class="h-6 w-16 bg-slate-100 rounded-lg"></div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section class="py-24 px-4 sm:px-6 bg-slate-50">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-16">
				<h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
				<p class="text-lg text-slate-500 max-w-xl mx-auto">
					Un outil pensé pour les propriétaires qui veulent anticiper, pas subir.
				</p>
			</div>
			<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{#each features as feature}
					{@const Icon = feature.icon}
					<div class="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
						<div class="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
							<Icon class="w-5 h-5 text-blue-600" strokeWidth={1.5} />
						</div>
						<h3 class="font-semibold text-slate-900 mb-2">{feature.title}</h3>
						<p class="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- How it works -->
	<section id="how-it-works" class="py-24 px-4 sm:px-6">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-16">
				<h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Simple comme bonjour</h2>
				<p class="text-lg text-slate-500 max-w-xl mx-auto">
					Démarrez en moins de 5 minutes, sans formation ni configuration complexe.
				</p>
			</div>
			<div class="grid sm:grid-cols-3 gap-8 relative">
				<div class="hidden sm:block absolute top-10 left-1/3 right-1/3 h-px bg-slate-200 -translate-y-1/2" style="top: 2.5rem;"></div>
				{#each steps as step}
					<div class="text-center relative">
						<div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl mb-5 relative z-10 shadow-md shadow-blue-200">
							{step.number}
						</div>
						<h3 class="font-semibold text-slate-900 text-lg mb-2">{step.title}</h3>
						<p class="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA section -->
	<section class="py-20 px-4 sm:px-6 bg-blue-600">
		<div class="max-w-2xl mx-auto text-center">
			<h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
				Prêt à prendre soin de votre logement ?
			</h2>
			<p class="text-blue-100 text-lg mb-8">
				Rejoignez les propriétaires qui font confiance à HomeKeep pour ne jamais rater une maintenance.
			</p>
			<a href="/register" class="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-7 py-3.5 rounded-xl transition-colors text-base shadow-sm">
				Créer mon compte gratuitement
				<ArrowRight class="w-4 h-4" />
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
		<div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<Logo class="w-5 h-5 text-blue-400" />
				<span class="text-sm font-semibold text-slate-300">HomeKeep</span>
			</div>
			<div class="flex items-center gap-6 text-sm">
				<a href="/terms" class="hover:text-slate-200 transition-colors">Conditions d'utilisation</a>
				<span>·</span>
				<span>© 2026 HomeKeep</span>
			</div>
		</div>
	</footer>
</div>
