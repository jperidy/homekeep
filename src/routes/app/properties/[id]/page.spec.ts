import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
	propertyFindFirst: vi.fn(),
	taskFindMany: vi.fn(),
	taskFindFirst: vi.fn(),
	taskUpdate: vi.fn(),
	taskCreate: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
	prisma: {
		property: { findFirst: mocks.propertyFindFirst },
		maintenanceTask: {
			findMany: mocks.taskFindMany,
			findFirst: mocks.taskFindFirst,
			update: mocks.taskUpdate,
			create: mocks.taskCreate
		}
	}
}));

import { load, actions } from './+page.server';

const PROPERTY = { id: 'prop-1', name: 'My flat', userId: 'user-1', equipments: [] };

function makeLoadEvent(propertyId = 'prop-1', userId = 'user-1') {
	return {
		params: { id: propertyId },
		locals: { user: { id: userId }, session: {} }
	} as any;
}

function makeActionEvent(fields: Record<string, string>, propertyId = 'prop-1', userId = 'user-1') {
	const formData = new FormData();
	for (const [k, v] of Object.entries(fields)) formData.append(k, v);
	return {
		request: new Request('http://localhost', { method: 'POST', body: formData }),
		params: { id: propertyId },
		locals: { user: { id: userId }, session: {} }
	} as any;
}

// --- Load ---

describe('properties/[id] — load', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns the property and pending tasks', async () => {
		mocks.propertyFindFirst.mockResolvedValueOnce(PROPERTY);
		mocks.taskFindMany.mockResolvedValueOnce([]);
		const result = await load(makeLoadEvent());
		expect(result.property).toEqual(PROPERTY);
		expect(result.tasks).toEqual([]);
	});

	it('throws 404 when the property does not exist', async () => {
		mocks.propertyFindFirst.mockResolvedValueOnce(null);
		await expect(load(makeLoadEvent('unknown'))).rejects.toMatchObject({ status: 404 });
	});

	it('queries only incomplete tasks belonging to the property', async () => {
		mocks.propertyFindFirst.mockResolvedValueOnce(PROPERTY);
		mocks.taskFindMany.mockResolvedValueOnce([]);
		await load(makeLoadEvent());
		expect(mocks.taskFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					completedAt: null,
					plan: { equipment: { propertyId: 'prop-1' } }
				}
			})
		);
	});

	it('orders tasks by dueDate ascending', async () => {
		mocks.propertyFindFirst.mockResolvedValueOnce(PROPERTY);
		mocks.taskFindMany.mockResolvedValueOnce([]);
		await load(makeLoadEvent());
		expect(mocks.taskFindMany).toHaveBeenCalledWith(
			expect.objectContaining({ orderBy: { dueDate: 'asc' } })
		);
	});
});

// --- completeTask action ---

describe('properties/[id] — completeTask', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns 400 when taskId is missing', async () => {
		mocks.propertyFindFirst.mockResolvedValueOnce(PROPERTY);
		const result = await actions.completeTask(makeActionEvent({}));
		expect(result).toMatchObject({ status: 400 });
		expect(mocks.taskUpdate).not.toHaveBeenCalled();
	});

	it('marks the task as completed and creates the next occurrence', async () => {
		mocks.propertyFindFirst.mockResolvedValueOnce(PROPERTY);
		mocks.taskFindFirst.mockResolvedValueOnce({
			id: 'task-1',
			planId: 'plan-1',
			ruleId: 'rule-1',
			title: 'Annual check',
			rule: { id: 'rule-1', intervalWeeks: 52 }
		});
		mocks.taskUpdate.mockResolvedValueOnce({});
		mocks.taskCreate.mockResolvedValueOnce({});

		const result = await actions.completeTask(makeActionEvent({ taskId: 'task-1' }));

		expect(result).toEqual({});
		expect(mocks.taskUpdate).toHaveBeenCalledWith({
			where: { id: 'task-1' },
			data: { completedAt: expect.any(Date) }
		});
		expect(mocks.taskCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					planId: 'plan-1',
					ruleId: 'rule-1',
					title: 'Annual check',
					dueDate: expect.any(Date)
				})
			})
		);
		const nextDue: Date = mocks.taskCreate.mock.calls[0][0].data.dueDate;
		expect(nextDue.getTime()).toBeGreaterThan(Date.now());
	});

	it('marks the task done without creating a next occurrence when there is no rule', async () => {
		mocks.propertyFindFirst.mockResolvedValueOnce(PROPERTY);
		mocks.taskFindFirst.mockResolvedValueOnce({
			id: 'task-2',
			planId: 'plan-1',
			ruleId: null,
			title: 'One-time check',
			rule: null
		});
		mocks.taskUpdate.mockResolvedValueOnce({});

		await actions.completeTask(makeActionEvent({ taskId: 'task-2' }));

		expect(mocks.taskUpdate).toHaveBeenCalledTimes(1);
		expect(mocks.taskCreate).not.toHaveBeenCalled();
	});

	it('returns 404 when the task does not belong to this property', async () => {
		mocks.propertyFindFirst.mockResolvedValueOnce(PROPERTY);
		mocks.taskFindFirst.mockResolvedValueOnce(null);
		const result = await actions.completeTask(makeActionEvent({ taskId: 'nonexistent' }));
		expect(result).toMatchObject({ status: 404 });
	});
});
