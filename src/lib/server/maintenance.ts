import { prisma } from './prisma';

export function getNextDueDate(baseDate: Date, intervalWeeks: number): Date {
	const intervalMs = intervalWeeks * 7 * 24 * 60 * 60 * 1000;
	const now = Date.now();
	let due = baseDate.getTime();
	while (due <= now) due += intervalMs;
	return new Date(due);
}

export async function generatePlan(
	equipmentId: string,
	equipmentTypeId: string,
	baseDate: Date
): Promise<void> {
	const rules = await prisma.maintenanceRule.findMany({ where: { equipmentTypeId } });
	if (!rules.length) return;

	const plan = await prisma.maintenancePlan.upsert({
		where: { equipmentId },
		update: {},
		create: { equipmentId }
	});

	for (const rule of rules) {
		await prisma.maintenanceTask.create({
			data: {
				planId: plan.id,
				ruleId: rule.id,
				title: rule.label,
				dueDate: getNextDueDate(baseDate, rule.intervalWeeks)
			}
		});
	}
}
