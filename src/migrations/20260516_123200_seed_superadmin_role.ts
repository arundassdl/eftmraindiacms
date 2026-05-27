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

async function ensureUserRoleColumnIsText(db: MigrateUpArgs['db']) {
  await db.execute(`
    ALTER TABLE "users"
      ALTER COLUMN "role" TYPE varchar
      USING "role"::text
  `)
}

async function ensureSuperAdminRole(db: MigrateUpArgs['db']) {
  await db.execute(`
    INSERT INTO "role_management"
      ("label", "value", "active", "sort_order", "updated_at", "created_at")
    VALUES
      ('Super Admin', 'superadmin', true, 50, now(), now())
    ON CONFLICT ("value") DO UPDATE
    SET
      "label" = EXCLUDED."label",
      "active" = true,
      "sort_order" = EXCLUDED."sort_order",
      "updated_at" = now()
  `)
}

async function ensureSuperAdminPermissions(db: MigrateUpArgs['db']) {
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
    overrideAccess: true,
    req,
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
      overrideAccess: true,
      req,
    })
    return
  }

  await payload.create({
    collection: 'users',
    context: {
      skipRoleSelectionResolve: true,
    },
    data,
    overrideAccess: true,
    req,
  })
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await ensureUserRoleColumnIsText(args.db)
  await ensureSuperAdminRole(args.db)
  await ensureSuperAdminPermissions(args.db)
  await ensureSuperAdminUser(args)

  args.payload.logger.info(
    'Seeded superadmin role, full permissions, and default superadmin user.'
  )
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "role_module_visibility_role_permissions"
    WHERE "role" = 'superadmin';
  `)

  payload.logger.info(
    'Rolled back superadmin permission rows. Superadmin user and role records were left intact.'
  )
}
