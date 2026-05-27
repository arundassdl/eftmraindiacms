import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await db.execute(`
    WITH target_trainers AS (
      SELECT "id"
      FROM "trainers"
      WHERE "slug" = 'rafeeq-cherusseri'
        OR lower("name") = 'rafeeq cherusseri'
    )
    DELETE FROM "trainers_about_paragraphs"
    WHERE "_parent_id" IN (SELECT "id" FROM target_trainers);

    WITH target_trainers AS (
      SELECT "id"
      FROM "trainers"
      WHERE "slug" = 'rafeeq-cherusseri'
        OR lower("name") = 'rafeeq cherusseri'
    )
    DELETE FROM "trainers_credentials"
    WHERE "_parent_id" IN (SELECT "id" FROM target_trainers);

    WITH target_trainers AS (
      SELECT "id"
      FROM "trainers"
      WHERE "slug" = 'rafeeq-cherusseri'
        OR lower("name") = 'rafeeq cherusseri'
    )
    DELETE FROM "trainers_specializations"
    WHERE "_parent_id" IN (SELECT "id" FROM target_trainers);

    WITH target_trainers AS (
      SELECT "id"
      FROM "trainers"
      WHERE "slug" = 'rafeeq-cherusseri'
        OR lower("name") = 'rafeeq cherusseri'
    )
    DELETE FROM "trainers_social_links"
    WHERE "_parent_id" IN (SELECT "id" FROM target_trainers);

    DELETE FROM "payload_locked_documents_rels"
    WHERE "trainers_id" IN (
      SELECT "id"
      FROM "trainers"
      WHERE "slug" = 'rafeeq-cherusseri'
        OR lower("name") = 'rafeeq cherusseri'
    );

    DELETE FROM "trainers"
    WHERE "slug" = 'rafeeq-cherusseri'
      OR lower("name") = 'rafeeq cherusseri';
  `)

  payload.logger.info('Removed Rafeeq Cherusseri from trainers.')
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Removed trainer content is intentionally not recreated automatically.
}
