import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import fs from 'fs/promises'

async function exportPages() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const pages = await payload.find({
      collection: 'pages',
      limit: 100,
      depth: 5,
    })

    await fs.writeFile(
      './src/seeds/pages.json',
      JSON.stringify(pages.docs, null, 2),
      'utf-8'
    )

    console.log('Pages exported successfully → pages.json')
    process.exit(0)
  } catch (error) {
    console.error('Export failed:', error)
    process.exit(1)
  }
}

exportPages()
