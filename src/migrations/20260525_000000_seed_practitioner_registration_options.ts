import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

type CountrySeed = {
  label: string
  value: string
  states: string[]
  timezoneLabel: string
  timezoneValue: string
  currencySymbol: string
  currencyCode: string
}

const countries: CountrySeed[] = [
  {
    label: 'India',
    value: 'India',
    states: [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Delhi',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      'Other',
    ],
    timezoneLabel: 'India Standard Time (IST, UTC+5:30)',
    timezoneValue: 'Asia/Kolkata',
    currencySymbol: '₹',
    currencyCode: 'INR',
  },
  {
    label: 'United Arab Emirates',
    value: 'United Arab Emirates',
    states: ['Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain', 'Other'],
    timezoneLabel: 'Gulf Standard Time (GST, UTC+4:00)',
    timezoneValue: 'Asia/Dubai',
    currencySymbol: 'د.إ',
    currencyCode: 'AED',
  },
  {
    label: 'Saudi Arabia',
    value: 'Saudi Arabia',
    states: ['Al Madinah', 'Al Qassim', 'Eastern Province', 'Hail', 'Jazan', 'Makkah', 'Najran', 'Northern Borders', 'Riyadh', 'Tabuk', 'Al Bahah', 'Asir', 'Other'],
    timezoneLabel: 'Arabia Standard Time (AST, UTC+3:00)',
    timezoneValue: 'Asia/Riyadh',
    currencySymbol: '﷼',
    currencyCode: 'SAR',
  },
  {
    label: 'Qatar',
    value: 'Qatar',
    states: ['Al Doha', 'Al Khor', 'Al Rayyan', 'Al Shamal', 'Al Wakrah', 'Ash Shahaniyah', 'Dukhan', 'Mesaieed', 'Umm Salal', 'Other'],
    timezoneLabel: 'Arabia Standard Time (AST, UTC+3:00)',
    timezoneValue: 'Asia/Qatar',
    currencySymbol: 'ر.ق',
    currencyCode: 'QAR',
  },
  {
    label: 'Bahrain',
    value: 'Bahrain',
    states: ['Capital', 'Muharraq', 'Northern', 'Southern', 'Western', 'Other'],
    timezoneLabel: 'Arabia Standard Time (AST, UTC+3:00)',
    timezoneValue: 'Asia/Bahrain',
    currencySymbol: '.د.ب',
    currencyCode: 'BHD',
  },
  {
    label: 'Oman',
    value: 'Oman',
    states: ['Ad Dakhiliyah', 'Ad Dhahirah', 'Al Buraimi', 'Al Sharqiyah North', 'Al Sharqiyah South', 'Dhofar', 'Janub al Batinah', 'Musandam', 'Muscat', 'Shamal al Batinah', 'Other'],
    timezoneLabel: 'Gulf Standard Time (GST, UTC+4:00)',
    timezoneValue: 'Asia/Muscat',
    currencySymbol: 'ر.ع.',
    currencyCode: 'OMR',
  },
  {
    label: 'Kuwait',
    value: 'Kuwait',
    states: ['Al Ahmadi', 'Al Farwaniyah', 'Al Jahra', 'Al Kuwayt', 'Al Salimiyah', 'Hawalli', 'Mubarak Al Kabeer', 'Other'],
    timezoneLabel: 'Arabia Standard Time (AST, UTC+3:00)',
    timezoneValue: 'Asia/Kuwait',
    currencySymbol: 'د.ك',
    currencyCode: 'KWD',
  },
  {
    label: 'United States',
    value: 'United States',
    states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Other'],
    timezoneLabel: 'Eastern Time (ET, UTC-5:00)',
    timezoneValue: 'America/New_York',
    currencySymbol: '$',
    currencyCode: 'USD',
  },
  {
    label: 'Canada',
    value: 'Canada',
    states: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon', 'Other'],
    timezoneLabel: 'Eastern Time (Canada, UTC-5:00)',
    timezoneValue: 'America/Toronto',
    currencySymbol: '$',
    currencyCode: 'CAD',
  },
  {
    label: 'United Kingdom',
    value: 'United Kingdom',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Other'],
    timezoneLabel: 'Greenwich Mean Time (GMT, UTC+0:00)',
    timezoneValue: 'Europe/London',
    currencySymbol: '£',
    currencyCode: 'GBP',
  },
  {
    label: 'Australia',
    value: 'Australia',
    states: ['New South Wales', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia', 'Australian Capital Territory', 'Northern Territory', 'Other'],
    timezoneLabel: 'Australian Eastern Time (AET, UTC+10:00)',
    timezoneValue: 'Australia/Sydney',
    currencySymbol: '$',
    currencyCode: 'AUD',
  },
  {
    label: 'Other',
    value: 'Other',
    states: ['Other'],
    timezoneLabel: 'Coordinated Universal Time (UTC)',
    timezoneValue: 'UTC',
    currencySymbol: '$',
    currencyCode: 'USD',
  },
]

const specialties = [
  'Anxiety & Stress',
  'Trauma & PTSD',
  'Depression',
  'Grief & Loss',
  'Phobias & Fears',
  'Chronic Pain',
  'Relationships',
  'Self-Worth',
  'Performance',
  'Children & Teens',
  'Addictions',
  "Women's Health",
]

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function ensureSchema(db: MigrateUpArgs['db']) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "practitioner_registration_countries" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "value" varchar NOT NULL,
      "enabled" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 100,
      "timezone_label" varchar NOT NULL,
      "timezone_value" varchar NOT NULL,
      "currency_symbol" varchar NOT NULL,
      "currency_code" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "practitioner_registration_countries_states" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "value" varchar
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "practitioner_registration_specialties" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "value" varchar NOT NULL,
      "enabled" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 100,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `)

  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "practitioner_registration_countries_value_idx" ON "practitioner_registration_countries" USING btree ("value")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registration_countries_updated_at_idx" ON "practitioner_registration_countries" USING btree ("updated_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registration_countries_created_at_idx" ON "practitioner_registration_countries" USING btree ("created_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registration_countries_states_order_idx" ON "practitioner_registration_countries_states" USING btree ("_order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registration_countries_states_parent_id_idx" ON "practitioner_registration_countries_states" USING btree ("_parent_id")`)
  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "practitioner_registration_specialties_value_idx" ON "practitioner_registration_specialties" USING btree ("value")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registration_specialties_updated_at_idx" ON "practitioner_registration_specialties" USING btree ("updated_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "practitioner_registration_specialties_created_at_idx" ON "practitioner_registration_specialties" USING btree ("created_at")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "practitioner_registration_countries_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_practitioner_registration_countries_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioner_registration_countries_id")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "practitioner_registration_specialties_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_practitioner_registration_specialties_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioner_registration_specialties_id")`)
}

async function ensureRoleEnums(db: MigrateUpArgs['db']) {
  await db.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'enum_role_module_visibility_role_permissions_module'
      ) THEN
        ALTER TYPE "enum_role_module_visibility_role_permissions_module"
          ADD VALUE IF NOT EXISTS 'practitioner-registration-countries';
        ALTER TYPE "enum_role_module_visibility_role_permissions_module"
          ADD VALUE IF NOT EXISTS 'practitioner-registration-specialties';
      END IF;
    END $$;
  `)
}

