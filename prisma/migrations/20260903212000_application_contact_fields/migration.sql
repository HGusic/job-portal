-- AlterTable
ALTER TABLE "applications" ADD COLUMN "first_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "applications" ADD COLUMN "middle_name" TEXT;
ALTER TABLE "applications" ADD COLUMN "last_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "applications" ADD COLUMN "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "applications" ADD COLUMN "zip_code" TEXT NOT NULL DEFAULT '';
ALTER TABLE "applications" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';

-- Migrate existing full names into first/last as best-effort
UPDATE "applications"
SET
  "first_name" = split_part("full_name", ' ', 1),
  "last_name" = CASE
    WHEN position(' ' in "full_name") > 0 THEN regexp_replace("full_name", '^[^ ]+ ', '')
    ELSE "full_name"
  END,
  "phone" = COALESCE("phone", '');

ALTER TABLE "applications" ALTER COLUMN "phone" SET NOT NULL;
ALTER TABLE "applications" ALTER COLUMN "first_name" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "last_name" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "address" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "zip_code" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "state" DROP DEFAULT;

ALTER TABLE "applications" DROP COLUMN "full_name";
