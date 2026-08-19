-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'DISCHARGED');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "plannedSessions" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE';
