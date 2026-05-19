import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { prisma } from '$lib/server/prisma';

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim() ?? '';
		const address = data.get('address')?.toString().trim() || null;

		if (!name) {
			return fail(400, { error: 'Le nom est requis.', address: address ?? '' });
		}

		await prisma.property.create({
			data: {
				userId: locals.user!.id,
				name,
				address
			}
		});

		redirect(302, '/app');
	}
} satisfies Actions;
