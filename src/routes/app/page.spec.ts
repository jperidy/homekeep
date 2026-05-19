import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
	propertyFindMany: vi.fn(),
	taskCount: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
	prisma: {
		property: { findMany: mocks.propertyFindMany },
		maintenanceTask: { count: mocks.taskCount }
	}
}));

import { load } from './+page.server';

function makeEvent(userId = 'user-1') {
	return {
		locals: { user: { id: userId }, session: {} }
	} as any;
}

describe('/app dashboard — load', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns an empty property list and zero equipment count', async () => {
		mocks.propertyFindMany.mockResolvedValueOnce([]);
		mocks.taskCount.mockResolvedValueOnce(0);
		const result = await load(makeEvent());
		expect(result.properties).toEqual([]);
		expect(result.equipmentCount).toBe(0);
		expect(result.pendingTaskCount).toBe(0);
	});

	it('sums equipment counts across all properties', async () => {
		mocks.propertyFindMany.mockResolvedValueOnce([
			{ id: 'p-1', name: 'Apartment', _count: { equipments: 3 } },
			{ id: 'p-2', name: 'House',     _count: { equipments: 5 } }
		]);
		mocks.taskCount.mockResolvedValueOnce(0);
		const result = await load(makeEvent());
		expect(result.equipmentCount).toBe(8);
		expect(result.properties).toHaveLength(2);
	});

	it('returns the correct number of pending tasks', async () => {
		mocks.propertyFindMany.mockResolvedValueOnce([]);
		mocks.taskCount.mockResolvedValueOnce(7);
		const result = await load(makeEvent());
		expect(result.pendingTaskCount).toBe(7);
	});

	it('queries only properties belonging to the current user', async () => {
		mocks.propertyFindMany.mockResolvedValueOnce([]);
		mocks.taskCount.mockResolvedValueOnce(0);
		await load(makeEvent('user-42'));
		expect(mocks.propertyFindMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { userId: 'user-42' } })
		);
	});

	it('counts only incomplete tasks for the current user', async () => {
		mocks.propertyFindMany.mockResolvedValueOnce([]);
		mocks.taskCount.mockResolvedValueOnce(0);
		await load(makeEvent('user-42'));
		expect(mocks.taskCount).toHaveBeenCalledWith({
			where: {
				completedAt: null,
				plan: { equipment: { property: { userId: 'user-42' } } }
			}
		});
	});

	it('includes _count.equipments in the property query', async () => {
		mocks.propertyFindMany.mockResolvedValueOnce([]);
		mocks.taskCount.mockResolvedValueOnce(0);
		await load(makeEvent());
		expect(mocks.propertyFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				include: { _count: { select: { equipments: true } } }
			})
		);
	});
});
