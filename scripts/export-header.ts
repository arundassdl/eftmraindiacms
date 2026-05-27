import 'dotenv/config'
import fs from 'fs/promises'
import { getPayload } from 'payload'

import configPromise from '../payload.config'

type SeedRecord = Record<string, unknown>

function isRecord(value: unknown): value is SeedRecord {
  return typeof value === 'object' && value !== null
}

function toSeedValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toSeedValue)
  }

  if (!isRecord(value)) {
    return value
  }

  if (typeof value.filename === 'string') {
    return {
      filename: value.filename,
      alt: typeof value.alt === 'string' ? value.alt : null,
    }
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) => !['id', 'createdAt', 'updatedAt'].includes(key)
      )
      .map(([key, nestedValue]) => [key, toSeedValue(nestedValue)])
  )
}

async function exportHeader() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const header = await payload.findGlobal({
      slug: 'header',
      depth: 5,
    })

    await fs.writeFile(
      new URL('../src/seeds/header.json', import.meta.url),
      JSON.stringify(toSeedValue(header), null, 2),
      'utf-8'
    )

    console.log(
      'Header exported successfully -> src/seeds/header.json'
    )
    process.exit(0)
  } catch (error) {
    console.error('Export failed:', error)
    process.exit(1)
  }
}

exportHeader()
