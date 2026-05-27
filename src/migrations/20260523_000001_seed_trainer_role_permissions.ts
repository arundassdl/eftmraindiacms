import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await db.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'role_module_visibility_role_permissions'
      ) THEN
        INSERT INTO "role_module_visibility_role_permissions"
          ("_order", "_parent_id", "id", "role", "module", "create", "read", "update", "delete")
        SELECT
          1000 + role_row."_order",
          role_module_visibility."id",
          role_row."role" || '-trainers',
          role_row."role",
          'trainers'::"enum_role_module_visibility_role_permissions_module",
          role_row."can_mutate",
          true,
          role_row."can_mutate",
          role_row."can_delete"
        FROM "role_module_visibility"
        CROSS JOIN (
          SELECT * FROM (
            VALUES
              (1, 'manager', true, false),
              (2, 'siteadmin', true, false),
              (3, 'admin', true, true),
              (4, 'superadmin', true, true)
          ) AS roles("_order", "role", "can_mutate", "can_delete")
        ) AS role_row
        ON CONFLICT ("id") DO UPDATE
        SET
          "read" = true,
          "create" = EXCLUDED."create",
          "update" = EXCLUDED."update",
          "delete" = EXCLUDED."delete";
      END IF;
    END $$;
  `)

  payload.logger.info('Seeded trainer role permission rows.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'role_module_visibility_role_permissions'
      ) THEN
        DELETE FROM "role_module_visibility_role_permissions"
        WHERE "module"::text = 'trainers';
      END IF;
    END $$;
  `)

  payload.logger.info('Rolled back trainer role permission rows.')
}
