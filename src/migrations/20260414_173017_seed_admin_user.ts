import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from '@payloadcms/db-postgres'

const ADMIN_EMAIL =
  process.env.CMS_ADMIN_EMAIL ??
  process.env.ADMIN_EMAIL
const ADMIN_PASSWORD =
  process.env.CMS_ADMIN_PASSWORD ??
  process.env.ADMIN_PASSWORD
const ADMIN_NAME =
  process.env.CMS_ADMIN_NAME ??
  'Admin'
const ADMIN_ROLE =
  process.env.CMS_ADMIN_ROLE ??
  'admin'

function assertAdminEnv() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'Missing CMS admin credentials. Set CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD before running this migration.'
    )
  }
}

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  assertAdminEnv()

  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: ADMIN_EMAIL,
      },
    },
    limit: 1,
    req,
  })

  if (existingUsers.docs[0]) {
    await payload.update({
      collection: 'users',
      id: existingUsers.docs[0].id,
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: ADMIN_PASSWORD,
        role: ADMIN_ROLE,
      } as never,
      req,
    })

    payload.logger.info(
      `Updated admin user: ${ADMIN_EMAIL}`
    )
    return
  }

  await payload.create({
    collection: 'users',
    data: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password: ADMIN_PASSWORD,
      role: ADMIN_ROLE,
    } as never,
    req,
  })

  payload.logger.info(
    `Created admin user: ${ADMIN_EMAIL}`
  )
}

export async function down({
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  if (!ADMIN_EMAIL) {
    payload.logger.warn(
      'CMS_ADMIN_EMAIL is not set; skipping admin user rollback.'
    )
    return
  }

  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: ADMIN_EMAIL,
      },
    },
    req,
  })

  for (const user of existingUsers.docs) {
    await payload.delete({
      collection: 'users',
      id: user.id,
      req,
    })
  }
}
