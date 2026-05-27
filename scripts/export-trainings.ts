import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import fs from 'fs/promises'

async function exportTrainings() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const trainings = await payload.find({
      collection: 'trainings',
      limit: 100,
      depth: 5,
    })

    await fs.writeFile(
      './src/seeds/trainings.json',
      JSON.stringify(trainings.docs, null, 2),
      'utf-8'
    )

    console.log('Trainings exported successfully → trainings.json')
    process.exit(0)
  } catch (error) {
    console.error('Export failed:', error)
    process.exit(1)
  }
}

exportTrainings()
