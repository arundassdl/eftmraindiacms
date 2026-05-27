import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import fs from 'fs/promises'

async function exportGallery() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const gallery = await payload.find({
      collection: 'gallery',
      limit: 100,
      depth: 5,
    })

    await fs.writeFile(
      './src/seeds/gallery.json',
      JSON.stringify(gallery.docs, null, 2),
      'utf-8'
    )

    console.log('Gallery exported successfully → gallery.json')
    process.exit(0)
  } catch (error) {
    console.error('Export failed:', error)
    process.exit(1)
  }
}

exportGallery()
