# Payload CMS RBAC Setup - EFTMRA India

## Overview

Role-based access control is implemented with local Payload access functions, not an external plugin. This keeps the CMS compatible with Payload `3.81.0` and allows `npm install` to run without `--force` or `--legacy-peer-deps`.

The current RBAC implementation follows Payload's native access-control pattern: each collection/global operation is protected by an access function that returns `true`, `false`, or a query constraint. Module permissions are managed inside the admin panel through the `Role Module Visibility` global.

## User Roles

The `users` collection has a required `role` field:

- `editor`
- `manager`
- `admin`

New users default to `editor`.

## Permission Rules

Permissions are managed per role and per module with four operations:

- `Read / Show`
- `Create`
- `Update`
- `Delete`

`Read / Show` controls whether authenticated admin users can see and read the module. Public website reads and public form submissions are still handled separately by `publicRead`, `publishedOnly`, and `publicCreate`, so published content and public forms remain available to the frontend where intended.

Default permissions are defined in `apps/cms/src/access/rbac.ts` and seeded into Payload through `apps/cms/src/seeds/role-module-visibility.json`.

| Module | Editor | Manager | Admin |
|---|---|---|---|
| Pages | read, create, update | read, create, update, delete | full CRUD |
| Posts | read, create, update | read, create, update, delete | full CRUD |
| Categories | none | read, create, update | full CRUD |
| Media | read, create | full CRUD | full CRUD |
| Sites | none | none | full CRUD |
| Leads | none | read | full CRUD |
| Trainings | none | read, create, update | full CRUD |
| Training Registrations | none | read, update | full CRUD |
| Practitioners | none | read, create, update | full CRUD |
| Practitioner Registrations | none | read, update | full CRUD |
| Testimonials | read, create, update | read, create, update, delete | full CRUD |
| Practitioner Reviews | none | read, create, update | full CRUD |
| Training Reviews | none | read, create, update | full CRUD |
| Gallery | read | read, create, update | full CRUD |
| Header | none | read, update | full CRUD |
| Footer | none | read, update | full CRUD |
| Users | none | none | full CRUD |

## Globals

The following globals are registered in Payload:

- `header`
- `footer`
- `role-module-visibility`

`header` and `footer` keep public read access for the website. Authenticated admin-panel updates are controlled by the role/module permission matrix.

`role-module-visibility` is admin-only, so admins can always manage module permissions without accidentally locking themselves out of the permission screen.

## Configuration

- Access helpers: `apps/cms/src/access/rbac.ts`
- Role field: `apps/cms/src/collections/Users.ts`
- Permission wiring: `apps/cms/payload.config.ts`
- Permission global schema: `apps/cms/src/globals/RoleModuleVisibility.ts`
- Permission seed data: `apps/cms/src/seeds/role-module-visibility.json`
- Permission seed migration: `apps/cms/src/migrations/20260427_171600_seed_role_module_visibility.ts`
- Migration registry: `apps/cms/src/migrations/index.ts`

## Seed And Export Flow

The default module permission matrix is tracked as seed data and applied by migration:

```bash
npm run migrate
```

The migration upserts the `role-module-visibility` global with `overrideAccess: true`, making it safe to run before role permissions have been edited in the admin panel.

`apps/cms/scripts/export-all.ts` also exports `role-module-visibility`, so future local admin changes can be captured into `apps/cms/src/seeds/role-module-visibility.json` alongside `header` and `footer`.

## Verification

After the latest RBAC changes:

- `npm exec -- payload generate:types` passes.
- `npm run generate:importmap` passes.
- `npx tsc --noEmit --project tsconfig.json` still reports existing unrelated errors in:
  - `apps/cms/scripts/import-courses.ts`
  - `apps/cms/scripts/import-wordpress-blog.ts`
  - `apps/cms/src/migrations/20260424_151200_publish_existing_drafts.ts`

Do not reinstall `@nouance/payload-simple-rbac`; it declares a Payload v1 peer dependency and conflicts with Payload v3.
