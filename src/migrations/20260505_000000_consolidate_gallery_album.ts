import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

type GalleryImageRow = {
  image: number
  alt?: string | null
  caption?: string | null
}

type GalleryImageInput = Omit<GalleryImageRow, 'image'> & {
  image?: number | null
}

type GalleryRecord = {
  id: number
  title?: string | null
  slug?: string | null
  image?: number | null
  imageAlt?: string | null
  coverImage?: number | null
  coverImageAlt?: string | null
  images?: GalleryImageRow[] | null
  site?: number | null
}

type GalleryGroup = {
  title: string
  slug: string
  description: string
  displayOrder: number
  imageTitles: string[]
}

const legacyAlbumSlug = 'eftmra-india-gallery'

const galleryGroups: GalleryGroup[] = [
  {
    title: 'Held by Mridula in Bangalore',
    slug: 'held-by-mridula-in-bangalore',
    description:
      'Training event photos from sessions held by Mridula in Bangalore.',
    displayOrder: 1,
    imageTitles: [
      'WhatsApp Image 2022 07 29 at 1.17.22 PM',
      'WhatsApp Image 2022 07 29 at 1.10.02 PM 1',
      'WhatsApp Image 2022 07 29 at 1.10.02 PM',
      'WhatsApp Image 2022 07 29 at 1.17.22 PM 1',
    ],
  },
  {
    title: 'Held by Leena in Mumbai',
    slug: 'held-by-leena-in-mumbai',
    description:
      'Training event photos from sessions held by Leena in Mumbai.',
    displayOrder: 2,
    imageTitles: [
      'WhatsApp Image 2022 04 19 at 12.16.14 AM 1',
      'WhatsApp Image 2022 04 19 at 12.16.13 AM',
      'WhatsApp Image 2022 04 19 at 12.16.13 AM 1',
      'Leena web',
    ],
  },
  {
    title: 'Held by Dr. Shilpa Gupta in New Delhi',
    slug: 'held-by-dr-shilpa-gupta-in-new-delhi',
    description:
      'Training event photos from sessions held by Dr. Shilpa Gupta in New Delhi.',
    displayOrder: 3,
    imageTitles: [
      'WhatsApp Image 2022 07 04 at 7.59.51 PM 1',
      'WhatsApp Image 2022 07 04 at 7.59.51 PM',
      'WhatsApp Image 2022 07 04 at 7.59.52 PM 1',
      'WhatsApp Image 2022 07 04 at 7.59.52 PM',
    ],
  },
  {
    title: 'Held by Divya Srivastava in Mumbai',
    slug: 'held-by-divya-srivastava-in-mumbai',
    description:
      'Training event photos from sessions held by Divya Srivastava in Mumbai.',
    displayOrder: 4,
    imageTitles: [
      'WhatsApp Image 2022 07 25 at 1.50.05 PM',
      'WhatsApp Image 2022 07 25 at 1.50.05 PM 1',
      'WhatsApp Image 2022 07 25 at 1.50.05 PM 2',
      'WhatsApp Image 2022 07 25 at 1.50.06 PM',
    ],
  },
]

const galleryGroupSlugs = new Set(
  galleryGroups.map((group) => group.slug),
)

