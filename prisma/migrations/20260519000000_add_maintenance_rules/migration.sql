-- CreateTable
CREATE TABLE "maintenance_rule" (
    "id" TEXT NOT NULL,
    "equipment_type_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "interval_weeks" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_rule_equipment_type_id_label_key" ON "maintenance_rule"("equipment_type_id", "label");

-- AddForeignKey
ALTER TABLE "maintenance_rule" ADD CONSTRAINT "maintenance_rule_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;
