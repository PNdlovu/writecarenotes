-- Add witness requirement fields to Medication table
ALTER TABLE "Medication" ADD COLUMN "requiresWitness" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Medication" ADD COLUMN "isHighRisk" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Medication" ADD COLUMN "route" TEXT NOT NULL DEFAULT 'ORAL';

-- Create index for commonly queried fields
CREATE INDEX "idx_medication_witness_required" ON "Medication"("requiresWitness") WHERE "requiresWitness" = true;
CREATE INDEX "idx_medication_high_risk" ON "Medication"("isHighRisk") WHERE "isHighRisk" = true; 