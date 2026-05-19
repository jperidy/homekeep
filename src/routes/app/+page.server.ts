import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async ({ locals }) => {
	const properties = await prisma.property.findMany({
		where: { userId: locals.user!.id },
		orderBy: { createdAt: 'desc' },
		include: { _count: { select: { equipments: true } } }
	});

	const equipmentCount = properties.reduce((sum, p) => sum + p._count.equipments, 0);

	const pendingTaskCount = await prisma.maintenanceTask.count({
		where: {
			completedAt: null,
			plan: { equipment: { property: { userId: locals.user!.id } } }
		}
	});

	return { properties, equipmentCount, pendingTaskCount };
}) satisfies PageServerLoad;
