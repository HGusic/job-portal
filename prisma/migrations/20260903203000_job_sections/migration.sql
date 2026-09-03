-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "location" TEXT NOT NULL DEFAULT '';
ALTER TABLE "jobs" ADD COLUMN "job_summary" TEXT NOT NULL DEFAULT '';
ALTER TABLE "jobs" ADD COLUMN "responsibilities" TEXT NOT NULL DEFAULT '';
ALTER TABLE "jobs" ADD COLUMN "required_qualifications" TEXT NOT NULL DEFAULT '';
ALTER TABLE "jobs" ADD COLUMN "preferred_qualifications" TEXT NOT NULL DEFAULT '';
ALTER TABLE "jobs" ADD COLUMN "include_title" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "jobs" ADD COLUMN "include_location" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "jobs" ADD COLUMN "include_job_summary" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "jobs" ADD COLUMN "include_responsibilities" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "jobs" ADD COLUMN "include_required_qualifications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "jobs" ADD COLUMN "include_preferred_qualifications" BOOLEAN NOT NULL DEFAULT true;

-- Migrate existing content
UPDATE "jobs" SET "job_summary" = "description", "required_qualifications" = "requirements";

-- Drop old columns
ALTER TABLE "jobs" DROP COLUMN "description";
ALTER TABLE "jobs" DROP COLUMN "requirements";

-- Allow empty title
ALTER TABLE "jobs" ALTER COLUMN "title" SET DEFAULT '';
