-- Add unique constraint on maintenance_plan.equipment_id (one plan per equipment)
ALTER TABLE "maintenance_plan" ADD CONSTRAINT "maintenance_plan_equipment_id_key" UNIQUE ("equipment_id");

-- Add rule_id column to maintenance_task
ALTER TABLE "maintenance_task" ADD COLUMN "rule_id" TEXT;

-- Add FK: maintenance_task.rule_id -> maintenance_rule.id (SET NULL on delete)
ALTER TABLE "maintenance_task" ADD CONSTRAINT "maintenance_task_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "maintenance_rule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
