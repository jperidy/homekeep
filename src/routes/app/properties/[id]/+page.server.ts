import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { getNextDueDate } from '$lib/server/maintenance';

export const load = (async ({ params, locals }) => {
	const property = await prisma.property.findFirst({
		where: { id: params.id, userId: locals.user!.id },
		include: {
			equipments: {
				include: { equipmentType: true },
				orderBy: { createdAt: 'desc' }
			}
		}
	});
	if (!property) error(404, 'Propriété introuvable');

	const tasks = await prisma.maintenanceTask.findMany({
		where: {
			completedAt: null,
			plan: { equipment: { propertyId: params.id } }
		},
		include: {
			plan: { include: { equipment: true } },
			rule: true
		},
		orderBy: { dueDate: 'asc' }
	});

	return { property, tasks };
}) satisfies PageServerLoad;

export const actions = {
	completeTask: async ({ request, params, locals }) => {
		const property = await prisma.property.findFirst({
			where: { id: params.id, userId: locals.user!.id }
		});
		if (!property) error(404, 'Propriété introuvable');

		const data = await request.formData();
		const taskId = data.get('taskId')?.toString() ?? '';
		if (!taskId) return fail(400, { taskError: 'Identifiant de tâche manquant.' });

		const task = await prisma.maintenanceTask.findFirst({
			where: { id: taskId, plan: { equipment: { propertyId: params.id } } },
			include: { rule: true }
		});
		if (!task) return fail(404, { taskError: 'Tâche introuvable.' });

		const now = new Date();
		await prisma.maintenanceTask.update({
			where: { id: taskId },
			data: { completedAt: now }
		});

		if (task.rule) {
			await prisma.maintenanceTask.create({
				data: {
					planId: task.planId,
					ruleId: task.ruleId,
					title: task.title,
					dueDate: getNextDueDate(now, task.rule.intervalWeeks)
				}
			});
		}

		return {};
	}
} satisfies Actions;
