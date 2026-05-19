import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

const mocks = vi.hoisted(() => ({
	propertyFindFirst: vi.fn(),
	equipmentCreate: vi.fn(),
	equipmentTypesFindMany: vi.fn(),
	generatePlan: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
	prisma: {
		property: { findFirst: mocks.propertyFindFirst },
		equipment: { create: mocks.equipmentCreate },
		equipmentType: { findMany: mocks.equipmentTypesFindMany }
	}
}));

vi.mock('$lib/server/maintenance', () => ({
	generatePlan: mocks.generatePlan
}));

import { actions } from './+page.server';

const PROPERTY = { id: 'prop-1', name: 'My apartment', userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), address: null };

function makeEvent(fields: Record<string, string>, userId = 'user-1', propertyId = 'prop-1') {
	const formData = new FormData();
	for (const [k, v] of Object.entries(fields)) formData.append(k, v);
	return {
		request: new Request('http://localhost', { method: 'POST', body: formData }),
		params: { id: propertyId },
		locals: { user: { id: userId }, session: {} }
	} as any;
}

// --- Action tests ---

describe('equipment/new — action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.propertyFindFirst.mockResolvedValue(PROPERTY);
		mocks.generatePlan.mockResolvedValue(undefined);
	});

	it('returns 400 when name is empty', async () => {
		const result = await actions.default(makeEvent({ name: '', equipmentTypeId: 'et-1' }));
		expect(result).toMatchObject({ status: 400, data: { error: expect.any(String) } });
		expect(mocks.equipmentCreate).not.toHaveBeenCalled();
	});

	it('returns 400 when equipmentTypeId is empty', async () => {
		const result = await actions.default(makeEvent({ name: 'Main boiler', equipmentTypeId: '' }));
		expect(result).toMatchObject({ status: 400, data: { error: expect.any(String) } });
	});

	it('creates equipment, generates a plan, and redirects to the property page', async () => {
		const createdAt = new Date('2023-01-15');
		mocks.equipmentCreate.mockResolvedValueOnce({ id: 'eq-1', createdAt });
		await expect(
			actions.default(makeEvent({
				name: 'Main boiler',
				equipmentTypeId: 'et-1',
				brand: 'Viessmann',
				model: 'Vitodens 100',
				installedAt: '2023-01-15'
			}))
		).rejects.toMatchObject({ status: 302, location: '/app/properties/prop-1' });
		expect(mocks.equipmentCreate).toHaveBeenCalledWith({
			data: {
				propertyId: 'prop-1',
				equipmentTypeId: 'et-1',
				name: 'Main boiler',
				brand: 'Viessmann',
				model: 'Vitodens 100',
				installedAt: new Date('2023-01-15')
			}
		});
		expect(mocks.generatePlan).toHaveBeenCalledWith('eq-1', 'et-1', new Date('2023-01-15'));
	});

	it('falls back to createdAt for plan base date when installedAt is not provided', async () => {
		const createdAt = new Date('2024-06-01');
		mocks.equipmentCreate.mockResolvedValueOnce({ id: 'eq-2', createdAt });
		await expect(
			actions.default(makeEvent({ name: 'VMC', equipmentTypeId: 'et-2', brand: '', model: '' }))
		).rejects.toMatchObject({ status: 302 });
		expect(mocks.generatePlan).toHaveBeenCalledWith('eq-2', 'et-2', createdAt);
	});

	it('stores null for optional fields when blank', async () => {
		const createdAt = new Date();
		mocks.equipmentCreate.mockResolvedValueOnce({ id: 'eq-3', createdAt });
		await expect(
			actions.default(makeEvent({ name: 'VMC', equipmentTypeId: 'et-2', brand: '', model: '' }))
		).rejects.toMatchObject({ status: 302 });
		expect(mocks.equipmentCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ brand: null, model: null, installedAt: null })
			})
		);
	});

	it('trims whitespace from name', async () => {
		const createdAt = new Date();
		mocks.equipmentCreate.mockResolvedValueOnce({ id: 'eq-4', createdAt });
		await expect(
			actions.default(makeEvent({ name: '  Heat pump  ', equipmentTypeId: 'et-1' }))
		).rejects.toMatchObject({ status: 302 });
		expect(mocks.equipmentCreate).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ name: 'Heat pump' }) })
		);
	});
});

// --- UI tests ---

const EQUIPMENT_TYPES = [
	{ id: 'et-1', name: 'Gas boiler', category: 'Chauffage', createdAt: new Date(), updatedAt: new Date(), description: null, imageUrl: null },
	{ id: 'et-2', name: 'Heat recovery ventilation', category: 'Ventilation', createdAt: new Date(), updatedAt: new Date(), description: null, imageUrl: null }
];

const USER = { id: 'user-1', email: 'test@example.com', emailVerified: false, name: 'Test User', image: null, role: 'USER', createdAt: new Date(), updatedAt: new Date() };

describe('equipment/new — page', () => {
	it('renders form fields when equipment types are available', () => {
		render(Page, {
			props: {
				form: null,
				data: { user: USER, isAdmin: false, property: PROPERTY, equipmentTypes: EQUIPMENT_TYPES }
			}
		});
		expect(screen.getByLabelText(/type d'équipement/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/nom personnalisé/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/marque/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/modèle/i)).toBeInTheDocument();
	});

	it('shows empty catalogue message when no equipment types exist', () => {
		render(Page, {
			props: {
				form: null,
				data: { user: USER, isAdmin: false, property: PROPERTY, equipmentTypes: [] }
			}
		});
		expect(screen.getByText(/aucun type d'équipement/i)).toBeInTheDocument();
	});

	it('shows error message from action data', () => {
		render(Page, {
			props: {
				form: { error: 'Le nom est requis.', name: '', equipmentTypeId: '', brand: null, model: null },
				data: { user: USER, isAdmin: false, property: PROPERTY, equipmentTypes: EQUIPMENT_TYPES }
			}
		});
		expect(screen.getByText('Le nom est requis.')).toBeInTheDocument();
	});
});