async function seedCountries(db: MigrateUpArgs['db']) {
  for (const [countryIndex, country] of countries.entries()) {
    await db.execute(`
      INSERT INTO "practitioner_registration_countries"
        ("label", "value", "enabled", "sort_order", "timezone_label", "timezone_value", "currency_symbol", "currency_code", "updated_at", "created_at")
      VALUES (
        ${sqlString(country.label)},
        ${sqlString(country.value)},
        true,
        ${countryIndex + 1},
        ${sqlString(country.timezoneLabel)},
        ${sqlString(country.timezoneValue)},
        ${sqlString(country.currencySymbol)},
        ${sqlString(country.currencyCode)},
        now(),
        now()
      )
      ON CONFLICT ("value") DO UPDATE
      SET
        "label" = EXCLUDED."label",
        "enabled" = EXCLUDED."enabled",
        "sort_order" = EXCLUDED."sort_order",
        "timezone_label" = EXCLUDED."timezone_label",
        "timezone_value" = EXCLUDED."timezone_value",
        "currency_symbol" = EXCLUDED."currency_symbol",
        "currency_code" = EXCLUDED."currency_code",
        "updated_at" = now()
    `)

    await db.execute(`
      DELETE FROM "practitioner_registration_countries_states"
      WHERE "_parent_id" = (
        SELECT "id" FROM "practitioner_registration_countries"
        WHERE "value" = ${sqlString(country.value)}
        LIMIT 1
      )
    `)

    for (const [stateIndex, state] of country.states.entries()) {
      await db.execute(`
        INSERT INTO "practitioner_registration_countries_states"
          ("_order", "_parent_id", "id", "label", "value")
        SELECT
          ${stateIndex + 1},
          "id",
          ${sqlString(`${slugify(country.value)}-${slugify(state)}`)},
          ${sqlString(state)},
          ${sqlString(state)}
        FROM "practitioner_registration_countries"
        WHERE "value" = ${sqlString(country.value)}
        ON CONFLICT ("id") DO UPDATE
        SET
          "_order" = EXCLUDED."_order",
          "_parent_id" = EXCLUDED."_parent_id",
          "label" = EXCLUDED."label",
          "value" = EXCLUDED."value"
      `)
    }
  }
}

async function seedSpecialties(db: MigrateUpArgs['db']) {
  for (const [index, label] of specialties.entries()) {
    await db.execute(`
      INSERT INTO "practitioner_registration_specialties"
        ("label", "value", "enabled", "sort_order", "updated_at", "created_at")
      VALUES (
        ${sqlString(label)},
        ${sqlString(slugify(label))},
        true,
        ${index + 1},
        now(),
        now()
      )
      ON CONFLICT ("value") DO UPDATE
      SET
        "label" = EXCLUDED."label",
        "enabled" = EXCLUDED."enabled",
        "sort_order" = EXCLUDED."sort_order",
        "updated_at" = now()
    `)
  }
}

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await ensureSchema(db)
  await ensureRoleEnums(db)
  await seedCountries(db)
  await seedSpecialties(db)

  payload.logger.info('Seeded practitioner registration countries, states, and specialties.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "role_module_visibility_role_permissions"
    WHERE "module"::text IN (
      'practitioner-registration-countries',
      'practitioner-registration-specialties'
    )
  `)
  await db.execute(`DROP TABLE IF EXISTS "practitioner_registration_countries_states"`)
  await db.execute(`DROP TABLE IF EXISTS "practitioner_registration_countries"`)
  await db.execute(`DROP TABLE IF EXISTS "practitioner_registration_specialties"`)

  payload.logger.info('Rolled back practitioner registration option seed tables.')
}
