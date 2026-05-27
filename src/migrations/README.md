# CMS Migrations and Seed Workflow

This directory contains the tracked Payload CMS database migrations for `apps/cms`.

The migrations in [index.ts](/apps/cms/src/migrations/index.ts:1) are executed in order by Payload and are intended to be committed to the repository so the same schema and seed changes can be applied consistently across local, staging, and production environments.

The CMS `npm run migrate` command now performs two steps:

1. runs Payload schema/data migrations with `payload migrate`
2. runs `scripts/sync-seeds-if-changed.ts` to synchronize committed seed JSON only when seed content has changed

## What Lives Here

- `*.ts`
  TypeScript migration files with `up` and `down` functions.
- `*.json`
  Drizzle schema snapshots used by Payload to compute schema diffs.
- `index.ts`
  The migration registry. New migrations must be exported here to be runnable.
- `../../scripts/sync-seeds-if-changed.ts`
  Post-migration seed synchronization script. It is not a Payload migration file, so it intentionally lives in `apps/cms/scripts/`.

Shared helpers used by migrations should live outside this directory, for example in `src/lib/`, because Payload scans files here as executable migrations.

## Current Migration Roles

- `20260414_054916_update_existing_posts.ts`
  Data fix to update existing page slugs.
- `20260414_104656_import_pages_seed.ts`
  Production-oriented page import and seed migration.
- `20260414_174548_seed_header_footer_globals.ts`
  Header and footer global seeding.
- `20260429_090000_seed_all_collections.ts`
  Idempotent seed import for media and core content collections.

## Seed Synchronization

The current production seed workflow is split between reusable migration helpers and [../../scripts/sync-seeds-if-changed.ts](/apps/cms/scripts/sync-seeds-if-changed.ts:1).

The sync script is designed to be safer for production than a raw local dump because it:

- hashes all committed seed JSON files under [../seeds](/apps/cms/src/seeds)
- stores the last applied hash in Payload's `payload_kv` table using the key `cms_seed_content_hash`
- skips database writes when seed JSON content is unchanged
- upserts `sites` before creating or updating `pages`
- upserts seeded collections by stable keys such as `slug`, `email`, `title`, or media `filename`
- resolves media relationships by `filename` instead of local numeric IDs
- updates existing pages by `site` and `slug` so reruns are idempotent
- skips missing assets gracefully with warnings instead of failing immediately
- synchronizes media, site-aware collections, header/footer globals, and pages inside a transaction

## Common Commands

Run these from `apps/cms`.

```bash
npm run migrate
```

Applies all pending Payload migrations, then runs seed synchronization if committed seed JSON content changed.

```bash
npm run migrate:schema
```

Applies only pending Payload migrations. Use this when you intentionally do not want seed synchronization.

```bash
npm run sync:seeds
```

Runs only the seed hash check and synchronization script. Use this after seed JSON changes when the schema is already current.

```bash
npm run migrate:status
```

Shows migration status for the configured database.

```bash
npx payload migrate:create your_migration_name
```

Generates a new Payload migration and updates `index.ts`.

## Environment Requirements

These commands depend on the CMS environment variables, especially:

```bash
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=...
NEXT_PUBLIC_SERVER_URL=https://...
```

For local development, the values are usually loaded from `apps/cms/.env`.
For production, use the deployed environment configuration on the server.

## Recommended Migration Workflow

Use this sequence whenever CMS content has changed and you want to promote the latest local seed state.

### 1. Make schema or content changes locally

Update collections, globals, blocks, or seeded content in `src/`.

### 2. Generate a schema migration if the database structure changed

```bash
npx payload migrate:create describe_change
```

Review the generated `*.ts` and `*.json` files before continuing.

### 3. Export the latest local CMS content into seed files

Run this universal command from `apps/cms` to snapshot all defined CMS collections cleanly:

```bash
NODE_ENV=production npx tsx -r dotenv/config scripts/export-all.ts
```

*(Note: We run this in production mode to bypass Payload's development auto-schema synchronization, which can crash if there are orphaned database tables from old dev migrations or Postgres index length limits.)*

This script dynamically iterates over `payload.config.ts` and sequentially outputs seed files for all populated collections, including:

- `pages.json`, `header.json`, `footer.json`
- `media.json`, `gallery.json`
- `posts.json`, `trainings.json`
- `practitioners.json`, `leads.json`, etc.

Review the generated seed files before committing them.

### 4. Commit seed JSON changes

For content-only changes, commit the changed files in `src/seeds/`. You usually do not need a new Payload migration just to refresh existing seed content, because `scripts/sync-seeds-if-changed.ts` will detect and apply changed seed JSON.

Create or update a Payload migration only when:

- the database schema changed
- a one-time data repair is needed
- the deployment must perform a special operation that is not represented by seed JSON

Keep seed helpers and data migrations idempotent whenever possible.

### 5. Commit migration files and registry updates when schema changed

Make sure any new migration is exported in [index.ts](/apps/cms/src/migrations/index.ts:1). Content-only seed exports do not need an `index.ts` change.

### 6. Execute migrations and seed sync

Run the migration against the target environment:

```bash
npm run migrate
```

Payload will execute pending migrations in order, then the seed sync script will update media, collections, header/footer globals, and pages only if the seed hash changed.

If you need to run only the seed sync step:

```bash
npm run sync:seeds
```

## User Migration

The user seed migration is [20260414_173017_seed_admin_user.ts](/apps/cms/src/migrations/20260414_173017_seed_admin_user.ts).

It creates or updates a CMS admin user using environment variables:

```bash
CMS_ADMIN_EMAIL=pm@socialdnalabs.com
CMS_ADMIN_PASSWORD=Sdl@123456
CMS_ADMIN_NAME=Admin
```

This keeps credentials out of the committed migration file while still allowing the migration to run consistently across environments.

## Header/Footer Global Migration

The globals seed migration is [20260414_174548_seed_header_footer_globals.ts](/apps/cms/src/migrations/20260414_174548_seed_header_footer_globals.ts:1).

It seeds:

- `header` from [../seeds/header.json](../seeds/header.json:1)
- `footer` from [../seeds/footer.json](../seeds/footer.json:1)
- optional media references from [../seeds/media.json](../seeds/media.json:1)

Media import now runs by default for both page seeds and global seeds. The behavior can be configured with:

```bash
CMS_SEED_MEDIA_IMPORT=false
CMS_MEDIA_DIR=media
```

When `CMS_SEED_MEDIA_IMPORT` is not set, migrations import missing media files from disk before linking records. When it is explicitly set to `false`, the seed flow only links to media records that already exist in the target database.

## Notes and Conventions

- Prefer committed migrations over one-off SQL changes on the server.
- Treat `pages.json` as deployment seed input, not as an ad hoc backup.
- Avoid relying on local numeric IDs for relationships in seed data.
- When possible, resolve related records using stable values such as `slug`, `domain`, or media `filename`.
- Review `down` functions, but do not rely on them as a substitute for database backups in production.

## If Something Fails

- Check `DATABASE_URL` and connectivity first.
- Run `npm run migrate:status` to see which migration is pending.
- Inspect Payload logs for the specific migration name that failed.
- If the failure is data-related, compare production records with the seed file and migration assumptions.
