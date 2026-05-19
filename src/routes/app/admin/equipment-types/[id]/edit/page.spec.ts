import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions, load } from './+page.server';

const mocks = vi.hoisted(() => ({
	findUnique: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	ruleCreate: vi.fn(),
	ruleDeleteMany: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
	prisma: {
		equipmentType: {
			findUnique: mocks.findUnique,
			update: mocks.update,
			delete: mocks.delete
		},
		maintenanceRule: {
			create: mocks.ruleCreate,
			deleteMany: mocks.ruleDeleteMany
		}
	}
}));

function makeEvent(fields: Record<string, string> = {}, id = 'et-1') {
	const formData = new FormData();
	for (const [k, v] of Object.entries(fields)) formData.append(k, v);
	return {
		request: new Request('http://localhost', { method: 'POST', body: formData }),
		params: { id },
		locals: {}
	} as any;
}

// --- Load ---

describe('equipment-types/edit — load', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns the equipment type with its rules', async () => {
		const type = { id: 'et-1', name: 'Gas boiler', maintenanceRules: [] };
		mocks.findUnique.mockResolvedValueOnce(type);
		const result = await load({ params: { id: 'et-1' } } as any);
		expect(result.type).toEqual(type);
		expect(mocks.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: 'et-1' },
				include: { maintenanceRules: expect.any(Object) }
			})
		);
	});

	it('throws 404 when the type does not exist', async () => {
		mocks.findUnique.mockResolvedValueOnce(null);
		await expect(load({ params: { id: 'et-x' } } as any)).rejects.toMatchObject({ status: 404 });
	});
});

// --- Update action ---

describe('equipment-types/edit — update action', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns 400 when name is empty', async () => {
		const result = await actions.update(makeEvent({ name: '', category: 'Chauffage' }));
		expect(result).toMatchObject({ status: 400 });
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it('returns 400 when category is empty', async () => {
		const result = await actions.update(makeEvent({ name: 'Boiler', category: '' }));
		expect(result).toMatchObject({ status: 400 });
	});

	it('updates the equipment type and redirects', async () => {
		mocks.update.mockResolvedValueOnce({ id: 'et-1' });
		await expect(
			actions.update(makeEvent({ name: 'Gas boiler', category: 'Chauffage', description: 'Desc' }))
		).rejects.toMatchObject({ status: 302, location: '/app/admin/equipment-types' });
		expect(mocks.update).toHaveBeenCalledWith({
			where: { id: 'et-1' },
			data: { name: 'Gas boiler', category: 'Chauffage', description: 'Desc' }
		});
	});

	it('returns 409 on a unique constraint violation', async () => {
		mocks.update.mockRejectedValueOnce({ code: 'P2002' });
		const result = await actions.update(makeEvent({ name: 'X', category: 'Y' }));
		expect(result).toMatchObject({ status: 409 });
	});
});

// --- Delete action ---

describe('equipment-types/edit — delete action', () => {
	beforeEach(() => vi.clearAllMocks());

	it('deletes the equipment type and redirects', async () => {
		mocks.delete.mockResolvedValueOnce({ id: 'et-1' });
		await expect(
			actions.delete(makeEvent({}, 'et-1'))
		).rejects.toMatchObject({ status: 302, location: '/app/admin/equipment-types' });
		expect(mocks.delete).toHaveBeenCalledWith({ where: { id: 'et-1' } });
	});

	it('returns 400 when the type is in use (FK constraint)', async () => {
		mocks.delete.mockRejectedValueOnce({ code: 'P2003' });
		const result = await actions.delete(makeEvent({}, 'et-1'));
		expect(result).toMatchObject({ status: 400, data: { deleteError: expect.any(String) } });
	});
});

// --- addRule action ---

describe('equipment-types/edit — addRule action', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns 400 when label is empty', async () => {
		const result = await actions.addRule(makeEvent({ label: '', intervalWeeks: '52' }));
		expect(result).toMatchObject({ status: 400, data: { ruleError: expect.any(String) } });
		expect(mocks.ruleCreate).not.toHaveBeenCalled();
	});

	it('returns 400 when intervalWeeks is zero', async () => {
		const result = await actions.addRule(makeEvent({ label: 'Annual check', intervalWeeks: '0' }));
		expect(result).toMatchObject({ status: 400, data: { ruleError: expect.any(String) } });
	});

	it('returns 400 when intervalWeeks is negative', async () => {
		const result = await actions.addRule(makeEvent({ label: 'Annual check', intervalWeeks: '-1' }));
		expect(result).toMatchObject({ status: 400 });
	});

	it('creates the rule and redirects back to the edit page', async () => {
		mocks.ruleCreate.mockResolvedValueOnce({ id: 'rule-1' });
		await expect(
			actions.addRule(makeEvent({ label: 'Annual check', intervalWeeks: '52', description: 'Yearly' }, 'et-1'))
		).rejects.toMatchObject({ status: 302, location: '/app/admin/equipment-types/et-1/edit' });
		expect(mocks.ruleCreate).toHaveBeenCalledWith({
			data: { equipmentTypeId: 'et-1', label: 'Annual check', intervalWeeks: 52, description: 'Yearly' }
		});
	});

	it('stores null when description is blank', async () => {
		mocks.ruleCreate.mockResolvedValueOnce({ id: 'rule-2' });
		await expect(
			actions.addRule(makeEvent({ label: 'Filter change', intervalWeeks: '4', description: '' }))
		).rejects.toMatchObject({ status: 302 });
		expect(mocks.ruleCreate).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ description: null }) })
		);
	});

	it('returns 409 on a duplicate label for the same type', async () => {
		mocks.ruleCreate.mockRejectedValueOnce({ code: 'P2002' });
		const result = await actions.addRule(makeEvent({ label: 'Annual check', intervalWeeks: '52' }));
		expect(result).toMatchObject({ status: 409, data: { ruleError: expect.any(String) } });
	});
});

// --- deleteRule action ---

describe('equipment-types/edit — deleteRule action', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns 400 when ruleId is missing', async () => {
		const result = await actions.deleteRule(makeEvent({}));
		expect(result).toMatchObject({ status: 400 });
		expect(mocks.ruleDeleteMany).not.toHaveBeenCalled();
	});

	it('deletes the rule and redirects back to the edit page', async () => {
		mocks.ruleDeleteMany.mockResolvedValueOnce({ count: 1 });
		await expect(
			actions.deleteRule(makeEvent({ ruleId: 'rule-1' }, 'et-1'))
		).rejects.toMatchObject({ status: 302, location: '/app/admin/equipment-types/et-1/edit' });
		expect(mocks.ruleDeleteMany).toHaveBeenCalledWith({
			where: { id: 'rule-1', equipmentTypeId: 'et-1' }
		});
	});
});
