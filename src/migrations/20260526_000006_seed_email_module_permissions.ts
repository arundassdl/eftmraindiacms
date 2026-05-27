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
          module_row."_order" + role_row."_order",
          role_module_visibility."id",
          role_row."role" || '-' || module_row."module",
          role_row."role",
          module_row."module"::"enum_role_module_visibility_role_permissions_module",
          role_row."can_write",
          true,
          role_row."can_write",
          role_row."can_delete"
        FROM "role_module_visibility"
        CROSS JOIN (
          SELECT * FROM (
            VALUES
              (1020, 'email-templates'),
              (1030, 'email-accounts')
          ) AS modules("_order", "module")
        ) AS module_row
        CROSS JOIN (
          SELECT * FROM (
            VALUES
              (1, 'manager', true, false),
              (2, 'siteadmin', true, false),
              (3, 'admin', true, true),
              (4, 'superadmin', true, true)
          ) AS roles("_order", "role", "can_write", "can_delete")
        ) AS role_row
        ON CONFLICT ("id") DO UPDATE
        SET
          "create" = EXCLUDED."create",
          "read" = true,
          "update" = EXCLUDED."update",
          "delete" = EXCLUDED."delete";
      END IF;
    END $$;
  `)

  payload.logger.info('Seeded email module role permission rows.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "role_module_visibility_role_permissions"
    WHERE "module"::text IN ('email-templates', 'email-accounts')
  `)

  payload.logger.info('Rolled back email module role permission rows.')
}
