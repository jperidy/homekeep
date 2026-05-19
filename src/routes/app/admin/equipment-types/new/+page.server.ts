import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { prisma } from '$lib/server/prisma';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim() ?? '';
		const category = data.get('category')?.toString().trim() ?? '';
		const description = data.get('description')?.toString().trim() || null;

		if (!name) return fail(400, { error: 'Le nom est requis.', name, category, description });
		if (!category)
			return fail(400, { error: 'La catégorie est requise.', name, category, description });

		try {
			await prisma.equipmentType.create({ data: { name, category, description } });
		} catch (e) {
			if ((e as { code?: string }).code === 'P2002') {
				return fail(409, {
					error: 'Un type avec ce nom existe déjà.',
					name,
					category,
					description
				});
			}
			throw e;
		}

		redirect(302, '/app/admin/equipment-types');
	}
} satisfies Actions;
