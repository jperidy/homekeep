import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

const mocks = vi.hoisted(() => ({
	create: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
	prisma: { equipmentType: { create: mocks.create } }
}));

import { actions } from './+page.server';

function makeEvent(fields: Record<string, string>) {
	const formData = new FormData();
	for (const [k, v] of Object.entries(fields)) formData.append(k, v);
	return {
		request: new Request('http://localhost', { method: 'POST', body: formData }),
		locals: {}
	} as any;
}

// --- Action tests ---

describe('equipment-types/new — action', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns 400 when name is empty', async () => {
		const result = await actions.default(makeEvent({ name: '', category: 'Heating' }));
		expect(result).toMatchObject({ status: 400, data: { error: expect.any(String) } });
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('returns 400 when category is empty', async () => {
		const result = await actions.default(makeEvent({ name: 'Boiler', category: '' }));
		expect(result).toMatchObject({ status: 400, data: { error: expect.any(String) } });
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('returns 400 when name is only whitespace', async () => {
		const result = await actions.default(makeEvent({ name: '   ', category: 'Heating' }));
		expect(result).toMatchObject({ status: 400 });
	});

	it('creates the equipment type and redirects', async () => {
		mocks.create.mockResolvedValueOnce({ id: 'et-1' });
		await expect(
			actions.default(makeEvent({ name: 'Gas boiler', category: 'Chauffage', description: 'Desc' }))
		).rejects.toMatchObject({ status: 302, location: '/app/admin/equipment-types' });
		expect(mocks.create).toHaveBeenCalledWith({
			data: { name: 'Gas boiler', category: 'Chauffage', description: 'Desc' }
		});
	});

	it('stores null when description is blank', async () => {
		mocks.create.mockResolvedValueOnce({ id: 'et-2' });
		await expect(
			actions.default(makeEvent({ name: 'VMC', category: 'Ventilation', description: '' }))
		).rejects.toMatchObject({ status: 302 });
		expect(mocks.create).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ description: null }) })
		);
	});

	it('returns 409 on a unique constraint violation', async () => {
		mocks.create.mockRejectedValueOnce({ code: 'P2002' });
		const result = await actions.default(makeEvent({ name: 'Boiler', category: 'Chauffage' }));
		expect(result).toMatchObject({ status: 409, data: { error: expect.any(String) } });
	});
});

// --- UI tests ---

describe('equipment-types/new — page', () => {
	it('renders name, category, and description fields', () => {
		render(Page, { props: { form: null } });
		expect(screen.getByLabelText(/^nom/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
	});

	it('shows error message from action data', () => {
		render(Page, {
			props: { form: { error: 'Le nom est requis.', name: '', category: '', description: null } }
		});
		expect(screen.getByText('Le nom est requis.')).toBeInTheDocument();
	});

	it('repopulates fields after an error', () => {
		render(Page, {
			props: { form: { error: 'Error', name: 'Boiler', category: 'Chauffage', description: null } }
		});
		expect((screen.getByLabelText(/^nom/i) as HTMLInputElement).value).toBe('Boiler');
		expect((screen.getByLabelText(/catégorie/i) as HTMLInputElement).value).toBe('Chauffage');
	});
});
