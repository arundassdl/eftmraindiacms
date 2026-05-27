import 'dotenv/config'

process.env.PAYLOAD_MIGRATING ??= 'true'

import { getPayload } from 'payload'
import configPromise from '../payload.config'
import fs from 'fs/promises'
import path from 'path'

function isProjectCollection(slug: string) {
  return !slug.startsWith('payload-')
}

async function exportAll() {
  try {
    const config = await configPromise
    const collections = config.collections?.map(({ slug }) => slug).filter(isProjectCollection) ?? []
    const globals = config.globals?.map(({ slug }) => slug) ?? []

    const payload = await getPayload({
      config: configPromise,
    })

    const seedsDir = './src/seeds'
    await fs.mkdir(seedsDir, { recursive: true })

    for (const slug of collections) {
      try {
        console.log(`Exporting ${slug}...`)
        const result = await payload.find({
          collection: slug as any,
          limit: 1000,
          depth: 2,
        })

        if (result.docs.length > 0) {
          await fs.writeFile(
            path.join(seedsDir, `${slug}.json`),
            JSON.stringify(result.docs, null, 2),
            'utf-8'
          )
          console.log(`[✔] ${slug}.json (${result.docs.length} items)`)
        } else {
          console.log(`[-] ${slug} is empty (Skipping)`)
        }
      } catch (e) {
        console.error(`[x] Failed to export ${slug}:`, e)
      }
    }

    for (const slug of globals) {
      try {
        console.log(`Exporting globals/${slug}...`)
        const result = await payload.findGlobal({
          slug: slug as any,
          depth: 2,
        })

        await fs.writeFile(
          path.join(seedsDir, `${slug}.json`),
          JSON.stringify(result, null, 2),
          'utf-8'
        )

        console.log(`[✔] ${slug}.json`)
      } catch (e) {
        console.error(`[x] Failed to export globals/${slug}:`, e)
      }
    }

    console.log('All collections and globals exported successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Core export failed:', error)
    process.exit(1)
  }
}

exportAll()
