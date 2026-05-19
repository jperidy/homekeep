import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNextDueDate } from './maintenance';

const mocks = vi.hoisted(() => ({
	rulesFindMany: vi.fn(),
	planUpsert: vi.fn(),
	taskCreate: vi.fn()
}));

vi.mock('./prisma', () => ({
	prisma: {
		maintenanceRule: { findMany: mocks.rulesFindMany },
		maintenancePlan: { upsert: mocks.planUpsert },
		maintenanceTask: { create: mocks.taskCreate }
	}
}));

import { generatePlan } from './maintenance';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

describe('getNextDueDate', () => {
	it('returns a date in the future', () => {
		const base = new Date(Date.now() - WEEK_MS);
		const result = getNextDueDate(base, 1);
		expect(result.getTime()).toBeGreaterThan(Date.now());
	});

	it('skips past cycles and returns the next future occurrence', () => {
		const base = new Date(Date.now() - 3 * WEEK_MS);
		const result = getNextDueDate(base, 2);
		expect(result.getTime()).toBeGreaterThan(Date.now());
		expect(result.getTime()).toBeLessThan(Date.now() + 2 * WEEK_MS + 1000);
	});

	it('handles a base far in the past (skips many cycles)', () => {
		const base = new Date(Date.now() - 200 * WEEK_MS);
		const result = getNextDueDate(base, 52);
		expect(result.getTime()).toBeGreaterThan(Date.now());
		expect(result.getTime()).toBeLessThan(Date.now() + 52 * WEEK_MS + 1000);
	});

	it('advances by exactly one interval from a recent base', () => {
		const intervalMs = 4 * WEEK_MS;
		const base = new Date(Date.now() - intervalMs / 2);
		const result = getNextDueDate(base, 4);
		const expected = base.getTime() + intervalMs;
		expect(Math.abs(result.getTime() - expected)).toBeLessThan(1000);
	});
});

describe('generatePlan', () => {
	beforeEach(() => vi.clearAllMocks());

	it('creates a plan and one task per rule', async () => {
		mocks.rulesFindMany.mockResolvedValueOnce([
			{ id: 'rule-1', label: 'Annual check', intervalWeeks: 52 },
			{ id: 'rule-2', label: 'Filter change', intervalWeeks: 4 }
		]);
		mocks.planUpsert.mockResolvedValueOnce({ id: 'plan-1' });
		mocks.taskCreate.mockResolvedValue({ id: 'task-x' });

		const base = new Date(Date.now() - WEEK_MS);
		await generatePlan('eq-1', 'et-1', base);

		expect(mocks.planUpsert).toHaveBeenCalledWith({
			where: { equipmentId: 'eq-1' },
			update: {},
			create: { equipmentId: 'eq-1' }
		});
		expect(mocks.taskCreate).toHaveBeenCalledTimes(2);
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
	});

	it('does nothing when there are no rules', async () => {
		mocks.rulesFindMany.mockResolvedValueOnce([]);
		await generatePlan('eq-1', 'et-1', new Date());
		expect(mocks.planUpsert).not.toHaveBeenCalled();
		expect(mocks.taskCreate).not.toHaveBeenCalled();
	});

	it('creates tasks with due dates in the future', async () => {
		mocks.rulesFindMany.mockResolvedValueOnce([
			{ id: 'rule-1', label: 'Check', intervalWeeks: 52 }
		]);
		mocks.planUpsert.mockResolvedValueOnce({ id: 'plan-1' });
		mocks.taskCreate.mockResolvedValueOnce({ id: 'task-1' });

		await generatePlan('eq-1', 'et-1', new Date(Date.now() - 10 * WEEK_MS));

		const createdTask = mocks.taskCreate.mock.calls[0][0];
		expect(createdTask.data.dueDate.getTime()).toBeGreaterThan(Date.now());
	});
});
