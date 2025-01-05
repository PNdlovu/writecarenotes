-- Add PIN security fields to Staff table
ALTER TABLE "Staff" ADD COLUMN "pinExpiryDate" TIMESTAMP(3);
ALTER TABLE "Staff" ADD COLUMN "failedAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Staff" ADD COLUMN "accountLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Staff" ADD COLUMN "temporaryPin" BOOLEAN NOT NULL DEFAULT false;

-- Create VerificationLog table
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- Create WitnessSession table
CREATE TABLE "WitnessSession" (
    "id" TEXT NOT NULL,
    "witnessId" TEXT NOT NULL,
    "administratorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "WitnessSession_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_staffId_fkey"
    FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WitnessSession" ADD CONSTRAINT "WitnessSession_witnessId_fkey"
    FOREIGN KEY ("witnessId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WitnessSession" ADD CONSTRAINT "WitnessSession_administratorId_fkey"
    FOREIGN KEY ("administratorId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "idx_verification_log_staff" ON "VerificationLog"("staffId");
CREATE INDEX "idx_verification_log_timestamp" ON "VerificationLog"("timestamp");
CREATE INDEX "idx_witness_session_witness" ON "WitnessSession"("witnessId");
CREATE INDEX "idx_witness_session_admin" ON "WitnessSession"("administratorId");
CREATE INDEX "idx_witness_session_active" ON "WitnessSession"("witnessId") WHERE "endTime" IS NULL; 