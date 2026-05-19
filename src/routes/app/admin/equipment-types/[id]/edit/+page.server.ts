import { redirect, fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async ({ params }) => {
	const type = await prisma.equipmentType.findUnique({
		where: { id: params.id },
		include: { maintenanceRules: { orderBy: { createdAt: 'asc' } } }
	});
	if (!type) error(404, 'Type introuvable');
	return { type };
}) satisfies PageServerLoad;

export const actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim() ?? '';
		const category = data.get('category')?.toString().trim() ?? '';
		const description = data.get('description')?.toString().trim() || null;

		if (!name) return fail(400, { error: 'Le nom est requis.', name, category, description });
		if (!category) return fail(400, { error: 'La catégorie est requise.', name, category, description });

		try {
			await prisma.equipmentType.update({
				where: { id: params.id },
				data: { name, category, description }
			});
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(409, { error: 'Un type avec ce nom existe déjà.', name, category, description });
			}
			throw e;
		}

		redirect(302, '/app/admin/equipment-types');
	},

	delete: async ({ params }) => {
		try {
			await prisma.equipmentType.delete({ where: { id: params.id } });
		} catch (e) {
			if ((e as { code?: string }).code === 'P2003') {
				return fail(400, { deleteError: 'Impossible de supprimer : des équipements utilisent ce type.' });
			}
			throw e;
		}

		redirect(302, '/app/admin/equipment-types');
	},

	addRule: async ({ request, params }) => {
		const data = await request.formData();
		const label = data.get('label')?.toString().trim() ?? '';
		const intervalWeeks = parseInt(data.get('intervalWeeks')?.toString() ?? '0', 10);
		const description = data.get('description')?.toString().trim() || null;

		if (!label) return fail(400, { ruleError: 'Le libellé est requis.' });
		if (!intervalWeeks || intervalWeeks < 1) {
			return fail(400, { ruleError: "L'intervalle doit être d'au moins 1 semaine." });
		}

		try {
			await prisma.maintenanceRule.create({
				data: { equipmentTypeId: params.id, label, intervalWeeks, description }
			});
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(409, { ruleError: 'Une règle avec ce libellé existe déjà pour ce type.' });
			}
			throw e;
		}

		redirect(302, `/app/admin/equipment-types/${params.id}/edit`);
	},

	deleteRule: async ({ request, params }) => {
		const data = await request.formData();
		const ruleId = data.get('ruleId')?.toString() ?? '';

		if (!ruleId) return fail(400, { ruleError: 'Identifiant de règle manquant.' });

		await prisma.maintenanceRule.deleteMany({
			where: { id: ruleId, equipmentTypeId: params.id }
		});

		redirect(302, `/app/admin/equipment-types/${params.id}/edit`);
	}
} satisfies Actions;
