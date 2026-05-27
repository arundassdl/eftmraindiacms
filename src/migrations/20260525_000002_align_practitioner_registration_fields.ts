import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE "practitioner_registrations"
      ADD COLUMN IF NOT EXISTS "prerequisite_l12_membership_number" varchar,
      ADD COLUMN IF NOT EXISTS "prerequisite_l12_certification_year" varchar,
      ADD COLUMN IF NOT EXISTS "prerequisite_l12_certificate_file_name" varchar,
      ADD COLUMN IF NOT EXISTS "prerequisite_l3_membership_number" varchar,
      ADD COLUMN IF NOT EXISTS "prerequisite_l3_certification_year" varchar,
      ADD COLUMN IF NOT EXISTS "prerequisite_l3_certificate_file_name" varchar,
      ADD COLUMN IF NOT EXISTS "timezone" varchar
  `)

  payload.logger.info('Aligned practitioner registration database fields with the frontend form.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE "practitioner_registrations"
      DROP COLUMN IF EXISTS "timezone",
      DROP COLUMN IF EXISTS "prerequisite_l3_certificate_file_name",
      DROP COLUMN IF EXISTS "prerequisite_l3_certification_year",
      DROP COLUMN IF EXISTS "prerequisite_l3_membership_number",
      DROP COLUMN IF EXISTS "prerequisite_l12_certificate_file_name",
      DROP COLUMN IF EXISTS "prerequisite_l12_certification_year",
      DROP COLUMN IF EXISTS "prerequisite_l12_membership_number"
  `)

  payload.logger.info('Rolled back practitioner registration field alignment.')
}

