import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const properties = await prisma.property.findMany({
		where: { userId: locals.user!.id },
		orderBy: { createdAt: 'desc' }
	});

	return { properties };
};
