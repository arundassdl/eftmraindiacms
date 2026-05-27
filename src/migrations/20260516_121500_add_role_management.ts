import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

const moduleValues = [
  'pages',
  'posts',
  'categories',
  'media',
  'sites',
  'leads',
  'trainings',
  'training-registrations',
  'practitioners',
  'practitioner-contacts',
  'practitioner-registrations',
  'testimonials',
  'practitioner-reviews',
  'training-reviews',
  'gallery',
  'header',
  'footer',
  'role-management',
  'users',
]

const legacyRolePermissionEnums = [
  'enum_role_module_visibility_editor_permissions_module',
  'enum_role_module_visibility_manager_permissions_module',
  'enum_role_module_visibility_siteadmin_permissions_module',
  'enum_role_module_visibility_admin_permissions_module',
]

const builtinRoles = [
  { label: 'Editor', value: 'editor', sortOrder: 10 },
  { label: 'Manager', value: 'manager', sortOrder: 20 },
  { label: 'Site Admin', value: 'siteadmin', sortOrder: 30 },
  { label: 'Admin', value: 'admin', sortOrder: 40 },
  { label: 'Super Admin', value: 'superadmin', sortOrder: 50 },
]

const SUPERADMIN_EMAIL =
  process.env.CMS_SUPERADMIN_EMAIL ??
  process.env.CMS_ADMIN_EMAIL ??
  process.env.ADMIN_EMAIL
const SUPERADMIN_PASSWORD =
  process.env.CMS_SUPERADMIN_PASSWORD ??
  process.env.CMS_ADMIN_PASSWORD ??
  process.env.ADMIN_PASSWORD
const SUPERADMIN_NAME =
  process.env.CMS_SUPERADMIN_NAME ??
  process.env.CMS_ADMIN_NAME ??
  'Super Admin'

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`
}

async function ensureRoleModulePermissionEnum(db: MigrateUpArgs['db']) {
  await db.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'enum_role_module_visibility_role_permissions_module'
      ) THEN
        CREATE TYPE "enum_role_module_visibility_role_permissions_module" AS ENUM (
          ${moduleValues.map(sqlString).join(', ')}
        );
      END IF;
    END $$;
  `)

  await db.execute(`
    DO $$
    DECLARE
      enum_name text;
      module_value text;
    BEGIN
      FOREACH enum_name IN ARRAY ARRAY[
        'enum_role_module_visibility_role_permissions_module',
        ${legacyRolePermissionEnums.map(sqlString).join(',\n        ')}
      ]
      LOOP
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = enum_name) THEN
          FOREACH module_value IN ARRAY ARRAY[
            ${moduleValues.map(sqlString).join(',\n            ')}
          ]
          LOOP
            EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS %L', enum_name, module_value);
          END LOOP;
        END IF;
      END LOOP;
    END $$;
  `)
}

async function ensureRoleManagementSchema(db: MigrateUpArgs['db']) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "role_management" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "value" varchar NOT NULL,
      "active" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 100,
      "description" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `)

  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "role_management_value_idx" ON "role_management" USING btree ("value")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "role_management_updated_at_idx" ON "role_management" USING btree ("updated_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "role_management_created_at_idx" ON "role_management" USING btree ("created_at")`)

  await db.execute(`
    ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "role_selection_id" integer
  `)
  await db.execute(`
    ALTER TABLE "users"
      ALTER COLUMN "role" TYPE varchar
      USING "role"::text
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "users_role_selection_idx" ON "users" USING btree ("role_selection_id")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "role_management_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_role_management_id_idx" ON "payload_locked_documents_rels" USING btree ("role_management_id")`)
}

async function ensureRolePermissionsSchema(db: MigrateUpArgs['db']) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "role_module_visibility_role_permissions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "role" varchar NOT NULL,
      "module" "enum_role_module_visibility_role_permissions_module" NOT NULL,
      "create" boolean DEFAULT false,
      "read" boolean DEFAULT false,
      "update" boolean DEFAULT false,
      "delete" boolean DEFAULT false
    )
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS "role_module_visibility_role_permissions_order_idx" ON "role_module_visibility_role_permissions" USING btree ("_order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "role_module_visibility_role_permissions_parent_id_idx" ON "role_module_visibility_role_permissions" USING btree ("_parent_id")`)
}

async function seedBuiltinRoles(db: MigrateUpArgs['db']) {
  await db.execute(`
    INSERT INTO "role_management"
      ("label", "value", "active", "sort_order", "updated_at", "created_at")
    VALUES
      ${builtinRoles
        .map((role) => `(${sqlString(role.label)}, ${sqlString(role.value)}, true, ${role.sortOrder}, now(), now())`)
        .join(',\n      ')}
    ON CONFLICT ("value") DO UPDATE
    SET
      "label" = EXCLUDED."label",
      "active" = COALESCE("role_management"."active", EXCLUDED."active"),
      "sort_order" = EXCLUDED."sort_order",
      "updated_at" = now()
  `)
}

