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
      ADD COLUMN IF NOT EXISTS "profile_photo_id" integer,
      ADD COLUMN IF NOT EXISTS "certificate_file_id" integer,
      ADD COLUMN IF NOT EXISTS "prerequisite_l12_certificate_file_id" integer,
      ADD COLUMN IF NOT EXISTS "prerequisite_l3_certificate_file_id" integer
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registrations_profile_photo_idx" ON "practitioner_registrations" USING btree ("profile_photo_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registrations_certificate_file_idx" ON "practitioner_registrations" USING btree ("certificate_file_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registrations_prerequisite_l12_certificate_file_idx" ON "practitioner_registrations" USING btree ("prerequisite_l12_certificate_file_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registrations_prerequisite_l3_certificate_file_idx" ON "practitioner_registrations" USING btree ("prerequisite_l3_certificate_file_id")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "practitioner_registrations_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_practitioner_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioner_registrations_id")`)

  payload.logger.info('Added practitioner registration upload fields.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`DROP INDEX IF EXISTS "practitioner_registrations_prerequisite_l3_certificate_file_idx"`)
  await db.execute(`DROP INDEX IF EXISTS "practitioner_registrations_prerequisite_l12_certificate_file_idx"`)
  await db.execute(`DROP INDEX IF EXISTS "practitioner_registrations_certificate_file_idx"`)
  await db.execute(`DROP INDEX IF EXISTS "practitioner_registrations_profile_photo_idx"`)

  await db.execute(`
    ALTER TABLE "practitioner_registrations"
      DROP COLUMN IF EXISTS "prerequisite_l3_certificate_file_id",
      DROP COLUMN IF EXISTS "prerequisite_l12_certificate_file_id",
      DROP COLUMN IF EXISTS "certificate_file_id",
      DROP COLUMN IF EXISTS "profile_photo_id"
  `)

  payload.logger.info('Rolled back practitioner registration upload fields.')
}

