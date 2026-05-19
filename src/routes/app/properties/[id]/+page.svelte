<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, Plus, Wrench, MapPin, CheckCircle, Clock, AlertCircle } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const now = new Date();
	const overdue = $derived(data.tasks.filter(t => new Date(t.dueDate) < now));
	const upcoming = $derived(data.tasks.filter(t => new Date(t.dueDate) >= now));
</script>

<div>
	<a
		href="/app"
		class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
	>
		<ArrowLeft class="w-4 h-4" />
		Tableau de bord
	</a>

	<div class="flex items-start justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">{data.property.name}</h1>
			{#if data.property.address}
				<p class="text-sm text-slate-500 mt-1 flex items-center gap-1">
					<MapPin class="w-3.5 h-3.5" />
					{data.property.address}
				</p>
			{/if}
		</div>
		<a
			href="/app/properties/{data.property.id}/equipment/new"
			class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
		>
			<Plus class="w-4 h-4" />
			Ajouter un équipement
		</a>
	</div>

	{#if form && 'taskError' in form}
		<p class="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{form.taskError}</p>
	{/if}

	<!-- Maintenance tasks -->
	{#if data.tasks.length > 0}
		<div class="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
			<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
				<div>
					<h2 class="font-semibold text-slate-900">Planning de maintenance</h2>
					<p class="text-xs text-slate-500 mt-0.5">
						{#if overdue.length > 0}
							<span class="text-red-600 font-medium">{overdue.length} en retard</span>
							{#if upcoming.length > 0}&nbsp;·&nbsp;{/if}
						{/if}
						{#if upcoming.length > 0}{upcoming.length} à venir{/if}
					</p>
				</div>
				<div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
					<Clock class="w-4.5 h-4.5 text-amber-600" strokeWidth={1.5} />
				</div>
			</div>

			{#if overdue.length > 0}
				<div class="px-5 pt-4 pb-3">
					<p class="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
						<AlertCircle class="w-3.5 h-3.5" />
						En retard
					</p>
					<ul class="space-y-2">
						{#each overdue as task}
							<li class="flex items-center justify-between gap-3 bg-red-50 rounded-xl px-4 py-3">
								<div class="min-w-0">
									<p class="text-sm font-medium text-slate-800 truncate">{task.title}</p>
									<p class="text-xs text-red-500 mt-0.5">
										Prévu le {new Date(task.dueDate).toLocaleDateString('fr-FR')}
										· {task.plan.equipment.name}
									</p>
								</div>
								<form method="POST" action="?/completeTask" use:enhance class="shrink-0">
									<input type="hidden" name="taskId" value={task.id} />
									<button
										type="submit"
										title="Marquer comme fait"
										class="inline-flex items-center gap-1.5 bg-white hover:bg-green-50 border border-slate-200 hover:border-green-300 text-slate-600 hover:text-green-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
									>
										<CheckCircle class="w-3.5 h-3.5" />
										Fait
									</button>
								</form>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if upcoming.length > 0}
				<div class="px-5 {overdue.length > 0 ? 'pt-1' : 'pt-4'} pb-4">
					<p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">À venir</p>
					<ul class="space-y-2">
						{#each upcoming as task}
							<li class="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
								<div class="min-w-0">
									<p class="text-sm font-medium text-slate-800 truncate">{task.title}</p>
									<p class="text-xs text-slate-500 mt-0.5">
										Prévu le {new Date(task.dueDate).toLocaleDateString('fr-FR')}
										· {task.plan.equipment.name}
									</p>
								</div>
								<form method="POST" action="?/completeTask" use:enhance class="shrink-0">
									<input type="hidden" name="taskId" value={task.id} />
									<button
										type="submit"
										title="Marquer comme fait"
										class="inline-flex items-center gap-1.5 bg-white hover:bg-green-50 border border-slate-200 hover:border-green-300 text-slate-600 hover:text-green-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
									>
										<CheckCircle class="w-3.5 h-3.5" />
										Fait
									</button>
								</form>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Equipment list -->
	{#if data.property.equipments.length === 0}
		<div class="bg-white rounded-2xl border border-slate-100 p-10 text-center">
			<div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
				<Wrench class="w-7 h-7 text-blue-600" strokeWidth={1.5} />
			</div>
			<h2 class="text-base font-semibold text-slate-900 mb-2">Aucun équipement</h2>
			<p class="text-sm text-slate-500 mb-5 max-w-xs mx-auto">
				Ajoutez vos équipements pour générer votre planning de maintenance.
			</p>
			<a
				href="/app/properties/{data.property.id}/equipment/new"
				class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
			>
				<Plus class="w-4 h-4" />
				Ajouter un équipement
			</a>
		</div>
	{:else}
		<div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
			<div class="px-5 py-4 border-b border-slate-100">
				<h2 class="font-semibold text-slate-900">
					{data.property.equipments.length} équipement{data.property.equipments.length !== 1 ? 's' : ''}
				</h2>
			</div>
			<ul class="divide-y divide-slate-50">
				{#each data.property.equipments as equipment}
					<li class="px-5 py-4 flex items-center gap-4">
						<div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
							<Wrench class="w-5 h-5 text-slate-500" strokeWidth={1.5} />
						</div>
						<div class="flex-1 min-w-0">
							<p class="font-medium text-slate-900 truncate">{equipment.name}</p>
							<p class="text-xs text-slate-500 mt-0.5">
								{equipment.equipmentType.category} · {equipment.equipmentType.name}
								{#if equipment.brand || equipment.model}
									· {[equipment.brand, equipment.model].filter(Boolean).join(' ')}
								{/if}
							</p>
						</div>
						{#if equipment.installedAt}
							<span class="text-xs text-slate-400 shrink-0">
								Installé le {new Date(equipment.installedAt).toLocaleDateString('fr-FR')}
							</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