async function ensureGalleryAlbumSchema(db: MigrateUpArgs['db']) {
  await db.execute(`
    ALTER TABLE "gallery"
      ADD COLUMN IF NOT EXISTS "slug" varchar,
      ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'published',
      ADD COLUMN IF NOT EXISTS "site_id" integer,
      ADD COLUMN IF NOT EXISTS "image_id" integer,
      ADD COLUMN IF NOT EXISTS "image_alt" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar,
      ADD COLUMN IF NOT EXISTS "cover_image_alt" varchar,
      ADD COLUMN IF NOT EXISTS "cover_image_id" integer,
      ADD COLUMN IF NOT EXISTS "show_in_gallery_page" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "display_order" numeric,
      ADD COLUMN IF NOT EXISTS "training_id" integer
  `)

  await db.execute(`
    ALTER TABLE "gallery"
      ALTER COLUMN "image_id" DROP NOT NULL,
      ALTER COLUMN "image_alt" DROP NOT NULL
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "gallery_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "alt" varchar,
      "caption" varchar
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "gallery_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "practitioners_id" integer
    )
  `)

  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "gallery_slug_idx" ON "gallery" USING btree ("slug")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_site_idx" ON "gallery" USING btree ("site_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_image_idx" ON "gallery" USING btree ("image_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_cover_image_idx" ON "gallery" USING btree ("cover_image_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_training_idx" ON "gallery" USING btree ("training_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_images_order_idx" ON "gallery_images" USING btree ("_order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_images_parent_id_idx" ON "gallery_images" USING btree ("_parent_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_images_image_idx" ON "gallery_images" USING btree ("image_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_rels_order_idx" ON "gallery_rels" USING btree ("order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_rels_parent_idx" ON "gallery_rels" USING btree ("parent_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_rels_path_idx" ON "gallery_rels" USING btree ("path")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "gallery_rels_practitioners_id_idx" ON "gallery_rels" USING btree ("practitioners_id")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "pages_id" integer,
      ADD COLUMN IF NOT EXISTS "posts_id" integer,
      ADD COLUMN IF NOT EXISTS "categories_id" integer,
      ADD COLUMN IF NOT EXISTS "leads_id" integer,
      ADD COLUMN IF NOT EXISTS "trainings_id" integer,
      ADD COLUMN IF NOT EXISTS "training_registrations_id" integer,
      ADD COLUMN IF NOT EXISTS "practitioners_id" integer,
      ADD COLUMN IF NOT EXISTS "practitioner_contacts_id" integer,
      ADD COLUMN IF NOT EXISTS "practitioner_registrations_id" integer,
      ADD COLUMN IF NOT EXISTS "testimonials_id" integer,
      ADD COLUMN IF NOT EXISTS "practitioner_reviews_id" integer,
      ADD COLUMN IF NOT EXISTS "training_reviews_id" integer,
      ADD COLUMN IF NOT EXISTS "gallery_id" integer,
      ADD COLUMN IF NOT EXISTS "users_id" integer,
      ADD COLUMN IF NOT EXISTS "media_id" integer,
      ADD COLUMN IF NOT EXISTS "sites_id" integer
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_trainings_id_idx" ON "payload_locked_documents_rels" USING btree ("trainings_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_training_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("training_registrations_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_practitioners_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioners_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_practitioner_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioner_contacts_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_practitioner_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioner_registrations_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_practitioner_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("practitioner_reviews_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_training_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("training_reviews_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_gallery_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sites_id_idx" ON "payload_locked_documents_rels" USING btree ("sites_id")`)
}

function normalizeTitle(value?: string | null) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function addImage(
  images: GalleryImageRow[],
  seenImageIds: Set<string>,
  item: GalleryImageInput | null | undefined,
) {
  if (!item?.image) return

  const key = String(item.image)
  if (seenImageIds.has(key)) return

  seenImageIds.add(key)
  images.push({
    image: item.image,
    alt: item.alt,
    caption: item.caption,
  })
}

function addImageByTitle(
  imagesByTitle: Map<string, GalleryImageRow>,
  item: GalleryImageInput | null | undefined,
) {
  if (!item?.image) return

  const title = item.caption ?? item.alt
  const key = normalizeTitle(title)

  if (!key || imagesByTitle.has(key)) return

  imagesByTitle.set(key, {
    image: item.image,
    alt: item.alt,
    caption: item.caption,
  })
}

export async function up({
  db,
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  await ensureGalleryAlbumSchema(db)

  const gallery = await payload.find({
    collection: 'gallery',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
  })

  const docs = gallery.docs as GalleryRecord[]
  const sourceDocs = docs.filter(
    (doc) => !galleryGroupSlugs.has(doc.slug ?? ''),
  )
  const imagesByTitle = new Map<string, GalleryImageRow>()
  const fallbackImages: GalleryImageRow[] = []
  const seenFallbackImageIds = new Set<string>()

  for (const doc of sourceDocs) {
    for (const item of doc.images ?? []) {
      addImageByTitle(imagesByTitle, item)
      addImage(fallbackImages, seenFallbackImageIds, item)
    }

    const legacyImage = {
      image: doc.image ?? undefined,
      alt: doc.imageAlt,
      caption: doc.title,
    }

    addImageByTitle(imagesByTitle, legacyImage)
    addImage(fallbackImages, seenFallbackImageIds, legacyImage)
  }

  if (imagesByTitle.size === 0 && fallbackImages.length === 0) {
    payload.logger.info('No legacy gallery images found to group.')
    return
  }

  const firstSource = sourceDocs.find((doc) => doc.site) ?? sourceDocs[0]
  const site = firstSource?.site

  if (!site) {
    payload.logger.warn(
      'Could not group gallery images because no site relationship was found.',
    )
    return
  }

  let fallbackIndex = 0
  let groupedImageCount = 0

  for (const group of galleryGroups) {
    const existingAlbum = docs.find((doc) => doc.slug === group.slug)
    const images = group.imageTitles
      .map((title) => {
        const matched = imagesByTitle.get(normalizeTitle(title))

        if (matched) return matched

        const fallback = fallbackImages[fallbackIndex]
        fallbackIndex += 1
        return fallback
      })
      .filter((item): item is GalleryImageRow => Boolean(item?.image))

    if (images.length === 0) {
      payload.logger.warn(`No images found for ${group.title}.`)
      continue
    }

    groupedImageCount += images.length

    const data = {
      title: group.title,
      slug: group.slug,
      description: group.description,
      coverImage: images[0].image,
      coverImageAlt: images[0].alt ?? group.title,
      images,
      status: 'published' as const,
      site,
      training: null,
      showInGalleryPage: true,
      displayOrder: group.displayOrder,
    }

    if (existingAlbum) {
      await payload.update({
        collection: 'gallery',
        id: existingAlbum.id,
        data,
        overrideAccess: true,
        req,
      })
    } else {
      await payload.create({
        collection: 'gallery',
        data,
        overrideAccess: true,
        req,
      })
    }
  }

  for (const doc of sourceDocs) {
    await payload.update({
      collection: 'gallery',
      id: doc.id,
      data: {
        showInGalleryPage: false,
        displayOrder: null,
      },
      overrideAccess: true,
      req,
    })
  }

  payload.logger.info(
    `Grouped ${groupedImageCount} gallery images into ${galleryGroups.length} gallery albums.`,
  )
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // This migration intentionally preserves content. Legacy and grouped records
  // remain in the database and are only changed by a forward migration.
}
