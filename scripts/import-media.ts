import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import mediaSeed from '../src/seeds/media.json'

async function importMedia() {
  const payload = await getPayload({
    config: configPromise,
  })

  for (const item of mediaSeed as any[]) {
    const existing = await payload.find({
      collection: 'media',
      where: {
        filename: {
          equals: item.filename,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`Skipped: ${item.filename}`)
      continue
    }

    await payload.create({
      collection: 'media',
      data: {
        alt: item.alt,
      },
      filePath: `./public/media/${item.filename}`,
    })

    console.log(`Imported: ${item.filename}`)
  }

  process.exit(0)
}

importMedia()