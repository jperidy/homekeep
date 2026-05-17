<script lang="ts">
	import { Home, Wrench, ClipboardList, Plus, LayoutGrid } from '@lucide/svelte';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const stats: { label: string; value: number; icon: Component; color: string }[] = $derived([
		{ label: 'Propriétés',        value: data.properties.length, icon: Home,          color: 'text-blue-600 bg-blue-50'    },
		{ label: 'Équipements',       value: 0,                      icon: Wrench,        color: 'text-violet-600 bg-violet-50' },
		{ label: 'Tâches en attente', value: 0,                      icon: ClipboardList, color: 'text-amber-600 bg-amber-50'  }
	]);

	const quickActions: { title: string; description: string; href: string; icon: Component }[] = [
		{
			title: 'Ajouter une propriété',
			description: 'Enregistrez votre logement principal ou secondaire',
			href: '/app/properties/new',
			icon: Plus
		},
		{
			title: 'Parcourir le catalogue',
			description: 'Découvrez les équipements et templates de maintenance',
			href: '/app/catalog',
			icon: LayoutGrid
		}
	];
</script>

<div>
	<!-- Welcome banner -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-slate-900">
			Bonjour, {data.user?.name?.split(' ')[0]} 👋
		</h1>
		<p class="text-slate-500 mt-1">Voici un aperçu de l'état de votre habitat.</p>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
		{#each stats as stat}
			{@const Icon = stat.icon}
			<div class="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
				<div class="w-11 h-11 rounded-xl {stat.color} flex items-center justify-center shrink-0">
					<Icon class="w-5 h-5" strokeWidth={1.5} />
				</div>
				<div>
					<p class="text-2xl font-bold text-slate-900">{stat.value}</p>
					<p class="text-sm text-slate-500">{stat.label}</p>
				</div>
			</div>
		{/each}
	</div>

	<!-- Properties list or empty state -->
	{#if data.properties.length > 0}
		<div class="bg-white rounded-2xl border border-slate-100 mb-8">
			<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
				<h2 class="font-semibold text-slate-900">Mes propriétés</h2>
				<a
					href="/app/properties/new"
					class="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
				>
					<Plus class="w-3.5 h-3.5" />
					Ajouter
				</a>
			</div>
			<ul class="divide-y divide-slate-50">
				{#each data.properties as property}
					<li class="px-5 py-4 flex items-center gap-3">
						<div class="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
							<Home class="w-4 h-4 text-blue-600" strokeWidth={1.5} />
						</div>
						<div class="flex-1 min-w-0">
							<p class="font-medium text-slate-900 truncate">{property.name}</p>
							{#if property.address}
								<p class="text-xs text-slate-500 truncate">{property.address}</p>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<div class="bg-white rounded-2xl border border-slate-100 p-10 text-center mb-8">
			<div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
				<Home class="w-8 h-8 text-blue-600" strokeWidth={1.5} />
			</div>
			<h2 class="text-lg font-semibold text-slate-900 mb-2">Commencez par ajouter votre logement</h2>
			<p class="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
				Enregistrez votre première propriété pour générer votre planning de maintenance personnalisé.
			</p>
			<a
				href="/app/properties/new"
				class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
			>
				<Plus class="w-4 h-4" />
				Ajouter ma première propriété
			</a>
		</div>
	{/if}

	<!-- Quick actions -->
	<h2 class="text-base font-semibold text-slate-900 mb-3">Actions rapides</h2>
	<div class="grid sm:grid-cols-2 gap-4">
		{#each quickActions as action}
			{@const Icon = action.icon}
			<a
				href={action.href}
				class="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 hover:shadow-sm hover:border-slate-200 transition-all group"
			>
				<div class="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center shrink-0 transition-colors">
					<Icon class="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
				</div>
				<div>
					<p class="font-medium text-slate-900 mb-0.5">{action.title}</p>
					<p class="text-sm text-slate-500">{action.description}</p>
				</div>
			</a>
		{/each}
	</div>
</div>
