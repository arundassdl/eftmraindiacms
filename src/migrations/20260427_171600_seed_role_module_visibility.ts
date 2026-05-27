import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import roleModuleVisibilitySeed from '../seeds/role-module-visibility.json'

type PermissionRow = {
  id: string
  module: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

type Role = 'editor' | 'manager' | 'admin'

const roles: Role[] = ['editor', 'manager', 'admin']

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`
}

function permissionValues(
  rows: PermissionRow[],
  parentId: number
) {
  return rows
    .map((row, index) => [
      index + 1,
      parentId,
      sqlString(row.id),
      sqlString(row.module),
      row.create,
      row.read,
      row.update,
      row.delete,
    ].join(', '))
    .map((value) => `(${value})`)
    .join(',\n')
}

async function ensureRoleModuleEnums(
  db: MigrateUpArgs['db']
) {
  await db.execute(`
    DO $$
    DECLARE
      enum_name text;
    BEGIN
      FOREACH enum_name IN ARRAY ARRAY[
        'enum_role_module_visibility_editor_permissions_module',
        'enum_role_module_visibility_manager_permissions_module',
        'enum_role_module_visibility_admin_permissions_module'
      ]
      LOOP
        IF EXISTS (
          SELECT 1 FROM pg_type WHERE typname = enum_name
        ) THEN
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'practitioner-contacts'
          );
        END IF;
      END LOOP;
    END $$;
  `)
}

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await ensureRoleModuleEnums(db)

  const seed = roleModuleVisibilitySeed as typeof roleModuleVisibilitySeed & {
    id: number
    updatedAt: string
    createdAt: string
    globalType: string
    editorPermissions: PermissionRow[]
    managerPermissions: PermissionRow[]
    adminPermissions: PermissionRow[]
  }

  await db.execute(`
    DELETE FROM "role_module_visibility_editor_permissions";
    DELETE FROM "role_module_visibility_manager_permissions";
    DELETE FROM "role_module_visibility_admin_permissions";
    DELETE FROM "role_module_visibility";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'role_module_visibility'
          AND column_name = 'global_type'
      ) THEN
        INSERT INTO "role_module_visibility"
          ("id", "updated_at", "created_at", "global_type")
        VALUES
          (
            ${seed.id},
            ${sqlString(seed.updatedAt)},
            ${sqlString(seed.createdAt)},
            ${sqlString(seed.globalType)}
          );
      ELSE
        INSERT INTO "role_module_visibility"
          ("id", "updated_at", "created_at")
        VALUES
          (
            ${seed.id},
            ${sqlString(seed.updatedAt)},
            ${sqlString(seed.createdAt)}
          );
      END IF;
    END $$;

    ${roles.map((role) => `
      INSERT INTO "role_module_visibility_${role}_permissions"
        ("_order", "_parent_id", "id", "module", "create", "read", "update", "delete")
      VALUES
        ${permissionValues(seed[`${role}Permissions`], seed.id)};
    `).join('\n')}
  `)

  payload.logger.info(
    'Seeded global: role-module-visibility'
  )
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "role_module_visibility_editor_permissions";
    DELETE FROM "role_module_visibility_manager_permissions";
    DELETE FROM "role_module_visibility_admin_permissions";
    DELETE FROM "role_module_visibility"
  `)

  payload.logger.info(
    'Rolled back global: role-module-visibility'
  )
}
