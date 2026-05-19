<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
		Plus,
		Wrench,
		MapPin,
		CheckCircle,
		Clock,
		AlertCircle
	} from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';
	import {
		Button,
		Card,
		CardHeader,
		ErrorMessage,
		EmptyState,
		IconBox,
		Badge,
		BackLink
	} from '$lib/components/ui';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const now = new Date();
	const overdue = $derived(data.tasks.filter((t) => new Date(t.dueDate) < now));
	const upcoming = $derived(data.tasks.filter((t) => new Date(t.dueDate) >= now));
</script>

<div>
	<BackLink href="/app" label="Tableau de bord" />

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
		<Button href="/app/properties/{data.property.id}/equipment/new">
			<Plus class="w-4 h-4" />
			Ajouter un équipement
		</Button>
	</div>

	{#if form && 'taskError' in form}
		<ErrorMessage message={String(form.taskError)} class="rounded-xl px-4 py-3 mb-4" />
	{/if}

	<!-- Maintenance tasks -->
	{#if data.tasks.length > 0}
		<Card class="mb-4">
			<CardHeader>
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
				<IconBox icon={Clock} color="amber" size="sm" />
			</CardHeader>

			{#if overdue.length > 0}
				<div class="px-5 pt-4 pb-3">
					<p
						class="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"
					>
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
									<Button type="submit" variant="success" size="xs" title="Marquer comme fait">
										<CheckCircle class="w-3.5 h-3.5" />
										Fait
									</Button>
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
									<Button type="submit" variant="success" size="xs" title="Marquer comme fait">
										<CheckCircle class="w-3.5 h-3.5" />
										Fait
									</Button>
								</form>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</Card>
	{/if}

	<!-- Equipment list -->
	{#if data.property.equipments.length === 0}
		<EmptyState
			icon={Wrench}
			title="Aucun équipement"
			description="Ajoutez vos équipements pour générer votre planning de maintenance."
		>
			{#snippet action()}
				<Button href="/app/properties/{data.property.id}/equipment/new">
					<Plus class="w-4 h-4" />
					Ajouter un équipement
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<Card>
			<CardHeader>
				<h2 class="font-semibold text-slate-900">
					{data.property.equipments.length} équipement{data.property.equipments.length !== 1
						? 's'
						: ''}
				</h2>
			</CardHeader>
			<ul class="divide-y divide-slate-50">
				{#each data.property.equipments as equipment}
					<li class="px-5 py-4 flex items-center gap-4">
						<IconBox icon={Wrench} color="slate" />
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
		</Card>
	{/if}
</div>