async function backfillUserRoleSelection(db: MigrateUpArgs['db']) {
  await db.execute(`
    UPDATE "users"
    SET "role_selection_id" = "role_management"."id"
    FROM "role_management"
    WHERE "users"."role"::text = "role_management"."value"
      AND "users"."role_selection_id" IS NULL
  `)
}

async function backfillGenericRolePermissions(db: MigrateUpArgs['db']) {
  await db.execute(`
    DO $$
    DECLARE
      role_name text;
      permission_table_name text;
    BEGIN
      FOREACH role_name IN ARRAY ARRAY['editor', 'manager', 'siteadmin', 'admin']
      LOOP
        permission_table_name := 'role_module_visibility_' || role_name || '_permissions';

        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = permission_table_name
        ) THEN
          EXECUTE format(
            'INSERT INTO "role_module_visibility_role_permissions"
              ("_order", "_parent_id", "id", "role", "module", "create", "read", "update", "delete")
            SELECT
              "_order",
              "_parent_id",
              %L || %L || "id",
              %L,
              "module"::text::"enum_role_module_visibility_role_permissions_module",
              "create",
              "read",
              "update",
              "delete"
            FROM %I
            ON CONFLICT ("id") DO NOTHING',
            role_name,
            '-',
            role_name,
            permission_table_name
          );
        END IF;
      END LOOP;
    END $$;
  `)
}

async function seedSuperAdminPermissions(db: MigrateUpArgs['db']) {
  await db.execute(`
    INSERT INTO "role_module_visibility_role_permissions"
      ("_order", "_parent_id", "id", "role", "module", "create", "read", "update", "delete")
    SELECT
      module_row."_order",
      role_module_visibility."id",
      'superadmin-' || module_row."module",
      'superadmin',
      module_row."module"::"enum_role_module_visibility_role_permissions_module",
      true,
      true,
      true,
      true
    FROM "role_module_visibility"
    CROSS JOIN (
      SELECT
        row_number() OVER () AS "_order",
        module_value AS "module"
      FROM unnest(ARRAY[
        ${moduleValues.map(sqlString).join(',\n        ')}
      ]) AS module_value
    ) AS module_row
    ON CONFLICT ("id") DO UPDATE
    SET
      "create" = true,
      "read" = true,
      "update" = true,
      "delete" = true
  `)
}

async function ensureSuperAdminUser({
  db,
  payload,
  req,
}: MigrateUpArgs) {
  if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
    throw new Error(
      'Missing superadmin credentials. Set CMS_SUPERADMIN_EMAIL and CMS_SUPERADMIN_PASSWORD, or CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD, before running this migration.'
    )
  }

  const roleResult = await db.execute(`
    SELECT "id" FROM "role_management"
    WHERE "value" = 'superadmin'
    LIMIT 1
  `)
  const roleSelectionId = Number(roleResult.rows?.[0]?.id)

  if (!roleSelectionId) {
    throw new Error('Could not resolve the seeded superadmin role.')
  }

  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: SUPERADMIN_EMAIL,
      },
    },
    limit: 1,
    req,
    overrideAccess: true,
  })

  const data = {
    email: SUPERADMIN_EMAIL,
    name: SUPERADMIN_NAME,
    password: SUPERADMIN_PASSWORD,
    role: 'superadmin',
    roleSelection: roleSelectionId,
  } as never

  if (existingUsers.docs[0]) {
    await payload.update({
      collection: 'users',
      context: {
        skipRoleSelectionResolve: true,
      },
      id: existingUsers.docs[0].id,
      data,
      req,
      overrideAccess: true,
    })
    return
  }

  await payload.create({
    collection: 'users',
    context: {
      skipRoleSelectionResolve: true,
    },
    data,
    req,
    overrideAccess: true,
  })
}

export async function up({
  db,
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  await ensureRoleModulePermissionEnum(db)
  await ensureRoleManagementSchema(db)
  await ensureRolePermissionsSchema(db)
  await seedBuiltinRoles(db)
  await backfillUserRoleSelection(db)
  await backfillGenericRolePermissions(db)
  await seedSuperAdminPermissions(db)
  await ensureSuperAdminUser({ db, payload, req })

  payload.logger.info(
    'Added role-management schema, full superadmin permissions, and default superadmin user.'
  )
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DROP TABLE IF EXISTS "role_module_visibility_role_permissions";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "role_management_id";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "role_selection_id";
    DROP TABLE IF EXISTS "role_management";
    DROP TYPE IF EXISTS "enum_role_module_visibility_role_permissions_module";
  `)

  payload.logger.info(
    'Rolled back role-management schema.'
  )
}
