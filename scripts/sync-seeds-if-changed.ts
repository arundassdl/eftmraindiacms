import "dotenv/config";
import crypto from "crypto";
import fs from "fs/promises";
import {
  commitTransaction,
  createLocalReq,
  getPayload,
  initTransaction,
  killTransaction,
} from "payload";

import configPromise from "../payload.config";
import footerSeed from "../src/seeds/footer.json";
import gallerySeed from "../src/seeds/gallery.json";
import headerSeed from "../src/seeds/header.json";
import leadsSeed from "../src/seeds/leads.json";
import mediaSeed from "../src/seeds/media.json";
import pagesSeed from "../src/seeds/pages.json";
import postsSeed from "../src/seeds/posts.json";
import practitionerReviewsSeed from "../src/seeds/practitioner-reviews.json";
import practitionersSeed from "../src/seeds/practitioners.json";
import sitesSeed from "../src/seeds/sites.json";
import testimonialsSeed from "../src/seeds/testimonials.json";
import trainersSeed from "../src/seeds/trainers.json";
import trainingRegistrationsSeed from "../src/seeds/training-registrations.json";
import trainingReviewsSeed from "../src/seeds/training-reviews.json";
import trainingsSeed from "../src/seeds/trainings.json";
import { seedCollectionData, seedMediaCollection } from "../src/lib/seedCollectionData";
import { seedPages } from "../src/lib/seedPages";
import { up as seedHeaderFooterGlobals } from "../src/migrations/20260414_174548_seed_header_footer_globals";

process.env.PAYLOAD_MIGRATING ??= "true";

const SEED_SYNC_KEY = "cms_seed_content_hash";
const seedFiles = [
  "src/seeds/footer.json",
  "src/seeds/gallery.json",
  "src/seeds/header.json",
  "src/seeds/leads.json",
  "src/seeds/media.json",
  "src/seeds/pages.json",
  "src/seeds/posts.json",
  "src/seeds/practitioner-reviews.json",
  "src/seeds/practitioners.json",
  "src/seeds/sites.json",
  "src/seeds/testimonials.json",
  "src/seeds/trainers.json",
  "src/seeds/training-registrations.json",
  "src/seeds/training-reviews.json",
  "src/seeds/trainings.json",
];

type DbExecutor = {
  execute: (query: string) => Promise<{ rows?: unknown[] }>;
};
type SeedRecord = Record<string, unknown>;
type Payload = Awaited<ReturnType<typeof getPayload>>;

const trainingSlugs = new Set(
  (trainingsSeed as SeedRecord[])
    .map((training) => training.slug)
    .filter((slug): slug is string => typeof slug === "string"),
);

const matchingTrainingReviewsSeed = (trainingReviewsSeed as SeedRecord[]).filter((review) => {
  const training = review.training;
  return (
    training &&
    typeof training === "object" &&
    "slug" in training &&
    typeof training.slug === "string" &&
    trainingSlugs.has(training.slug)
  );
});

const collectionSeeds: {
  slug: string;
  seeds: SeedRecord[];
}[] = [
  { slug: "sites", seeds: sitesSeed as SeedRecord[] },
  { slug: "trainings", seeds: trainingsSeed as SeedRecord[] },
  { slug: "training-reviews", seeds: matchingTrainingReviewsSeed },
  { slug: "practitioners", seeds: practitionersSeed as SeedRecord[] },
  { slug: "practitioner-reviews", seeds: practitionerReviewsSeed as SeedRecord[] },
  { slug: "posts", seeds: postsSeed as SeedRecord[] },
  { slug: "testimonials", seeds: testimonialsSeed as SeedRecord[] },
  { slug: "trainers", seeds: trainersSeed as SeedRecord[] },
  { slug: "gallery", seeds: gallerySeed as SeedRecord[] },
  { slug: "leads", seeds: leadsSeed as SeedRecord[] },
  { slug: "training-registrations", seeds: trainingRegistrationsSeed as SeedRecord[] },
];

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function getDb(payload: Payload): DbExecutor {
  const payloadDb = payload.db as unknown as {
    drizzle?: DbExecutor;
    execute?: DbExecutor["execute"];
  };

  return payloadDb.drizzle ?? (payloadDb as DbExecutor);
}

async function getSeedHash() {
  const hash = crypto.createHash("sha256");

  for (const file of seedFiles) {
    hash.update(file);
    hash.update("\0");
    hash.update(await fs.readFile(new URL(`../${file}`, import.meta.url)));
    hash.update("\0");
  }

  return hash.digest("hex");
}

async function getStoredSeedHash(db: DbExecutor) {
  const result = await db.execute(`
    select "data"
    from "payload_kv"
    where "key" = ${sqlString(SEED_SYNC_KEY)}
    limit 1
  `);

  const row = result.rows?.[0] as { data?: { hash?: unknown } | string } | undefined;
  const data = typeof row?.data === "string" ? JSON.parse(row.data) : row?.data;

  return typeof data?.hash === "string" ? data.hash : null;
}

async function storeSeedHash(db: DbExecutor, hash: string) {
  const data = JSON.stringify({
    hash,
    syncedAt: new Date().toISOString(),
  });

  await db.execute(`
    insert into "payload_kv" ("key", "data")
    values (${sqlString(SEED_SYNC_KEY)}, ${sqlString(data)}::jsonb)
    on conflict ("key")
    do update set "data" = excluded."data"
  `);
}

