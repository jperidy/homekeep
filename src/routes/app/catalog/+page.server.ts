import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async () => {
	const types = await prisma.equipmentType.findMany({
		orderBy: [{ category: 'asc' }, { name: 'asc' }],
		include: { _count: { select: { equipments: true } } }
	});
	return { types };
}) satisfies PageServerLoad;
