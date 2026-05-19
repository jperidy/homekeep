import { redirect, fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { generatePlan } from '$lib/server/maintenance';

export const load = (async ({ params, locals }) => {
	const property = await prisma.property.findFirst({
		where: { id: params.id, userId: locals.user!.id }
	});
	if (!property) error(404, 'Propriété introuvable');

	const equipmentTypes = await prisma.equipmentType.findMany({
		orderBy: [{ category: 'asc' }, { name: 'asc' }]
	});

	return { property, equipmentTypes };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, params, locals }) => {
		const property = await prisma.property.findFirst({
			where: { id: params.id, userId: locals.user!.id }
		});
		if (!property) error(404, 'Propriété introuvable');

		const data = await request.formData();
		const name = data.get('name')?.toString().trim() ?? '';
		const equipmentTypeId = data.get('equipmentTypeId')?.toString() ?? '';
		const brand = data.get('brand')?.toString().trim() || null;
		const model = data.get('model')?.toString().trim() || null;
		const installedAtRaw = data.get('installedAt')?.toString();
		const installedAt = installedAtRaw ? new Date(installedAtRaw) : null;

		if (!name)
			return fail(400, { error: 'Le nom est requis.', name, equipmentTypeId, brand, model });
		if (!equipmentTypeId)
			return fail(400, { error: 'Le type est requis.', name, equipmentTypeId, brand, model });

		const equipment = await prisma.equipment.create({
			data: { propertyId: params.id, equipmentTypeId, name, brand, model, installedAt }
		});

		await generatePlan(equipment.id, equipmentTypeId, installedAt ?? equipment.createdAt);

		redirect(302, `/app/properties/${params.id}`);
	}
} satisfies Actions;