async function ensureDynamicTrainerListingPageSchema(db: DbExecutor) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "pages_blocks_eftmra_trainer_listing" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "eyebrow" varchar DEFAULT 'Meet the Trainers',
      "title" varchar NOT NULL,
      "description" varchar,
      "show_only_enabled" boolean DEFAULT true,
      "limit" numeric DEFAULT 12,
      "sort" varchar DEFAULT 'displayOrder',
      "block_name" varchar
    );

    ALTER TABLE IF EXISTS "pages_blocks_eftmra_trainer_listing"
      ADD COLUMN IF NOT EXISTS "_order" integer,
      ADD COLUMN IF NOT EXISTS "_parent_id" integer,
      ADD COLUMN IF NOT EXISTS "_path" text,
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar DEFAULT 'Meet the Trainers',
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar,
      ADD COLUMN IF NOT EXISTS "show_only_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "limit" numeric DEFAULT 12,
      ADD COLUMN IF NOT EXISTS "sort" varchar DEFAULT 'displayOrder',
      ADD COLUMN IF NOT EXISTS "block_name" varchar;

    CREATE INDEX IF NOT EXISTS "pages_blocks_eftmra_trainer_listing_order_idx"
      ON "pages_blocks_eftmra_trainer_listing" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_eftmra_trainer_listing_parent_id_idx"
      ON "pages_blocks_eftmra_trainer_listing" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_eftmra_trainer_listing_path_idx"
      ON "pages_blocks_eftmra_trainer_listing" USING btree ("_path");

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_eftmra_trainer_listing" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_uuid" varchar,
      "eyebrow" varchar DEFAULT 'Meet the Trainers',
      "title" varchar NOT NULL,
      "description" varchar,
      "show_only_enabled" boolean DEFAULT true,
      "limit" numeric DEFAULT 12,
      "sort" varchar DEFAULT 'displayOrder',
      "block_name" varchar
    );

    ALTER TABLE IF EXISTS "_pages_v_blocks_eftmra_trainer_listing"
      ADD COLUMN IF NOT EXISTS "_order" integer,
      ADD COLUMN IF NOT EXISTS "_parent_id" integer,
      ADD COLUMN IF NOT EXISTS "_path" text,
      ADD COLUMN IF NOT EXISTS "_uuid" varchar,
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar DEFAULT 'Meet the Trainers',
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar,
      ADD COLUMN IF NOT EXISTS "show_only_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "limit" numeric DEFAULT 12,
      ADD COLUMN IF NOT EXISTS "sort" varchar DEFAULT 'displayOrder',
      ADD COLUMN IF NOT EXISTS "block_name" varchar;

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_eftmra_trainer_listing_order_idx"
      ON "_pages_v_blocks_eftmra_trainer_listing" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_eftmra_trainer_listing_parent_id_idx"
      ON "_pages_v_blocks_eftmra_trainer_listing" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_eftmra_trainer_listing_path_idx"
      ON "_pages_v_blocks_eftmra_trainer_listing" USING btree ("_path");

    ALTER TABLE IF EXISTS "pages_blocks_eftmra_certification"
      ADD COLUMN IF NOT EXISTS "use_dynamic_trainer_listing" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "show_only_enabled_trainers" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "trainer_limit" numeric DEFAULT 12,
      ADD COLUMN IF NOT EXISTS "trainer_sort" varchar DEFAULT 'displayOrder';

    ALTER TABLE IF EXISTS "_pages_v_blocks_eftmra_certification"
      ADD COLUMN IF NOT EXISTS "use_dynamic_trainer_listing" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "show_only_enabled_trainers" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "trainer_limit" numeric DEFAULT 12,
      ADD COLUMN IF NOT EXISTS "trainer_sort" varchar DEFAULT 'displayOrder';
  `);
}

async function syncSeedsIfChanged() {
  const payload = await getPayload({
    config: configPromise,
  });
  const rootDb = getDb(payload);
  const currentHash = await getSeedHash();
  const storedHash = await getStoredSeedHash(rootDb);

  if (storedHash === currentHash) {
    payload.logger.info("Seed JSON content unchanged. Skipping seed sync.");
    process.exit(0);
  }

  payload.logger.info("Seed JSON content changed. Synchronizing database content.");

  const req = await createLocalReq({}, payload);

  try {
    await initTransaction(req);

    const session = payload.db.sessions?.[await req.transactionID!];
    const db = (session?.db ?? rootDb) as DbExecutor;
    const mediaCache = new Map<string, number | string | null>();

    await seedMediaCollection(mediaSeed as SeedRecord[], { payload, req }, mediaCache);

    for (const collection of collectionSeeds) {
      await seedCollectionData(collection.slug, collection.seeds, { payload, req }, mediaCache);
    }

    await seedHeaderFooterGlobals({ db, payload, req } as never);
    await ensureDynamicTrainerListingPageSchema(db);
    await seedPages(pagesSeed as SeedRecord[], { payload, req });
    await storeSeedHash(db, currentHash);
    await commitTransaction(req);
  } catch (error) {
    await killTransaction(req);
    throw error;
  }

  payload.logger.info(
    `Seed JSON content synchronized: header (${Object.keys(headerSeed).length} keys), footer (${Object.keys(
      footerSeed,
    ).length} keys), media (${mediaSeed.length} items), pages (${pagesSeed.length} items), collections (${collectionSeeds.length}).`,
  );

  process.exit(0);
}

syncSeedsIfChanged().catch((error) => {
  console.error("Seed sync failed:", error);
  process.exit(1);
});
